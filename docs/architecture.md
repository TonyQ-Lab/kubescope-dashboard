---
icon: lucide/server-cog
---

# Architecture

This diagram illustrates the architecture of KubeScope and its components:

![KubeScope Diagram](imgs/architecture_light.png#only-light){ align=center }
![KubeScope Diagram](imgs/architecture_dark.png#only-dark){ align=center }

## Connects to API Server

The back-end uses a client that communicates directly with the Kubernetes API Server using a service account with RBAC permissions.

No additional agents are required on worker nodes, except for kubelet itself.

## Collect cluster data

The client queries the Kubernetes API and retrieves data such as:

+ Nodes

+ Pods

+ Workload (Deployments, ReplicaSets, DaemonSets)

+ Network Services

+ Events

The back-end then exposed these data using a RESTful API layer for Front-end to fetch.

## Visualization

The front-end fetches data from back-end and visualize them in a clean, organized Web UI.