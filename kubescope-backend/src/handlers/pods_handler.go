package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PodHandler struct {
	K8s *k8s.Manager
}

func (h *PodHandler) HandleGetPods(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	pods, err := k8s.GetPods(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pods)
}
