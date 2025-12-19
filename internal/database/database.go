package database

import (
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"

	"github.com/joshuabeny1999/soma/internal/models"
)

func InitDB(dbPath string) *gorm.DB {
	// Ensure data directory exists
	os.MkdirAll("./data", 0755)

	// Use glebarez/sqlite for CGO_ENABLED=0 support
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	db.AutoMigrate(&models.User{}, &models.Measurement{})

	return db
}
