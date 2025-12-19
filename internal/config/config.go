package config

import (
	"fmt"
	"os"
)

type Config struct {
	JWTSecret   string
	Port        string
	DBPath      string
	Environment string
}

func LoadConfig() *Config {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		fmt.Println("⚠️  Warning: JWT_SECRET not set, using default dev secret. Set in .env for production.")
		jwtSecret = "dev-secret-change-me"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "data/soma.db"
	}

	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	return &Config{
		JWTSecret:   jwtSecret,
		Port:        port,
		DBPath:      dbPath,
		Environment: env,
	}
}
