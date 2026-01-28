package config

import (
	"os"
	"time"
)

// Prize represents a lottery prize
type Prize struct {
	ID          string
	Name        string
	Stock       int  // -1 means unlimited
	Probability int  // Weight for random selection (0 = only via trigger)
	IsTriggered bool // Can only be obtained via admin trigger
}

// Config holds application configuration
type Config struct {
	ServerPort  string
	RedisAddr   string
	PostgresURL string
	AdminSecret string
	Prizes      []Prize
}

// DefaultPrizes returns the default prize configuration
func DefaultPrizes() []Prize {
	return []Prize{
		{ID: "MK_DUCK", Name: "MK Duck Card", Stock: 5, Probability: 0, IsTriggered: true},
		{ID: "STARBUCKS", Name: "Starbucks Gift Card", Stock: 1, Probability: 0, IsTriggered: true},
		{ID: "DISCOUNT_10", Name: "10% Discount", Stock: -1, Probability: 15, IsTriggered: false},
		{ID: "DISCOUNT_05", Name: "5% Discount", Stock: -1, Probability: 35, IsTriggered: false},
		{ID: "NOTHING", Name: "Better Luck Next Time", Stock: -1, Probability: 50, IsTriggered: false},
	}
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		RedisAddr:   getEnv("REDIS_ADDR", "localhost:6379"),
		PostgresURL: getEnv("DATABASE_URL", "postgres://lottery:lottery123@localhost:5438/lottery?sslmode=disable"),
		AdminSecret: getEnv("ADMIN_SECRET", "admin_password"),
		Prizes:      DefaultPrizes(),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetCurrentTime returns the current time (useful for testing)
func GetCurrentTime() time.Time {
	return time.Now()
}
