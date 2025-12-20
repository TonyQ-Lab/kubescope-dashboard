import { Boxes, Server, LayoutDashboard, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 lg:my-10 py-6 sm:py-10 space-y-12">

      {/* ---- Header ---- */}
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Welcome to <span className="text-blue-500">KubeScope</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl">
          A lightweight Kubernetes dashboard designed for real-time
          visibility into your cluster workloads, nodes, and resources —
          inspired by Lens, built for the web.
        </p>
      </div>

      {/* ---- Quick actions ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        <WelcomeCard
          title="Explore Workloads"
          description="View pods, deployments, and stateful applications running in your cluster."
          icon={<Boxes className="w-6 h-6 sm:w-7 sm:h-7" />}
          to="/workloads/pods"
        />

        <WelcomeCard
          title="View Nodes"
          description="Inspect cluster nodes, capacity, and scheduling status."
          icon={<Server className="w-6 h-6 sm:w-7 sm:h-7" />}
          to="/nodes"
        />

        <WelcomeCard
          title="Cluster Events"
          description="Monitor details of the latest event happening inside your cluster"
          icon={<LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7" />}
          to="/events"
          className="sm:col-span-2 lg:col-span-1"
        />

      </div>

      {/* ---- Footer hint ---- */}
      <div className="text-xs sm:text-sm text-gray-500 border-t border-gray-800 pt-4 sm:pt-6">
        Tip: Use the left sidebar to navigate resources. More features will
        appear here as your cluster grows.
      </div>
    </div>
  );
}

function WelcomeCard({
  title,
  description,
  icon,
  to,
  className = "",
}) {
  return (
    <Link
      to={to}
      className={`
        group rounded-xl border border-gray-800 bg-gray-900 
        p-4 sm:p-6
        hover:bg-gray-800/60 active:bg-gray-800/80 
        transition
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-blue-500">{icon}</div>
        <ArrowRight
          className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-500 group-hover:translate-x-1 transition"
        />
      </div>

      <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{description}</p>
    </Link>
  );
}