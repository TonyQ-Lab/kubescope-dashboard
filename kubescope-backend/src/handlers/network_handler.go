package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type NetworkHandler struct {
	K8s *k8s.Manager
}

func (h *NetworkHandler) HandleGetServices(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	services, err := k8s.GetServices(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, services)
}
