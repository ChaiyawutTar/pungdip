package services

import (
	"context"
	"math/rand"
	"time"

	"github.com/ChaiyawutTar/pungdip/backend/internal/config"
	"github.com/ChaiyawutTar/pungdip/backend/internal/models"
	"github.com/ChaiyawutTar/pungdip/backend/internal/repository"
)

// LotteryService handles the lottery/spin logic
type LotteryService struct {
	config   *config.Config
	redis    *repository.RedisRepository
	postgres *repository.PostgresRepository
	rng      *rand.Rand
}

// NewLotteryService creates a new lottery service
func NewLotteryService(cfg *config.Config, redis *repository.RedisRepository, postgres *repository.PostgresRepository) *LotteryService {
	return &LotteryService{
		config:   cfg,
		redis:    redis,
		postgres: postgres,
		rng:      rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

// Spin performs a lottery spin for a user
func (s *LotteryService) Spin(ctx context.Context, instagramID string) (*models.SpinResult, error) {
	var prizeID string
	var prizeName string
	var wasLocked bool

	// Step 1: Check if there's a locked prize
	lockedPrize, err := s.redis.GetNextPrizeLock(ctx)
	if err != nil {
		return nil, err
	}

	if lockedPrize != "" {
		// Attempt to claim the locked prize
		stock, err := s.redis.DecrStock(ctx, lockedPrize)
		if err != nil {
			return nil, err
		}

		if stock >= 0 || stock == -1 { // stock == -1 means unlimited
			// Successfully claimed the locked prize
			prizeID = lockedPrize
			prizeName = s.getPrizeName(lockedPrize)
			wasLocked = true

			// Clear the lock
			s.redis.DeleteNextPrizeLock(ctx)
		} else {
			// Stock depleted, restore and fallback to random
			s.redis.IncrStock(ctx, lockedPrize)
			s.redis.DeleteNextPrizeLock(ctx)
			prizeID, prizeName = s.randomPrize()
		}
	} else {
		// Normal random selection
		prizeID, prizeName = s.randomPrize()
	}

	// Step 2: Log the transaction asynchronously
	log := models.SpinLog{
		InstagramID: instagramID,
		PrizeWon:    prizeID,
		PrizeName:   prizeName,
		WasLocked:   wasLocked,
		Timestamp:   time.Now(),
	}
	s.postgres.LogSpinAsync(log)

	return &models.SpinResult{
		Result:    prizeID,
		PrizeName: prizeName,
		IsLocked:  wasLocked,
	}, nil
}

// randomPrize selects a random prize based on probability weights
func (s *LotteryService) randomPrize() (string, string) {
	// Calculate total weight (only non-triggered prizes)
	var totalWeight int
	for _, prize := range s.config.Prizes {
		if !prize.IsTriggered {
			totalWeight += prize.Probability
		}
	}

	if totalWeight == 0 {
		return "NOTHING", "Better Luck Next Time"
	}

	// Generate random number
	roll := s.rng.Intn(totalWeight)

	// Find the prize
	var cumulative int
	for _, prize := range s.config.Prizes {
		if prize.IsTriggered {
			continue
		}
		cumulative += prize.Probability
		if roll < cumulative {
			return prize.ID, prize.Name
		}
	}

	// Fallback
	return "NOTHING", "Better Luck Next Time"
}

// getPrizeName returns the name for a prize ID
func (s *LotteryService) getPrizeName(prizeID string) string {
	for _, prize := range s.config.Prizes {
		if prize.ID == prizeID {
			return prize.Name
		}
	}
	return prizeID
}

// LockPrize sets the next spin to award a specific prize
func (s *LotteryService) LockPrize(ctx context.Context, prizeID string) error {
	return s.redis.SetNextPrizeLock(ctx, prizeID)
}

// GetLockStatus returns the current lock status
func (s *LotteryService) GetLockStatus(ctx context.Context) (*models.LockStatus, error) {
	locked, err := s.redis.GetNextPrizeLock(ctx)
	if err != nil {
		return nil, err
	}

	return &models.LockStatus{
		IsLocked:      locked != "",
		LockedPrizeID: locked,
	}, nil
}

// UnlockPrize removes any prize lock
func (s *LotteryService) UnlockPrize(ctx context.Context) error {
	return s.redis.DeleteNextPrizeLock(ctx)
}

// ResetStocks resets all stocks to default values
func (s *LotteryService) ResetStocks(ctx context.Context) error {
	return s.redis.ResetStocks(ctx)
}

// GetRecentLogs returns recent spin logs
func (s *LotteryService) GetRecentLogs(ctx context.Context, limit int) ([]models.SpinLog, error) {
	return s.postgres.GetRecentLogs(ctx, limit)
}

// GetStocks returns stock status for all limited prizes
func (s *LotteryService) GetStocks(ctx context.Context) ([]map[string]interface{}, error) {
	return s.redis.GetAllStocks(ctx)
}

// GetStats returns overall statistics
func (s *LotteryService) GetStats(ctx context.Context) (map[string]interface{}, error) {
	return s.postgres.GetStats(ctx)
}
