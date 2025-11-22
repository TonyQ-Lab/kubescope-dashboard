package k8s

// Inside-cluster

import (
	"log"
	"os"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

func NewClientSet() *kubernetes.Clientset {
	var config *rest.Config
	var err error

	if _, err = os.Stat("/var/run/secrets/kubernetes.io/serviceaccount/token"); err != nil {
		log.Fatalf("Failed to detect ServiceAccount token. Did you forget to provide a ServiceAccount? %v", err)
	}

	config, err = rest.InClusterConfig()
	if err != nil {
		log.Fatalf("Failed to load in-cluster config! Kubescope must be run inside your cluster: %v", err)
	}

	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("Failed to create ClientSet: %v", err)
	}

	return clientSet
}
