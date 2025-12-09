import { useEffect, useState } from "react";
import { getNamespaces, getDeployments } from "../api/index";
import { ChevronDown } from "lucide-react";

export default function DeploysPage() {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [namespaces, setNamespaces] = useState([
      "default"
    ])
    const [currentNs, setCurrentNS] = useState("default");

    useEffect(() => {
      fetchNamespaces();
    }, [])

    useEffect(() => {
      fetchDeployments();
    }, [currentNs])

    async function fetchDeployments() {
      try {
          setLoading(true);
          // Replace this with your Go backend call
          const data = await getDeployments(currentNs);
          // console.log(data);
          if (data !== null) {
            setDeployments(data);
          } else {
            setDeployments([]);
          }
      } catch (err) {
          console.error("Failed to fetch pods:", err);
      } finally {
          setLoading(false);
      }
    }

    async function fetchNamespaces() {
      let nslist = [];
      try {
          setLoading(true);
          const data = await getNamespaces();
          data.forEach(ns => {
            nslist.push(ns.metadata.name);
          });
          // console.log(nslist);
          setNamespaces(nslist);
      } catch (err) {
          console.error("Failed to fetch namespaces:", err);
      } finally {
          setLoading(false);
      }
    }

    function countAge(deployment) {
      const now = new Date();
      const pastTimestamp = new Date(deployment.metadata.creationTimestamp);

      const timeDifference = now.getTime() - pastTimestamp.getTime();
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (years > 0) {
          return `${years}y`;
      } else if (months > 0) {
          return `${months}m`;
      } else if (weeks > 0) {
          return `${weeks}w`;
      } else if (days > 0) {
          return `${days}d`;
      } else if (hours > 0) {
          return `${hours}h`;
      } else if (minutes > 0) {
          return `${minutes}m`;
      } else {
          return `${seconds}s`;
      }
    }

    function statusColor(status) {
      switch (status) {
        case "Running":
        case "Available":
            return "bg-green-500/20 text-green-400";
        case "Pending":
        case "Progressing":
            return "bg-yellow-500/20 text-yellow-400";
        case "CrashLoopBackOff":
        case "ReplicaFailure":
            return "bg-red-500/20 text-red-400";
        default:
            return "bg-gray-500/20 text-gray-400";
      }
    }

    function getCondition(deployment) {
        let available = false;
        let progressing = false;
        let conditions = deployment.status.conditions;

        for (const condi of conditions) {
            if (condi.type === "Available" && condi.status === "True") {
                available = true;
            }
            if (condi.type === "Progressing" && condi.status === "True") {
                progressing = true;
            }
        }
        if (available === true) {
            return "Available";
        } else if (progressing === true) {
            return "Progressing"
        } else {
            return "ReplicaFailure"
        }
    }

    return (
    <div className="space-y-6 p-4 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Deployments</h2>
        <div>
          <p className="text-lg">{`${deployments.length} Items`}</p>
        </div>
        {/* ---- Namespace Selector ---- */}
        <div className="relative min-w-6">
          <select
            value={currentNs}
            onChange={(e) => setCurrentNS(e.target.value)}
            className="w-full sm:w-[280px] md:w-[320px] pl-3 pr-10 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All Namespaces</option>
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading deployments...</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Ready</th>
                <th className="px-4 py-3">Up-to-date</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Condition</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {deployments.map((deployment) => (
                <tr key={`${deployment.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{deployment.metadata.name}</td>
                  <td className="px-4 py-3 font-medium">{deployment.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400">{`${deployment.status.readyReplicas}/${deployment.spec.replicas}`}</td>
                  <td className="px-4 py-3 text-gray-400">{deployment.status.updatedReplicas}</td>
                  <td className="px-4 py-3 text-gray-400">{deployment.status.availableReplicas}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(deployment)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(
                        getCondition(deployment)
                      )}`}
                    >
                      {getCondition(deployment)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
}