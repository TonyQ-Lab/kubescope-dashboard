package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type EventsHandler struct {
	K8s *k8s.Manager
}

func (h *EventsHandler) HandleGetEvents(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	events, err := k8s.GetEvents(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}
