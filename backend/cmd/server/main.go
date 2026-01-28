package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ChaiyawutTar/pungdip/backend/internal/config"
	"github.com/ChaiyawutTar/pungdip/backend/internal/handlers"
	"github.com/ChaiyawutTar/pungdip/backend/internal/repository"
	"github.com/ChaiyawutTar/pungdip/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if present
	godotenv.Load()

	// Load configuration
	cfg := config.Load()

	ctx := context.Background()

	// Initialize Redis
	log.Println("Connecting to Redis...")
	redisRepo, err := repository.NewRedisRepository(cfg.RedisAddr, cfg)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisRepo.Close()
	log.Println("✓ Connected to Redis")

	// Initialize stocks
	if err := redisRepo.InitializeStocks(ctx); err != nil {
		log.Printf("Warning: Failed to initialize stocks: %v", err)
	}

	// Initialize PostgreSQL
	log.Println("Connecting to PostgreSQL...")
	postgresRepo, err := repository.NewPostgresRepository(ctx, cfg.PostgresURL)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer postgresRepo.Close()
	log.Println("✓ Connected to PostgreSQL")

	// Initialize services
	lotteryService := services.NewLotteryService(cfg, redisRepo, postgresRepo)

	// Initialize handlers
	spinHandler := handlers.NewSpinHandler(lotteryService)
	adminHandler := handlers.NewAdminHandler(lotteryService, cfg)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Pangdip Lucky Draw",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "${time} | ${status} | ${latency} | ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// API routes
	api := app.Group("/api")

	// Public routes
	api.Post("/spin", spinHandler.Spin)

	// Admin routes
	admin := api.Group("/admin")
	admin.Post("/lock", adminHandler.Lock)
	admin.Post("/unlock", adminHandler.Unlock)
	admin.Post("/reset", adminHandler.Reset)
	admin.Get("/logs", adminHandler.GetLogs)
	admin.Get("/status", adminHandler.GetStatus)
	admin.Get("/stats", adminHandler.GetStats)
	admin.Get("/prizes", adminHandler.GetPrizes)

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down gracefully...")
		if err := app.Shutdown(); err != nil {
			log.Printf("Error during shutdown: %v", err)
		}
	}()

	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("🎰 Pangdip Lucky Draw server starting on %s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
