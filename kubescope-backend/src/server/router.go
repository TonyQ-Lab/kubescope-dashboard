package server

import (
	"kubescope-backend/src/handlers"

	"github.com/gin-gonic/gin"
)

func NewRouter(podHandler *handlers.PodHandler, nodeHandler *handlers.NodeHandler, metricHandler *handlers.MetricsHandler) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	{
		api.GET("/pods", podHandler.HandleGetPods)
		api.GET("/nodes", nodeHandler.HandleGetNodes)
	}

	return r
}
