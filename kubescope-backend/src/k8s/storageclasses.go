package k8s

import (
	"context"
	"log"

	storagev1 "k8s.io/api/storage/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetStorageClasses(client *kubernetes.Clientset) ([]storagev1.StorageClass, error) {
	storageclasses, err := client.StorageV1().StorageClasses().List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get list of StorageClasses: %v", err)
	}
	return storageclasses.Items, nil
}
