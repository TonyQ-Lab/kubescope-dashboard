package k8s

import (
	"context"
	"log"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetNamespaces(client *kubernetes.Clientset) ([]v1.Namespace, error) {
	namespaces, err := client.CoreV1().Namespaces().List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of namespaces: %v", err)
	}
	return namespaces.Items, nil
}
