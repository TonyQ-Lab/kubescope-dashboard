package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type MetricsHandler struct {
	K8s *k8s.Manager
}

func (h *MetricsHandler) HandleNodeMetrics(c *gin.Context) {
	metrics, err := h.K8s.MetricsClient.GetNodeMetrics()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, metrics)
}

func (h *MetricsHandler) HandlePodMetrics(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")
	metrics, err := h.K8s.MetricsClient.GetPodMetrics(ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}
