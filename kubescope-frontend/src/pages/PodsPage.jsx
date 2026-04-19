import { useEffect, useState } from "react";
import { getNamespaces, getPods } from "../api/index";
import { countAge, sortObjects } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector";
import SortableHeader from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import PodDetails from "./details/PodDetails";

function PodsPage() {
    const [pods, setPods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [namespaces, setNamespaces] = useState([
      "default"
    ])
    const [currentNs, setCurrentNS] = useState("default");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Detail modal
    const [selectedPod, setSelectedPod] = useState(null);
    const [isOpenDetail, setIsOpenDetail] = useState(false);
    const handleDoubleClick = (pod) => {
      setSelectedPod(pod);
      setIsOpenDetail(true);
    }

    useEffect(() => {
      async function fetchNamespaces() {
        let nslist = [];
        try {
          setLoading(true);
          const data = await getNamespaces();
          data.forEach(ns => {
            nslist.push(ns.metadata.name);
          });
          setNamespaces(nslist);
        } 
        catch (err) {
          console.error("Failed to fetch namespaces:", err);
          setError(err);
        } 
        finally {
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
            setPods(sortObjects(data, {
              key: "age",
              order: "asc"
            }))
          } else {
            setPods([]);
          }
        } 
        catch (err) {
          console.error("Failed to fetch pods:", err);
          setError(err);
        } 
        finally {
          setLoading(false);
        }
      }

      fetchPods();
    }, [currentNs])

    const [sortBy, setSortBy] = useState({
      key: "age",
      order: "asc"
    })

    function handleSort(key) {
      console.log("Sort called");
      setSortBy((prev) => ({
        key,
        order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
      }))
      setPods((old) => sortObjects(old, sortBy));
    }

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

    const filteredPods = pods.filter((pod) =>
      pod.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return ( 
    <div className="space-y-6 h-full w-full relative">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between p-4 pb-0">
        <h2 className="text-2xl font-semibold">Pods</h2>
        <div className="flex items-center gap-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <div><p className="text-lg">{`${filteredPods.length} Items`}</p></div>
        </div>
          {/* ---- Namespace Selector ---- */}
          <NamespaceSelector currentNS={currentNs} setCurrentNS={setCurrentNS} namespaces={namespaces} />
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading Pods...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full px-4">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <SortableHeader label="Name" column="name" onSort={handleSort} />
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Ready</th>
                <th className="px-4 py-3">Restarts</th>
                <th className="px-4 py-3">Controller</th>
                <SortableHeader label="Age" column="age" onSort={handleSort} />
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredPods.map((pod) => (
                <tr key={`${pod.metadata.uid}`} className="cursor-pointer hover:bg-gray-800/50" onDoubleClick={() => handleDoubleClick(pod)}>
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

      {isOpenDetail && (
        <PodDetails pod={selectedPod} onClose={() => setIsOpenDetail(false)} />
      )}
    </div>
    );
}

export default PodsPage;