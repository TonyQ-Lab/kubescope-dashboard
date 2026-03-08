import { useEffect, useState } from "react";
import { getNamespaces, getReplicaSets } from "../api/index";
import { countAge, sortObjects } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector";
import SortableHeader from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";

export default function ReplicasPage() {
    const [replicasets, setReplicaSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [namespaces, setNamespaces] = useState([
      "default"
    ])
    const [currentNs, setCurrentNS] = useState("default");
    const [searchTerm, setSearchTerm] = useState("");
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
    async function fetchReplicaSets() {
      try {
        setLoading(true);
        // Replace this with your Go backend call
        const data = await getReplicaSets(currentNs);
        // console.log(data);
        if (data !== null) {
          setReplicaSets(sortObjects(data, {
            key: "age",
            order: "asc"
          }));
        } else {
          setReplicaSets([]);
        }
      } catch (err) {
        console.error("Failed to fetch ReplicaSets:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
      fetchReplicaSets();
    }, [currentNs])

    const [sortBy, setSortBy] = useState({
      key: "age",
      order: "asc"
    })

    function handleSort(key) {
      setSortBy((prev) => ({
        key,
        order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
      }))
      // console.log(`Sort called: ${key} - ${sortBy.order}`);
      setReplicaSets((old) => sortObjects(old, sortBy));
    }

    const filteredReplicas = replicasets.filter((replica) =>
      replica.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <div className="space-y-6 p-4 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">ReplicaSets</h2>
        
        <div className="flex items-center gap-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <div><p className="text-lg">{`${filteredReplicas.length} Items`}</p></div>
        </div>
        {/* ---- Namespace Selector ---- */}
        <NamespaceSelector currentNS={currentNs} setCurrentNS={setCurrentNS} namespaces={namespaces} />
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading ReplicaSets...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <SortableHeader label="Name" column="name" onSort={handleSort} />
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Controller</th>
                <th className="px-4 py-3">Revision</th>
                <th className="px-4 py-3">Ready</th>
                <th className="px-4 py-3">Available</th>
                <SortableHeader label="Age" column="age" onSort={handleSort} />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredReplicas.map((replicaset) => (
                <tr key={`${replicaset.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{replicaset.metadata.name}</td>
                  <td className="px-4 py-3 font-medium">{replicaset.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400">{
                    replicaset.metadata.ownerReferences ? replicaset.metadata.ownerReferences[0].kind : 'None'
                  }</td>
                  <td className="px-4 py-3 font-medium">{replicaset.metadata.annotations["deployment.kubernetes.io/revision"]}</td>
                  <td className="px-4 py-3 text-gray-400">{`${replicaset.status.readyReplicas || 0}/${replicaset.spec.replicas}`}</td>
                  <td className="px-4 py-3 text-gray-400">{replicaset.status.availableReplicas || 0}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(replicaset)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
}