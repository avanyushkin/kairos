package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"kairos/backend/handlers"
	"kairos/backend/middleware"
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
	r.Use(middleware.CORS())

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	})

	auth := handlers.NewAuthHandler(clientID)
	r.Post("/api/auth/google", auth.GoogleSignIn)

	handler := http.Handler(r)

	masked := clientID
	if len(masked) > 8 {
		masked = masked[:8] + "***"
	}
	fmt.Printf("Kairos backend listening on :%s  client_id=%s\n", port, masked)

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
