package k8s

import (
	"context"
	"log"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetServices(client *kubernetes.Clientset, namespace string) ([]v1.Service, error) {
	services, err := client.CoreV1().Services(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of Services: %v", err)
	}
	for i := range services.Items {
		services.Items[i].TypeMeta = metav1.TypeMeta{
			Kind:       "Service",
			APIVersion: "v1",
		}
	}
	return services.Items, nil
}

func UpdateService(client *kubernetes.Clientset, namespace string, service v1.Service) (v1.Service, error) {
	updated, err := client.CoreV1().Services(namespace).Update(
		context.TODO(),
		&service,
		metav1.UpdateOptions{},
	)
	if err != nil {
		log.Fatalf("Failed to update Service: %v", err)
	}
	return *updated, nil
}
