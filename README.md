Kubescope Dashboard
====================

## 🔎 Overview

A lightweight, open-source Kubernetes monitoring dashboard that runs in-cluster and queries metrics directly from the Kubernetes API Server.
Built with ReactJS and client-go. 

## ✨ Features

### Back-end (Go)
+ Built with Go 1.25+
+ Uses client-go to communicate with Kubernetes API
+ REST endpoint for:
    + Pod lists and status
    + Node info and resource usage
+ In-cluster authentication using ServiceAccount/RBAC

### Front-end (ReactJS)
+ WIP
+ Display information
+ Use TailwindCSS and ChartJS for visual appealing UI