package k8s

import (
	"context"
	"log"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetEvents(client *kubernetes.Clientset, namespace string) ([]corev1.Event, error) {
	events, err := client.CoreV1().Events(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of Events: %v", err)
	}
	return events.Items, nil
}
