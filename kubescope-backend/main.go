package main

import (
	"fmt"
	"kubescope-backend/src/handlers"
	"kubescope-backend/src/k8s"
	"kubescope-backend/src/server"
	"os"
)

func main() {
	manager := k8s.NewManager()
	workloadHandler := handlers.WorkloadHandler{K8s: manager}
	namespaceHandler := handlers.NamespaceHandler{K8s: manager}
	nodeHandler := handlers.NodeHandler{K8s: manager}
	metricHandler := handlers.MetricsHandler{K8s: manager}

	r := server.NewRouter(&workloadHandler, &nodeHandler, &namespaceHandler, &metricHandler)

	var HOST = os.Getenv("HOST")
	if HOST == "" {
		HOST = "localhost"
	}
	var PORT = os.Getenv("PORT")
	if PORT == "" {
		PORT = "8088"
	}
	server := fmt.Sprintf("%s:%s", HOST, PORT)
	r.Run(server)
}
