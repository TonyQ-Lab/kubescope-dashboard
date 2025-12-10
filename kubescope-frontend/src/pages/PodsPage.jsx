import { useEffect, useState } from "react";
import { getNamespaces, getPods } from "../api/index";
import { ChevronDown } from "lucide-react";
import { countAge } from "../utils";

function PodsPage() {
    const [pods, setPods] = useState([]);
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
      async function fetchPods() {
        try {
            setLoading(true);
            // Replace this with your Go backend call
            const data = await getPods(currentNs);
            // console.log(data);
            if (data !== null) {
              setPods(data);
            } else {
              setPods([]);
            }
        } catch (err) {
            console.error("Failed to fetch pods:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
      }

      fetchPods();
    }, [currentNs])


    function countReady(pod){
      let ready = 0;
      for (const container of pod.status.containerStatuses) {
        if (container.ready === true) {
          ready ++;
        }
      }
      return ready;
    }

    function countRestart(pod){
      let restart = 0;
      for (const container of pod.status.containerStatuses) {
        restart += container.restartCount;
      }
      return restart;
    }

    function statusColor(status) {
      switch (status) {
        case "Running":
            return "bg-green-500/20 text-green-400";
        case "Pending":
            return "bg-yellow-500/20 text-yellow-400";
        case "CrashLoopBackOff":
            return "bg-red-500/20 text-red-400";
        default:
            return "bg-gray-500/20 text-gray-400";
      }
    }

    return ( 
    <div className="space-y-6 p-4 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pods</h2>
        <div>
          <p className="text-lg">{`${pods.length} Items`}</p>
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
        <p className="text-gray-400">Loading pods...</p>
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
                <th className="px-4 py-3">Restarts</th>
                <th className="px-4 py-3">Controller</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {pods.map((pod) => (
                <tr key={`${pod.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{pod.metadata.name}</td>
                  <td className="px-4 py-3 font-medium">{pod.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400">{`${countReady(pod)}/${pod.status.containerStatuses.length}`}</td>
                  <td className="px-4 py-3 text-gray-400">{countRestart(pod)}</td>
                  <td className="px-4 py-3 text-gray-400">{
                    pod.metadata.ownerReferences ? pod.metadata.ownerReferences[0].kind : 'None'
                  }</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(pod)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(
                        pod.status.phase
                      )}`}
                    >
                      {pod.status.phase}
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

export default PodsPage;