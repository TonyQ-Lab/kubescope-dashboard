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

func (h *NetworkHandler) HandleUpdateService(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")
	serviceName := c.Query("name")

	if serviceName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query param 'name' is required"})
		return
	}

	var req updateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body: " + err.Error()})
		return
	}

	// Convert YAML → JSON → type.
	// sigs.k8s.io/yaml is already a transitive k8s dependency.
	jsonBytes, err := yaml.YAMLToJSON([]byte(req.YAML))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid YAML: " + err.Error()})
		return
	}

	var service v1.Service
	if err := json.Unmarshal(jsonBytes, &service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "YAML does not represent a valid resource: " + err.Error()})
		return
	}

	// Guard: identity in the YAML must match the query params to prevent
	// accidental cross-namespace or cross-resource writes.
	if service.Namespace != ns {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("namespace mismatch: query has %q but YAML has %q", ns, service.Namespace),
		})
		return
	}
	if service.Name != serviceName {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("name mismatch: query has %q but YAML has %q", serviceName, service.Name),
		})
		return
	}

	updated, err := k8s.UpdateService(h.K8s.Clientset, ns, service)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update service: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, updated)
}
