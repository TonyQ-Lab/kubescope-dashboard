package server

import (
	"kubescope-backend/src/handlers"

	"github.com/gin-gonic/gin"
)

func NewRouter(
	workloadHandler *handlers.WorkloadHandler,
	nodeHandler *handlers.NodeHandler,
	namespaceHandler *handlers.NamespaceHandler,
	metricHandler *handlers.MetricsHandler,
) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	{
		api.GET("/nodes", nodeHandler.HandleGetNodes)
		api.GET("/namespaces", namespaceHandler.HandleGetNamespaces)
		api.GET("/pods", workloadHandler.HandleGetPods)
		api.GET("/deployments", workloadHandler.HandleGetDeployments)
		api.GET("/daemonsets", workloadHandler.HandleGetDaemonSets)
		api.GET("/replicasets", workloadHandler.HandleGetReplicaSets)
		api.GET("/statefulsets", workloadHandler.HandleGetStatefulSets)
	}

	return r
}
