package middleware

import (
	"net/http"
	"os"

	"github.com/rs/cors"
)

func CORS() func(http.Handler) http.Handler {
	origins := []string{"http://localhost:5174"}

	if extra := os.Getenv("ALLOWED_ORIGIN"); extra != "" {
		origins = append(origins, extra)
	}

	return cors.New(cors.Options{
		AllowedOrigins: origins,
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	}).Handler
}
