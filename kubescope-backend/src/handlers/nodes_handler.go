package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type NodeHandler struct {
	K8s *k8s.Manager
}

func (h *NodeHandler) HandleGetNodes(c *gin.Context) {
	nodes, err := k8s.GetNodes(h.K8s.Clientset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	c.JSON(http.StatusOK, nodes)
}
