# KubeScope Dashboard

A lightweight Kubernetes monitoring dashboard that runs in-cluster and queries metrics directly from the Kubernetes API Server.

![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-informational?style=flat-square) ![AppVersion: 1.0.0](https://img.shields.io/badge/AppVersion-1.0.0-informational?style=flat-square)

## Install Chart

```console
cd charts

helm install kubescope ./kubescope -n kubescope-dashboard --create-namespace
```