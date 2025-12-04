package k8s

import (
	"context"
	"log"

	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetDaemonSets(client *kubernetes.Clientset, namespace string) ([]appsv1.DaemonSet, error) {
	daemonsets, err := client.AppsV1().DaemonSets(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of daemonsets: %v", err)
	}
	return daemonsets.Items, nil
}
