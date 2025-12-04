package k8s

import (
	"context"
	"log"

	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetStatefulSets(client *kubernetes.Clientset, namespace string) ([]appsv1.StatefulSet, error) {
	statefulsets, err := client.AppsV1().StatefulSets(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of deployments: %v", err)
	}
	return statefulsets.Items, nil
}
