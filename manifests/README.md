Installation
============

This folder includes Kubernetes manifests for installing the dashboard.

## 1. Creating a new namespace

```bash
kubectl create ns kubescope-dashboard
```

## 2. Create RBAC resources
These include ServiceAccount, ClusterRole and ClusterRoleBinding

```bash
kubectl apply -f rbac
```

## 3. Install dashboard components and its services
```bash
kubectl apply -f deployment -f service
```