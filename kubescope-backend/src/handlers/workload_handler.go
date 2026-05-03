package handlers

import (
	"encoding/json"
	"fmt"
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
	v1 "k8s.io/api/core/v1"
	"sigs.k8s.io/yaml"
)

type WorkloadHandler struct {
	K8s *k8s.Manager
}

// updateResourceRequest is the JSON body expected by HandleUpdatePod.
type updateResourceRequest struct {
	YAML string `json:"yaml" binding:"required"`
}

func (h *WorkloadHandler) HandleGetPods(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")
	podName := c.Query("name")

	if podName == "" {
		pods, err := k8s.GetPods(h.K8s.Clientset, ns)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, pods)
	} else {
		pod, err := k8s.GetPod(h.K8s.Clientset, ns, podName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, pod)
	}
}

func (h *WorkloadHandler) HandleUpdatePod(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")
	podName := c.Query("name")

	if podName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query param 'name' is required"})
		return
	}

	var req updateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body: " + err.Error()})
		return
	}

	// Convert YAML → JSON → typed Pod struct.
	// sigs.k8s.io/yaml is already a transitive k8s dependency.
	jsonBytes, err := yaml.YAMLToJSON([]byte(req.YAML))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid YAML: " + err.Error()})
		return
	}

	var pod v1.Pod
	if err := json.Unmarshal(jsonBytes, &pod); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "YAML does not represent a valid Pod: " + err.Error()})
		return
	}

	// Guard: identity in the YAML must match the query params to prevent
	// accidental cross-namespace or cross-resource writes.
	if pod.Namespace != ns {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("namespace mismatch: query has %q but YAML has %q", ns, pod.Namespace),
		})
		return
	}
	if pod.Name != podName {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("name mismatch: query has %q but YAML has %q", podName, pod.Name),
		})
		return
	}

	updated, err := k8s.UpdatePod(h.K8s.Clientset, ns, pod)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update pod: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (h *WorkloadHandler) HandleGetDeployments(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	deployments, err := k8s.GetDeployments(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, deployments)
}

func (h *WorkloadHandler) HandleGetReplicaSets(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	replicasets, err := k8s.GetReplicaSets(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, replicasets)
}

func (h *WorkloadHandler) HandleGetDaemonSets(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	daemonsets, err := k8s.GetDaemonSets(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, daemonsets)
}

func (h *WorkloadHandler) HandleGetStatefulSets(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	statefulsets, err := k8s.GetStatefulSets(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, statefulsets)
}
