package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"

	"github.com/joshuabeny1999/soma/internal/config"
	"github.com/joshuabeny1999/soma/internal/database"
	"github.com/joshuabeny1999/soma/internal/routes"
)

func main() {
	// Load configuration from .env
	cfg := config.LoadConfig()

	// Ensure data directory exists
	os.MkdirAll("./data", 0755)

	// Initialize database
	db := database.InitDB(cfg.DBPath)

	// Setup Gin router
	r := gin.Default()

	// Setup API routes
	routes.SetupRoutes(r, db, []byte(cfg.JWTSecret))

	// Serve Frontend Static Files
	// Assumes frontend is built into ./frontend/dist
	r.Use(static.Serve("/", static.LocalFile("./frontend/dist", true)))

	// SPA Fallback: If route not found (and not /api), serve index.html
	r.NoRoute(func(c *gin.Context) {
		if c.Request.Method == http.MethodGet && !isApiRoute(c.Request.URL.Path) {
			c.File("./frontend/dist/index.html")
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		}
	})

	// Start server
	fmt.Printf("🚀 Server starting on :%s in %s mode\n", cfg.Port, cfg.Environment)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func isApiRoute(path string) bool {
	return len(path) >= 4 && path[0:4] == "/api"
}
