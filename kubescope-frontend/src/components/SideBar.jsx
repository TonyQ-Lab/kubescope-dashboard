import { NavLink } from "react-router";
import { Link } from "react-router-dom";
import {
  Boxes,
  Server,
  Network,
  Database,
  Logs,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function SideBar() {
  const [openWorkloads, setOpenWorkloads] = useState(true);
  const [openNetworks, setOpenNetworks] = useState(false);
  const [openStorage, setOpenStorage] = useState(false);
  
  const workloadItems = [
    { label: "Pods", path: "/workload/pods" },
    { label: "Deployments", path: "/workload/deployments" },
    { label: "StatefulSets", path: "/workload/statefulsets" },
    { label: "ReplicaSets", path: "/workload/replicasets" },
    { label: "DaemonSets", path: "/workload/daemonsets" },
  ];

  const networkItems = [
    { label: "Services", path: "/network/services" },
  ]

  const storageItems = [
    { label: "PersistentVolumes", path: "/storage/persistentvolumes" },
    { label: "PersistentVolumeClaims", path: "/storage/persistentvolumeclaims" },
    { label: "StorageClasses", path: "/storage/storageclasses" },
  ]

  return (
     <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Link to="/" className="text-xl font-bold tracking-wide text-blue-500">KubeScope</Link>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {/* --- Collapsible Workloads Section --- */}
        <button
          onClick={() => setOpenWorkloads(isOpen => !isOpen)}
          className={`flex items-center w-full px-6 py-3 gap-3 hover:bg-gray-800/50 transition-colors 
            ${
              openWorkloads ? "text-gray-300" : "text-gray-400"
            }`
          }
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
          <div className="flex flex-col space-y-1">
            {workloadItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                 className={({ isActive }) =>
                  `
                    pl-14 px-3 py-2 text-sm rounded-md transition
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

        {/* --- Collapsible Network Section --- */}
        <button
          onClick={() => setOpenNetworks(isOpen => !isOpen)}
          className={`flex items-center w-full px-6 py-3 gap-3 hover:bg-gray-800/50 transition-colors 
            ${
              openNetworks ? "text-gray-300" : "text-gray-400"
            }`
          }
        >
          <Network size={20} />
          <span className="font-medium flex-1 text-left">Networking</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${
              openNetworks ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* --- Networking list --- */}
        {openNetworks && (
          <div className="flex flex-col space-y-1">
            {networkItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                 className={({ isActive }) =>
                  `
                    pl-14 px-3 py-2 text-sm rounded-md transition
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

        <NavLink
          to='/nodes'
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
          <Server size={20} />
          <span className="font-medium">Nodes</span>
        </NavLink>

        <NavLink
          to='/events'
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
          <Logs size={20} />
          <span className="font-medium">Events</span>
        </NavLink>

        {/* --- Collapsible Storage Section --- */}
        <button
          onClick={() => setOpenStorage(isOpen => !isOpen)}
          className={`flex items-center w-full px-6 py-3 gap-3 hover:bg-gray-800/50 transition-colors 
            ${
              openStorage ? "text-gray-300" : "text-gray-400"
            }`
          }
        >
          <Database size={20} />
          <span className="font-medium flex-1 text-left">Storage</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${
              openStorage ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* --- Children list --- */}
        {openStorage && (
          <div className="flex flex-col space-y-1">
            {storageItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                 className={({ isActive }) =>
                  `
                    pl-14 px-3 py-2 text-sm rounded-md transition
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

      </nav>
    </div>
  );
}
