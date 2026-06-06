package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Kairos backend starting...")
	http.ListenAndServe(":8080", nil)
}
