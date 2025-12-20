import { useEffect, useState } from "react";
import { getPVs } from "../api/index";
import { countAge } from "../utils";

export default function PVPage() {
    const [pvs, setPVs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      async function fetchPVs() {
        try {
            setLoading(true);
            // Replace this with your Go backend call
            const data = await getPVs();
            // console.log(data);
            if (data !== null) {
              setPVs(data);
            } else {
              setPVs([]);
            }
        } catch (err) {
            console.error("Failed to fetch PersistentVolumes:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
      }
      fetchPVs();
    }, []);

    // function getAccessModes(pv) {
    //   const accessmodes = pv.spec.accessModes;
    //   return accessmodes.join(", ");
    // }

    function getClaim(claimRef) {
      return `${claimRef.namespace}/${claimRef.name}`;
    }

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
    <div className="space-y-6 p-4 mt-1 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold mr-12">PersistentVolumes</h2>
        <div>
          <p className="text-lg">{`${pvs.length} Items`}</p>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading PersistentVolumes...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Storage Class</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Reclaim Policy</th>
                <th className="px-4 py-3">Claim</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {pvs.map((persistentvolume) => (
                <tr key={`${persistentvolume.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{persistentvolume.metadata.name}</td>
                  <td className="px-4 py-3 text-gray-400">{persistentvolume.spec.storageClassName || "<none>"}</td>
                  <td className="px-4 py-3 text-gray-400">{persistentvolume.spec.capacity.storage || "NaN"}</td>
                  <td className="px-4 py-3 text-gray-400">{persistentvolume.spec.persistentVolumeReclaimPolicy || "<unset>"}</td>
                  <td className="px-4 py-3 text-gray-400">{getClaim(persistentvolume.spec.claimRef) || "<none>"}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(persistentvolume)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(
                        persistentvolume.status.phase
                      )}`}
                    >
                      {persistentvolume.status.phase}
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
