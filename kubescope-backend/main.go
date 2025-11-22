package main

import (
	"fmt"
	"kubescope-backend/src/handlers"
	"kubescope-backend/src/k8s"
	"kubescope-backend/src/server"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading environment variables!")
	}

	manager := k8s.NewManager()
	podHandler := handlers.PodHandler{K8s: manager}
	nodeHandler := handlers.NodeHandler{K8s: manager}
	metricHandler := handlers.MetricsHandler{K8s: manager}

	r := server.NewRouter(&podHandler, &nodeHandler, &metricHandler)

	var HOST = os.Getenv("HOST")
	if HOST == "" {
		HOST = "localhost"
	}
	var PORT = os.Getenv("PORT")
	if PORT == "" {
		PORT = "8080"
	}
	r.Run(fmt.Sprintf("%s:%s", HOST, PORT))
}
