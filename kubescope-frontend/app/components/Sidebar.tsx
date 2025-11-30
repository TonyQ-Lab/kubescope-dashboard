import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Boxes,
  Server,
  Network,
  Database,
  Settings,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const [openWorkloads, setOpenWorkloads] = useState(true);
  
  const workloadItems = [
    { label: "Pods", path: "/workload/pods" },
    { label: "Deployments", path: "/workload/deployments" },
    { label: "StatefulSets", path: "/workload/statefulsets" },
    { label: "ReplicaSets", path: "/workload/replicasets" },
    { label: "DaemonSets", path: "/workload/daemonsets" },
  ];

  const otherItems = [
    // { label: "Overview", icon: <LayoutDashboard size={20} />, path: "/" },
    { label: "Nodes", icon: <Server size={20} />, path: "/nodes" },
    { label: "Networking", icon: <Network size={20} />, path: "/networking" },
    { label: "Storage", icon: <Database size={20} />, path: "/storage" },
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  return (
     <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wide">KubeScope</h1>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {/* --- Collapsible Workloads Section --- */}
        <button
          onClick={() => setOpenWorkloads(!openWorkloads)}
          className="flex items-center w-full px-6 py-3 gap-3 text-gray-300 hover:bg-gray-800/50 transition-colors"
        >
          <Boxes size={20} />
          <span className="font-medium flex-1 text-left">Workloads</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${
              openWorkloads ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* --- Children list --- */}
        {openWorkloads && (
          <div className="ml-12 flex flex-col space-y-1">
            {workloadItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                 className={({ isActive }) =>
                  `
                    px-3 py-2 text-sm rounded-md transition
                    ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800/40"
                    }
                  `
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* --- Non-collapsible items --- */}
        {otherItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
                flex items-center px-6 py-3 gap-3 cursor-pointer
                transition-colors 
                ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50"
                }
              `
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
