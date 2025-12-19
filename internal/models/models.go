package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"uniqueIndex" json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
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

type SummaryResponse struct {
	ID           uint          `json:"id"`
	Username     string        `json:"username"`
	Measurements []Measurement `json:"measurements,omitempty"`
}
