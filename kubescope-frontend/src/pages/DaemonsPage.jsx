import { useEffect, useState } from "react";
import { getNamespaces, getDaemonSets } from "../api/index";
import { ChevronDown } from "lucide-react";
import { countAge } from "../utils";

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
            console.error("Failed to fetch pods:", err);
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
        <p className="text-gray-400">Loading daemonsets...</p>
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