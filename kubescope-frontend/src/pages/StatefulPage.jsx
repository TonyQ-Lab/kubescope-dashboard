import { useEffect, useState } from "react";
import { getNamespaces, getStatefulSets } from "../api/index";
import { countAge } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector"

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
        <NamespaceSelector currentNS={currentNs} setCurrentNS={setCurrentNS} namespaces={namespaces} />
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