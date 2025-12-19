package k8s

import (
	"context"
	"log"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetPVs(client *kubernetes.Clientset) ([]v1.PersistentVolume, error) {
	pvs, err := client.CoreV1().PersistentVolumes().List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get list of PVs: %v", err)
	}
	return pvs.Items, nil
}
