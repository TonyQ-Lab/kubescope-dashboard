package k8s

import (
	"context"
	"log"

	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetDeployments(client *kubernetes.Clientset, namespace string) ([]appsv1.Deployment, error) {
	deployments, err := client.AppsV1().Deployments(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of deployments: %v", err)
	}
	for i := range deployments.Items {
		deployments.Items[i].TypeMeta = metav1.TypeMeta{
			Kind:       "Deployment",
			APIVersion: "apps/v1",
		}
	}
	return deployments.Items, nil
}

func UpdateDeployment(client *kubernetes.Clientset, namespace string, deploy appsv1.Deployment) (appsv1.Deployment, error) {
	updated, err := client.AppsV1().Deployments(namespace).Update(
		context.TODO(),
		&deploy,
		metav1.UpdateOptions{},
	)
	if err != nil {
		log.Fatalf("Failed to update deployment: %v", err)
	}
	return *updated, nil
}
