package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
)

func main() {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID == "" {
		log.Fatal("GOOGLE_CLIENT_ID environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := chi.NewRouter()
	r.Use(cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5174"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	}).Handler)

	handler := http.Handler(r)

	masked := clientID
	if len(masked) > 8 {
		masked = masked[:8] + "***"
	}
	fmt.Printf("Kairos backend listening on :%s  client_id=%s\n", port, masked)

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
