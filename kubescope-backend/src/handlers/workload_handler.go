package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type WorkloadHandler struct {
	K8s *k8s.Manager
}

func (h *WorkloadHandler) HandleGetPods(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	pods, err := k8s.GetPods(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pods)
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
