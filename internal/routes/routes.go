package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/joshuabeny1999/soma/internal/handlers"
	"github.com/joshuabeny1999/soma/internal/middleware"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, jwtSecret []byte) {
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, jwtSecret)
	userHandler := handlers.NewUserHandler(db)
	measurementHandler := handlers.NewMeasurementHandler(db)

	// Auth middleware
	authMiddleware := middleware.AuthMiddleware(jwtSecret)

	// API Routes
	api := r.Group("/api")
	{
		// Auth routes
		api.POST("/register", authHandler.Register)
		api.POST("/login", authHandler.Login)
		api.POST("/logout", authHandler.Logout)

		// Protected routes
		api.GET("/me", authMiddleware, userHandler.GetMe)

		// Measurements routes
		api.GET("/measurements", authMiddleware, measurementHandler.GetMeasurements)
		api.POST("/measurements", authMiddleware, measurementHandler.AddMeasurement)
		api.PUT("/measurements/:id", authMiddleware, measurementHandler.UpdateMeasurement)
		api.DELETE("/measurements/:id", authMiddleware, measurementHandler.DeleteMeasurement)
	}
}
