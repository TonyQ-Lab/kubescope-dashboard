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
import { useRef, useState } from "react";
import SubNavLink from "./SubNavLink";

export default function SideBar({ width, onResize }) {
  const [openWorkloads, setOpenWorkloads] = useState(true);
  const [openNetworks, setOpenNetworks] = useState(false);
  const [openStorage, setOpenStorage] = useState(false);

  const MINWIDTH = 220;
  const MAXWIDTH = 300;
  const isResizing = useRef(false);

  function onMouseDown() {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
  }

  function onMouseMove(e) {
    if (!isResizing.current)
      return;

    const newWidth = e.clientX;
    if (newWidth <= MAXWIDTH && newWidth >= MINWIDTH) {
      onResize(newWidth);
    }
  }

  function onMouseUp() {
    isResizing.current = false;
    document.body.style.cursor = "default";
  }

  // Attach listeners globally
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  
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
     <div className="relative bg-gray-900 border-r border-gray-800 flex flex-col" style={{ width }}>
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
              <SubNavLink item={item} />
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
              <SubNavLink item={item} />
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
              <SubNavLink item={item} />
            ))}
          </div>
        )}
      </nav>
      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        className="
          absolute top-0 right-0 h-full w-1
          cursor-col-resize
          hover:bg-blue-500/40
          transition
        "
      />
    </div>
  );
}
