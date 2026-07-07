package k8s

import (
	"context"
	"log"

	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetReplicaSets(client *kubernetes.Clientset, namespace string) ([]appsv1.ReplicaSet, error) {
	replicasets, err := client.AppsV1().ReplicaSets(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of statefulsets: %v", err)
	}
	for i := range replicasets.Items {
		replicasets.Items[i].TypeMeta = metav1.TypeMeta{
			Kind:       "ReplicaSet",
			APIVersion: "apps/v1",
		}
	}
	return replicasets.Items, nil
}

func UpdateReplicaSet(client *kubernetes.Clientset, namespace string, replicaset appsv1.ReplicaSet) (appsv1.ReplicaSet, error) {
	updated, err := client.AppsV1().ReplicaSets(namespace).Update(
		context.TODO(),
		&replicaset,
		metav1.UpdateOptions{},
	)
	if err != nil {
		log.Fatalf("Failed to update ReplicaSet: %v", err)
	}
	return *updated, nil
}
