package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite" // Pure Go SQLite driver (CGO free)
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// --- CONFIG ---
var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

// --- DATABASE MODELS ---

type User struct {
	ID           uint          `gorm:"primaryKey" json:"id"`
	Username     string        `gorm:"uniqueIndex" json:"username"`
	PasswordHash string        `json:"-"`
	Measurements []Measurement `json:"measurements,omitempty"`
}

type Measurement struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"userId"`
	Date      string    `json:"date"` // Format YYYY-MM-DD
	Weight    float64   `json:"weight"`
	Chest     float64   `json:"chest"`
	Waist     float64   `json:"waist"`
	Arm       float64   `json:"arm"`
	Leg       float64   `json:"leg"`
	CreatedAt time.Time `json:"createdAt"`
}

// --- GLOBAL DB ---
var db *gorm.DB

func initDB() {
	var err error
	// Use glebarez/sqlite for CGO_ENABLED=0 support
	db, err = gorm.Open(sqlite.Open("data/soma.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database", err)
	}

	// Auto Migrate
	db.AutoMigrate(&User{}, &Measurement{})
}

// --- MIDDLEWARE ---

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("auth_token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userID", uint(claims["sub"].(float64)))
			c.Set("username", claims["username"])
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}
		c.Next()
	}
}

// --- HANDLERS ---

func register(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := User{Username: input.Username, PasswordHash: string(hashedPassword)}

	if result := db.Create(&user); result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Benutzername existiert bereits"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created"})
}

func login(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	if err := db.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Login fehlgeschlagen"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Login fehlgeschlagen"})
		return
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)

	// Set Cookie
	c.SetCookie("auth_token", tokenString, 3600*72, "/", "", false, true) // Secure=false for localhost, change in prod
	c.JSON(http.StatusOK, gin.H{"message": "Logged in", "username": user.Username})
}

func logout(c *gin.Context) {
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func getMe(c *gin.Context) {
	username, _ := c.Get("username")
	c.JSON(http.StatusOK, gin.H{"username": username})
}

func getMeasurements(c *gin.Context) {
	userID, _ := c.Get("userID")
	var measurements []Measurement
	db.Where("user_id = ?", userID).Order("date DESC").Find(&measurements)
	c.JSON(http.StatusOK, measurements)
}

func addMeasurement(c *gin.Context) {
	userID, _ := c.Get("userID")
	var m Measurement
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.UserID = userID.(uint)
	m.CreatedAt = time.Now()

	db.Create(&m)
	c.JSON(http.StatusOK, m)
}

func updateMeasurement(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	var m Measurement
	if err := db.Where("id = ? AND user_id = ?", id, userID).First(&m).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	var input Measurement
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

	db.Save(&m)
	c.JSON(http.StatusOK, m)
}

func deleteMeasurement(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	if err := db.Where("id = ? AND user_id = ?", id, userID).Delete(&Measurement{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// --- MAIN ---

func main() {
	if len(jwtSecret) == 0 {
		jwtSecret = []byte("dev-secret-change-me")
		fmt.Println("Warning: JWT_SECRET not set, using default.")
	}

	// Ensure data directory exists
	os.MkdirAll("./data", 0755)

	initDB()

	r := gin.Default()

	// API Routes
	api := r.Group("/api")
	{
		api.POST("/register", register)
		api.POST("/login", login)
		api.POST("/logout", logout)
		api.GET("/me", AuthMiddleware(), getMe)

		api.GET("/measurements", AuthMiddleware(), getMeasurements)
		api.POST("/measurements", AuthMiddleware(), addMeasurement)
		api.PUT("/measurements/:id", AuthMiddleware(), updateMeasurement)
		api.DELETE("/measurements/:id", AuthMiddleware(), deleteMeasurement)
	}

	// Serve Frontend Static Files
	// Assumes frontend is built into ./frontend/dist
	r.Use(static.Serve("/", static.LocalFile("./frontend/dist", true)))

	// SPA Fallback: If route not found (and not /api), serve index.html
	r.NoRoute(func(c *gin.Context) {
		if c.Request.Method == http.MethodGet &&
			!isApiRoute(c.Request.URL.Path) {
			c.File("./frontend/dist/index.html")
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}

func isApiRoute(path string) bool {
	return len(path) >= 4 && path[0:4] == "/api"
}
