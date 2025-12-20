import { useEffect, useState } from "react";
import { getNamespaces, getStatefulSets } from "../api/index";
import { ChevronDown } from "lucide-react";
import { countAge } from "../utils";

export default function StatefulPage() {
    const [statefulsets, setStatefulSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [namespaces, setNamespaces] = useState([
      "default"
    ])
    const [currentNs, setCurrentNS] = useState("default");
    const [error, setError] = useState(null);

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
      async function fetchStatefulSets() {
        try {
          setLoading(true);
          // Replace this with your Go backend call
          const data = await getStatefulSets(currentNs);
          // console.log(data);
          if (data !== null) {
            setStatefulSets(data);
          } else {
            setStatefulSets([]);
          }
        } catch (err) {
          console.error("Failed to fetch StatefulSets:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      }

      fetchStatefulSets();
    }, [currentNs])


    return (
    <div className="space-y-6 p-4 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">StatefulSets</h2>
        <div>
          <p className="text-lg">{`${statefulsets.length} Items`}</p>
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
        <p className="text-gray-400">Loading StatefulSets...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
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
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {statefulsets.map((statefulset) => (
                <tr key={`${statefulset.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{statefulset.metadata.name}</td>
                  <td className="px-4 py-3 font-medium">{statefulset.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400">{`${statefulset.status.readyReplicas}/${statefulset.spec.replicas}`}</td>
                  <td className="px-4 py-3 text-gray-400">{statefulset.status.updatedReplicas}</td>
                  <td className="px-4 py-3 text-gray-400">{statefulset.status.availableReplicas}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(statefulset)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
}