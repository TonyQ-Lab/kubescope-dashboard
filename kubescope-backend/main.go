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
	networkHandler := handlers.NetworkHandler{K8s: manager}
	eventHandler := handlers.EventsHandler{K8s: manager}
	storageHandler := handlers.StorageHandler{K8s: manager}

	r := server.NewRouter(&workloadHandler, &nodeHandler, &namespaceHandler, &metricHandler, &networkHandler, &eventHandler, &storageHandler)

	var HOST = os.Getenv("HOST")
	if HOST == "" {
		HOST = "0.0.0.0"
	}
	var PORT = os.Getenv("PORT")
	if PORT == "" {
		PORT = "80"
	}
	server := fmt.Sprintf("%s:%s", HOST, PORT)
	r.Run(server)
}
