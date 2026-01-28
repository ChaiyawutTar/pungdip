package repository

import (
	"context"
	"fmt"

	"github.com/ChaiyawutTar/pungdip/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresRepository handles PostgreSQL operations
type PostgresRepository struct {
	pool *pgxpool.Pool
}

// NewPostgresRepository creates a new PostgreSQL repository
func NewPostgresRepository(ctx context.Context, connString string) (*PostgresRepository, error) {
	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	// Test connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping PostgreSQL: %w", err)
	}

	repo := &PostgresRepository{pool: pool}

	// Initialize schema
	if err := repo.initSchema(ctx); err != nil {
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	return repo, nil
}

// Close closes the database connection pool
func (r *PostgresRepository) Close() {
	r.pool.Close()
}

// initSchema creates the necessary tables
func (r *PostgresRepository) initSchema(ctx context.Context) error {
	schema := `
		CREATE TABLE IF NOT EXISTS spin_logs (
			id SERIAL PRIMARY KEY,
			instagram_id VARCHAR(255) NOT NULL,
			prize_won VARCHAR(50) NOT NULL,
			prize_name VARCHAR(255) NOT NULL,
			was_locked BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);
		
		CREATE INDEX IF NOT EXISTS idx_spin_logs_instagram ON spin_logs(instagram_id);
		CREATE INDEX IF NOT EXISTS idx_spin_logs_created_at ON spin_logs(created_at DESC);
	`

	_, err := r.pool.Exec(ctx, schema)
	return err
}

// LogSpinAsync logs a spin transaction asynchronously
func (r *PostgresRepository) LogSpinAsync(log models.SpinLog) {
	go func() {
		ctx := context.Background()
		r.LogSpin(ctx, log)
	}()
}

// LogSpin logs a spin transaction synchronously
func (r *PostgresRepository) LogSpin(ctx context.Context, log models.SpinLog) error {
	query := `
		INSERT INTO spin_logs (instagram_id, prize_won, prize_name, was_locked, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.pool.Exec(ctx, query, log.InstagramID, log.PrizeWon, log.PrizeName, log.WasLocked, log.Timestamp)
	if err != nil {
		fmt.Printf("Failed to log spin: %v\n", err)
		return err
	}

	return nil
}

// GetRecentLogs fetches the most recent spin logs
func (r *PostgresRepository) GetRecentLogs(ctx context.Context, limit int) ([]models.SpinLog, error) {
	query := `
		SELECT id, instagram_id, prize_won, prize_name, was_locked, created_at
		FROM spin_logs
		ORDER BY created_at DESC
		LIMIT $1
	`

	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch logs: %w", err)
	}
	defer rows.Close()

	var logs []models.SpinLog
	for rows.Next() {
		var log models.SpinLog
		if err := rows.Scan(&log.ID, &log.InstagramID, &log.PrizeWon, &log.PrizeName, &log.WasLocked, &log.Timestamp); err != nil {
			return nil, fmt.Errorf("failed to scan log: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, nil
}

// GetSpinCountByUser gets the number of spins for a specific user
func (r *PostgresRepository) GetSpinCountByUser(ctx context.Context, instagramID string) (int, error) {
	query := `SELECT COUNT(*) FROM spin_logs WHERE instagram_id = $1`

	var count int
	err := r.pool.QueryRow(ctx, query, instagramID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get spin count: %w", err)
	}

	return count, nil
}

// GetStats returns overall statistics
func (r *PostgresRepository) GetStats(ctx context.Context) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total spins
	var totalSpins int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM spin_logs").Scan(&totalSpins)
	if err != nil {
		return nil, err
	}
	stats["total_spins"] = totalSpins

	// Spins by prize
	rows, err := r.pool.Query(ctx, `
		SELECT prize_won, COUNT(*) as count 
		FROM spin_logs 
		GROUP BY prize_won 
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	prizeStats := make(map[string]int)
	for rows.Next() {
		var prizeID string
		var count int
		if err := rows.Scan(&prizeID, &count); err != nil {
			continue
		}
		prizeStats[prizeID] = count
	}
	stats["by_prize"] = prizeStats

	return stats, nil
}
