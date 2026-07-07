package k8s

import (
	"context"
	"log"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetPods(client *kubernetes.Clientset, namespace string) ([]v1.Pod, error) {
	pods, err := client.CoreV1().Pods(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of pods: %v", err)
	}
	for i := range pods.Items {
		pods.Items[i].TypeMeta = metav1.TypeMeta{
			Kind:       "Pod",
			APIVersion: "v1",
		}
	}
	return pods.Items, nil
}

// Unused for now
func GetPod(client *kubernetes.Clientset, namespace string, name string) (v1.Pod, error) {
	pod, err := client.CoreV1().Pods(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		log.Fatalf("Failed to get the list of pods: %v", err)
	}
	pod.TypeMeta = metav1.TypeMeta{
		APIVersion: "v1",
		Kind:       "Pod",
	}
	return *pod, nil
}

func UpdatePod(client *kubernetes.Clientset, namespace string, pod v1.Pod) (v1.Pod, error) {
	updated, err := client.CoreV1().Pods(namespace).Update(
		context.TODO(),
		&pod,
		metav1.UpdateOptions{},
	)
	if err != nil {
		log.Fatalf("Failed to update pod: %v", err)
	}
	return *updated, nil
}
