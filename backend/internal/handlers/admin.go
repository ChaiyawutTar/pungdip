package handlers

import (
	"github.com/ChaiyawutTar/pungdip/backend/internal/config"
	"github.com/ChaiyawutTar/pungdip/backend/internal/models"
	"github.com/ChaiyawutTar/pungdip/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

// AdminHandler handles admin-related endpoints
type AdminHandler struct {
	lottery *services.LotteryService
	config  *config.Config
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler(lottery *services.LotteryService, cfg *config.Config) *AdminHandler {
	return &AdminHandler{
		lottery: lottery,
		config:  cfg,
	}
}

// Lock handles POST /api/admin/lock
func (h *AdminHandler) Lock(c *fiber.Ctx) error {
	var req models.LockRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	// Verify admin secret
	if req.Secret != h.config.AdminSecret {
		return c.Status(fiber.StatusUnauthorized).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid admin secret",
		})
	}

	if req.PrizeID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Success: false,
			Message: "Prize ID is required",
		})
	}

	// Validate prize ID
	validPrize := false
	for _, prize := range h.config.Prizes {
		if prize.ID == req.PrizeID {
			validPrize = true
			break
		}
	}
	if !validPrize {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid prize ID",
		})
	}

	if err := h.lottery.LockPrize(c.Context(), req.PrizeID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to lock prize: " + err.Error(),
		})
	}

	return c.JSON(models.APIResponse{
		Success: true,
		Message: "Prize locked for next spin: " + req.PrizeID,
	})
}

// Unlock handles POST /api/admin/unlock
func (h *AdminHandler) Unlock(c *fiber.Ctx) error {
	var req struct {
		Secret string `json:"secret"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	if req.Secret != h.config.AdminSecret {
		return c.Status(fiber.StatusUnauthorized).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid admin secret",
		})
	}

	if err := h.lottery.UnlockPrize(c.Context()); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to unlock: " + err.Error(),
		})
	}

	return c.JSON(models.APIResponse{
		Success: true,
		Message: "Prize lock removed",
	})
}

// Reset handles POST /api/admin/reset
func (h *AdminHandler) Reset(c *fiber.Ctx) error {
	var req struct {
		Secret string `json:"secret"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	if req.Secret != h.config.AdminSecret {
		return c.Status(fiber.StatusUnauthorized).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid admin secret",
		})
	}

	if err := h.lottery.ResetStocks(c.Context()); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to reset stocks: " + err.Error(),
		})
	}

	return c.JSON(models.APIResponse{
		Success: true,
		Message: "All stocks reset to default values",
	})
}

// GetLogs handles GET /api/admin/logs
func (h *AdminHandler) GetLogs(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	if limit > 100 {
		limit = 100
	}

	logs, err := h.lottery.GetRecentLogs(c.Context(), limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to fetch logs: " + err.Error(),
		})
	}

	return c.JSON(models.APIResponse{
		Success: true,
		Data:    logs,
	})
}

// GetStatus handles GET /api/admin/status
func (h *AdminHandler) GetStatus(c *fiber.Ctx) error {
	lockStatus, err := h.lottery.GetLockStatus(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to get lock status: " + err.Error(),
		})
	}

	stocks, err := h.lottery.GetStocks(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to get stocks: " + err.Error(),
		})
	}

	return c.JSON(models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"lock":   lockStatus,
			"stocks": stocks,
		},
	})
}

// GetStats handles GET /api/admin/stats
func (h *AdminHandler) GetStats(c *fiber.Ctx) error {
	stats, err := h.lottery.GetStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to get stats: " + err.Error(),
		})
	}

	return c.JSON(models.APIResponse{
		Success: true,
		Data:    stats,
	})
}

// GetPrizes handles GET /api/admin/prizes
func (h *AdminHandler) GetPrizes(c *fiber.Ctx) error {
	prizes := make([]map[string]interface{}, len(h.config.Prizes))
	for i, prize := range h.config.Prizes {
		prizes[i] = map[string]interface{}{
			"id":           prize.ID,
			"name":         prize.Name,
			"stock":        prize.Stock,
			"probability":  prize.Probability,
			"is_triggered": prize.IsTriggered,
		}
	}

	return c.JSON(models.APIResponse{
		Success: true,
		Data:    prizes,
	})
}
