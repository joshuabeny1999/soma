package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/joshuabeny1999/soma/internal/models"
)

type MeasurementHandler struct {
	db *gorm.DB
}

func NewMeasurementHandler(db *gorm.DB) *MeasurementHandler {
	return &MeasurementHandler{db: db}
}

func (h *MeasurementHandler) GetMeasurements(c *gin.Context) {
	userID, _ := c.Get("userID")
	var measurements []models.Measurement
	h.db.Where("user_id = ?", userID).Order("date DESC").Find(&measurements)
	c.JSON(http.StatusOK, measurements)
}

func (h *MeasurementHandler) AddMeasurement(c *gin.Context) {
	userID, _ := c.Get("userID")
	var m models.Measurement
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.UserID = userID.(uint)
	m.CreatedAt = time.Now()

	h.db.Create(&m)
	c.JSON(http.StatusOK, m)
}

func (h *MeasurementHandler) UpdateMeasurement(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	var m models.Measurement
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&m).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	var input models.Measurement
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	m.Date = input.Date
	m.Weight = input.Weight
	m.Chest = input.Chest
	m.Waist = input.Waist
	m.Arm = input.Arm
	m.Leg = input.Leg

	h.db.Save(&m)
	c.JSON(http.StatusOK, m)
}

func (h *MeasurementHandler) DeleteMeasurement(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	if err := h.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Measurement{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
