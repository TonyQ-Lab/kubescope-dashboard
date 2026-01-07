---
icon: lucide/settings
---

# Deployment

There are 2 options to install KubeScope to your cluster:

+ Using [Helm](https://helm.sh), with the project repository chart *(recommended)*

+ Using `kubectl apply`, with raw YAML manifests

## Prerequisites

Make sure you have the following installed:

+ Kubernetes cluster (v1.30+ recommended)

+ kubectl configured

+ Helm (optional)

## Using Helm

If you have Helm, you can start by cloning the repository.

```console
git clone https://github.com/TonyQ-Lab/kubescope-dashboard.git
```

Move to the project's directory, and install the chart to a namespace of your choice.

```console
helm install kubescope charts/kubescope -n kubescope-dashboard --create-namespace
```

Access the web interface.

```console
kubectl port-forward svc/kubescope-frontend 8080:80 -n kubescope-dashboard
```

Now you can open your browser at http://localhost:8080 to view your dashboard.

## Using YAML manifests

Clone the repository, and move inside the manifest directory.
```console
git clone https://github.com/TonyQ-Lab/kubescope-dashboard.git

cd kubescope-dashboard/manifests
```

Creating a new namespace.
```console
kubectl create ns kubescope-dashboard
```

Create RBAC resources, these include ServiceAccount, ClusterRole and ClusterRoleBinding.
```console
kubectl apply -f rbac
```

Install dashboard components and its services.
```console
kubectl apply -f deployment -f service
```