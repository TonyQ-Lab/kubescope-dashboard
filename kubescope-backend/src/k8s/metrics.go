package k8s

import (
	"context"
	"log"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
	metrics "k8s.io/metrics/pkg/client/clientset/versioned"
)

type MetricsManager struct {
	Client *metrics.Clientset
}

func NewMetricsManager() *MetricsManager {
	config, err := rest.InClusterConfig()
	if err != nil {
		log.Fatalf("Failed to load in-cluster config! Kubescope must be run inside your cluster: %v", err)
	}

	client, _ := metrics.NewForConfig(config)
	return &MetricsManager{Client: client}
}

func (m *MetricsManager) GetNodeMetrics() (interface{}, error) {
	return m.Client.MetricsV1beta1().NodeMetricses().List(context.Background(), metav1.ListOptions{})
}

func (m *MetricsManager) GetPodMetrics(ns string) (interface{}, error) {
	return m.Client.MetricsV1beta1().PodMetricses(ns).List(context.Background(), metav1.ListOptions{})
}
