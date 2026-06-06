package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
)

type AuthHandler struct {
	clientID string
}

func NewAuthHandler(clientID string) *AuthHandler {
	return &AuthHandler{clientID: clientID}
}

type googleSignInRequest struct {
	Token string `json:"token"`
}

type tokenInfoResponse struct {
	Aud     string `json:"aud"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
	Error   string `json:"error"`
}

type userResponse struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func (h *AuthHandler) GoogleSignIn(w http.ResponseWriter, r *http.Request) {
	var req googleSignInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Token == "" {
		writeError(w, http.StatusBadRequest, "token is required")
		return
	}

	endpoint := "https://oauth2.googleapis.com/tokeninfo?id_token=" + url.QueryEscape(req.Token)
	resp, err := http.Get(endpoint)
	if err != nil {
		writeError(w, http.StatusBadGateway, "failed to reach Google")
		return
	}
	defer resp.Body.Close()

	var info tokenInfoResponse
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		writeError(w, http.StatusBadGateway, "invalid response from Google")
		return
	}

	if resp.StatusCode != http.StatusOK || info.Error != "" {
		writeError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	if info.Aud != h.clientID {
		writeError(w, http.StatusUnauthorized, "token audience mismatch")
		return
	}

	writeJSON(w, http.StatusOK, userResponse{
		Email:   info.Email,
		Name:    info.Name,
		Picture: info.Picture,
	})
}
