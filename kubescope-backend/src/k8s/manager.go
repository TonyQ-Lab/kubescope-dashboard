package k8s

import (
	"log"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type Manager struct {
	Clientset     *kubernetes.Clientset
	MetricsClient *MetricsManager
	Config        *rest.Config
}

func NewManager() *Manager {
	// load kubeconfig or in-cluster config
	config, err := rest.InClusterConfig()
	clientset := NewClientSet()
	metricsClient := NewMetricsManager()

	if err != nil {
		log.Fatalf("Failed to load in-cluster config! Kubescope must be run inside your cluster: %v", err)
	}

	return &Manager{
		Clientset:     clientset,
		MetricsClient: metricsClient,
		Config:        config,
	}
}
