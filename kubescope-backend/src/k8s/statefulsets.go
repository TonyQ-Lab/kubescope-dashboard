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
	for i := range statefulsets.Items {
		statefulsets.Items[i].TypeMeta = metav1.TypeMeta{
			Kind:       "StatefulSet",
			APIVersion: "apps/v1",
		}
	}
	return statefulsets.Items, nil
}

func UpdateStatefulSet(client *kubernetes.Clientset, namespace string, statefulset appsv1.StatefulSet) (appsv1.StatefulSet, error) {
	updated, err := client.AppsV1().StatefulSets(namespace).Update(
		context.TODO(),
		&statefulset,
		metav1.UpdateOptions{},
	)
	if err != nil {
		log.Fatalf("Failed to update StatefulSet: %v", err)
	}
	return *updated, nil
}
