import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/workload/pods", "./routes/workload/pods.tsx"),
    route("/workload/deployments", "./routes/workload/deployments.tsx"),
    route("/workload/statefulsets", "./routes/workload/statefulsets.tsx"),
    route("/workload/replicasets", "./routes/workload/replicasets.tsx"),
    route("/workload/daemonsets", "./routes/workload/daemonsets.tsx"),
] satisfies RouteConfig;
