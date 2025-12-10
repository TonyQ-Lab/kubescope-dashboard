package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type NamespaceHandler struct {
	K8s *k8s.Manager
}

func (h *NamespaceHandler) HandleGetNamespaces(c *gin.Context) {
	namespaces, err := k8s.GetNamespaces(h.K8s.Clientset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	c.JSON(http.StatusOK, namespaces)
}
