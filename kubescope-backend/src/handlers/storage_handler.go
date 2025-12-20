package handlers

import (
	"kubescope-backend/src/k8s"
	"net/http"

	"github.com/gin-gonic/gin"
)

type StorageHandler struct {
	K8s *k8s.Manager
}

func (h *StorageHandler) HandleGetPersistentVolumeClaims(c *gin.Context) {
	ns := c.DefaultQuery("namespace", "default")

	pvcs, err := k8s.GetPVCs(h.K8s.Clientset, ns)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pvcs)
}

func (h *StorageHandler) HandleGetPersistentVolumes(c *gin.Context) {
	pvs, err := k8s.GetPVs(h.K8s.Clientset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pvs)
}

func (h *StorageHandler) HandleGetStorageClasses(c *gin.Context) {
	storageclasses, err := k8s.GetStorageClasses(h.K8s.Clientset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, storageclasses)
}
