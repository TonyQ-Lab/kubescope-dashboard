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
	for i := range daemonsets.Items {
		daemonsets.Items[i].TypeMeta = metav1.TypeMeta{
			Kind:       "DaemonSet",
			APIVersion: "apps/v1",
		}
	}
	return daemonsets.Items, nil
}

func UpdateDaemonSet(client *kubernetes.Clientset, namespace string, daemonset appsv1.DaemonSet) (appsv1.DaemonSet, error) {
	updated, err := client.AppsV1().DaemonSets(namespace).Update(
		context.TODO(),
		&daemonset,
		metav1.UpdateOptions{},
	)
	if err != nil {
		log.Fatalf("Failed to update DaemonSet: %v", err)
	}
	return *updated, nil
}
