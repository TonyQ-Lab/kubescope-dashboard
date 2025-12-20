import { useEffect, useState } from "react";
import { getPVCs, getNamespaces } from "../api/index";
import { ChevronDown } from "lucide-react";
import { countAge } from "../utils";

export default function PVCPage() {
    const [pvcs, setPVCs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [namespaces, setNamespaces] = useState([
      "default"
    ])
    const [currentNs, setCurrentNS] = useState("default");

    useEffect(() => {
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
          setError(err);
        } finally {
          setLoading(false);
        }
      }

      fetchNamespaces();
    }, [])

    useEffect(() => {
      async function fetchPVCs() {
        try {
            setLoading(true);
            // Replace this with your Go backend call
            const data = await getPVCs(currentNs);
            // console.log(data);
            if (data !== null) {
              setPVCs(data);
            } else {
              setPVCs([]);
            }
        } catch (err) {
            console.error("Failed to fetch PersistentVolumeClaims:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
      }
      fetchPVCs();
    }, [currentNs]);


    function statusColor(status) {
      switch (status) {
        case "Available":
          return "bg-green-500/20 text-green-400";
        case "Bound":
          return "bg-purple-500/20 text-purple-400"
        case "Pending":
          return "bg-yellow-500/20 text-yellow-400";
        case "Failed":
          return "bg-red-500/20 text-red-400";
        default:
          return "bg-gray-500/20 text-gray-400";
      }
    }

    return ( 
    <div className="space-y-6 p-4 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">PersistentVolumeClaims</h2>
        <div>
          <p className="text-lg">{`${pvcs.length} Items`}</p>
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
        <p className="text-gray-400">Loading PersistentVolumeClaims...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Storage Class</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Volume</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {pvcs.map((persistentvolumeclaim) => (
                <tr key={`${persistentvolumeclaim.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{persistentvolumeclaim.metadata.name}</td>
                  <td className="px-4 py-3 text-gray-400">{persistentvolumeclaim.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400">{persistentvolumeclaim.spec.storageClassName || "<none>"}</td>
                  <td className="px-4 py-3 text-gray-400">{persistentvolumeclaim.spec.resources.requests.storage || "NaN"}</td>
                  <td className="px-4 py-3 text-gray-400">{persistentvolumeclaim.spec.volumeName || "<unbound>"}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(persistentvolumeclaim)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(
                        persistentvolumeclaim.status.phase
                      )}`}
                    >
                      {persistentvolumeclaim.status.phase}
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
