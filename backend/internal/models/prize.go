package models

import "time"

// SpinRequest represents an incoming spin request
type SpinRequest struct {
	InstagramID string `json:"instagram_id"`
}

// SpinResult represents the result of a spin
type SpinResult struct {
	Result    string `json:"result"`
	PrizeName string `json:"prize_name"`
	IsLocked  bool   `json:"is_locked,omitempty"`
}

// SpinLog represents a logged spin transaction
type SpinLog struct {
	ID          int64     `json:"id"`
	InstagramID string    `json:"instagram_id"`
	PrizeWon    string    `json:"prize_won"`
	PrizeName   string    `json:"prize_name"`
	WasLocked   bool      `json:"was_locked"`
	Timestamp   time.Time `json:"timestamp"`
}

// LockRequest represents an admin lock request
type LockRequest struct {
	PrizeID string `json:"prize_id"`
	Secret  string `json:"secret"`
}

// LockStatus represents the current lock status
type LockStatus struct {
	IsLocked      bool   `json:"is_locked"`
	LockedPrizeID string `json:"locked_prize_id,omitempty"`
}

// StockStatus represents stock information
type StockStatus struct {
	PrizeID string `json:"prize_id"`
	Stock   int    `json:"stock"`
}

// APIResponse is a generic API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}
