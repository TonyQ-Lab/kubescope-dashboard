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
	networkHandler *handlers.NetworkHandler,
	eventHandler *handlers.EventsHandler,
	storageHandler *handlers.StorageHandler,
) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	{
		// Workload
		api.GET("/nodes", nodeHandler.HandleGetNodes)
		api.GET("/namespaces", namespaceHandler.HandleGetNamespaces)
		api.GET("/pods", workloadHandler.HandleGetPods)
		api.GET("/deployments", workloadHandler.HandleGetDeployments)
		api.GET("/daemonsets", workloadHandler.HandleGetDaemonSets)
		api.GET("/replicasets", workloadHandler.HandleGetReplicaSets)
		api.GET("/statefulsets", workloadHandler.HandleGetStatefulSets)

		// Metrics
		api.GET("/nodemetrics", metricHandler.HandleNodeMetrics)
		api.GET("/podmetrics", metricHandler.HandlePodMetrics)

		// Network
		api.GET("/services", networkHandler.HandleGetServices)

		// Events
		api.GET("/events", eventHandler.HandleGetEvents)

		// Storage
		api.GET("/persistentvolumes", storageHandler.HandleGetPersistentVolumes)
		api.GET("/persistentvolumeclaims", storageHandler.HandleGetPersistentVolumeClaims)
		api.GET("/storageclasses", storageHandler.HandleGetStorageClasses)
	}

	return r
}
