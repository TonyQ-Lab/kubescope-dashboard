import { useEffect, useState } from "react";
import { getNamespaces, getDaemonSets } from "../api/index";
import { countAge } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector"

export default function DaemonsPage() {
    const [daemonsets, setDaemonSets] = useState([]);
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
      async function fetchDaemonsets() {
        try {
            setLoading(true);
            // Replace this with your Go backend call
            const data = await getDaemonSets(currentNs);
            // console.log(data);
            if (data !== null) {
              setDaemonSets(data);
            } else {
              setDaemonSets([]);
            }
        } catch (err) {
            console.error("Failed to fetch DaemonSets:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
      }
      fetchDaemonsets();
    }, [currentNs])


    return (
    <div className="space-y-6 p-4 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">DaemonSets</h2>
        <div>
          <p className="text-lg">{`${daemonsets.length} Items`}</p>
        </div>
        {/* ---- Namespace Selector ---- */}
        <NamespaceSelector currentNS={currentNs} setCurrentNS={setCurrentNS} namespaces={namespaces} />
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading DaemonSets...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Up-to-date</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Age</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {daemonsets.map((daemonset) => (
                <tr key={`${daemonset.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{daemonset.metadata.name}</td>
                  <td className="px-4 py-3 font-medium">{daemonset.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400">{`${daemonset.status.currentNumberScheduled || 0}/${daemonset.status.desiredNumberScheduled || 0}`}</td>
                  <td className="px-4 py-3 text-gray-400">{daemonset.status.updatedNumberScheduled}</td>
                  <td className="px-4 py-3 text-gray-400">{daemonset.status.numberAvailable}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(daemonset)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
}