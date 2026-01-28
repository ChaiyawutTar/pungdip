package handlers

import (
	"github.com/ChaiyawutTar/pungdip/backend/internal/models"
	"github.com/ChaiyawutTar/pungdip/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

// SpinHandler handles spin-related endpoints
type SpinHandler struct {
	lottery *services.LotteryService
}

// NewSpinHandler creates a new spin handler
func NewSpinHandler(lottery *services.LotteryService) *SpinHandler {
	return &SpinHandler{lottery: lottery}
}

// Spin handles POST /api/spin
func (h *SpinHandler) Spin(c *fiber.Ctx) error {
	var req models.SpinRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	if req.InstagramID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Success: false,
			Message: "Instagram ID is required",
		})
	}

	result, err := h.lottery.Spin(c.Context(), req.InstagramID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIResponse{
			Success: false,
			Message: "Failed to spin: " + err.Error(),
		})
	}

	return c.JSON(result)
}
