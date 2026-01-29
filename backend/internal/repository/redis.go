package repository

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/ChaiyawutTar/pungdip/backend/internal/config"
	"github.com/redis/go-redis/v9"
)

const (
	// Redis key prefixes
	stockKeyPrefix = "stock:"
	lockKey        = "config:next_prize_lock"
)

// RedisRepository handles Redis operations
type RedisRepository struct {
	client *redis.Client
	config *config.Config
}

// NewRedisRepository creates a new Redis repository
func NewRedisRepository(addr string, cfg *config.Config) (*RedisRepository, error) {
	var opts *redis.Options
	var err error

	// Support Render's Redis URL format (redis://...)
	if strings.HasPrefix(addr, "redis://") || strings.HasPrefix(addr, "rediss://") {
		opts, err = redis.ParseURL(addr)
		if err != nil {
			return nil, fmt.Errorf("invalid redis url: %w", err)
		}
	} else {
		// Fallback to simple host:port
		opts = &redis.Options{
			Addr:     addr,
			Password: "", // No password for local
			DB:       0,
		}
	}

	client := redis.NewClient(opts)

	// Test connection
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	repo := &RedisRepository{
		client: client,
		config: cfg,
	}

	return repo, nil
}

// Close closes the Redis connection
func (r *RedisRepository) Close() error {
	return r.client.Close()
}

// InitializeStocks sets up initial stock values
func (r *RedisRepository) InitializeStocks(ctx context.Context) error {
	for _, prize := range r.config.Prizes {
		if prize.Stock > 0 {
			key := stockKeyPrefix + prize.ID
			if err := r.client.Set(ctx, key, prize.Stock, 0).Err(); err != nil {
				return fmt.Errorf("failed to set stock for %s: %w", prize.ID, err)
			}
		}
	}
	return nil
}

// ResetStocks resets all stocks to default values
func (r *RedisRepository) ResetStocks(ctx context.Context) error {
	// Clear any existing lock
	r.client.Del(ctx, lockKey)

	// Reset stocks
	return r.InitializeStocks(ctx)
}

// GetNextPrizeLock checks if there's a locked prize for the next spin
func (r *RedisRepository) GetNextPrizeLock(ctx context.Context) (string, error) {
	result, err := r.client.Get(ctx, lockKey).Result()
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to get lock: %w", err)
	}
	return result, nil
}

// SetNextPrizeLock sets the prize for the next spin
func (r *RedisRepository) SetNextPrizeLock(ctx context.Context, prizeID string) error {
	return r.client.Set(ctx, lockKey, prizeID, 0).Err()
}

// DeleteNextPrizeLock removes the lock after it's been used
func (r *RedisRepository) DeleteNextPrizeLock(ctx context.Context) error {
	return r.client.Del(ctx, lockKey).Err()
}

// DecrStock atomically decrements stock and returns the new value
// Returns -1 if key doesn't exist (unlimited stock)
func (r *RedisRepository) DecrStock(ctx context.Context, prizeID string) (int64, error) {
	key := stockKeyPrefix + prizeID

	// Check if key exists first
	exists, err := r.client.Exists(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to check stock existence: %w", err)
	}

	if exists == 0 {
		// No stock tracking for this prize (unlimited)
		return -1, nil
	}

	// Atomic decrement
	result, err := r.client.Decr(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to decrement stock: %w", err)
	}

	return result, nil
}

// IncrStock atomically increments stock (used to restore stock if needed)
func (r *RedisRepository) IncrStock(ctx context.Context, prizeID string) error {
	key := stockKeyPrefix + prizeID
	return r.client.Incr(ctx, key).Err()
}

// GetStock returns current stock for a prize
func (r *RedisRepository) GetStock(ctx context.Context, prizeID string) (int, error) {
	key := stockKeyPrefix + prizeID

	result, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return -1, nil // Unlimited
	}
	if err != nil {
		return 0, fmt.Errorf("failed to get stock: %w", err)
	}

	stock, err := strconv.Atoi(result)
	if err != nil {
		return 0, fmt.Errorf("invalid stock value: %w", err)
	}

	return stock, nil
}

// GetAllStocks returns stock status for all limited prizes
func (r *RedisRepository) GetAllStocks(ctx context.Context) ([]map[string]interface{}, error) {
	var stocks []map[string]interface{}

	for _, prize := range r.config.Prizes {
		if prize.Stock > 0 {
			stock, err := r.GetStock(ctx, prize.ID)
			if err != nil {
				stock = 0
			}
			stocks = append(stocks, map[string]interface{}{
				"prize_id": prize.ID,
				"name":     prize.Name,
				"stock":    stock,
				"max":      prize.Stock,
			})
		}
	}

	return stocks, nil
}
