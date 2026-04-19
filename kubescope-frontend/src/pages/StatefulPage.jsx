import { useEffect, useState } from "react";
import { getNamespaces, getStatefulSets } from "../api/index";
import { countAge, sortObjects } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector";
import SortableHeader from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import StatefulDetails from "./details/StatefulDetails";

export default function StatefulPage() {
    const [statefulsets, setStatefulSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [namespaces, setNamespaces] = useState([
      "default"
    ])
    const [currentNs, setCurrentNS] = useState("default");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Detail modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [isOpenDetail, setIsOpenDetail] = useState(false);
    const handleDoubleClick = (item) => {
      setSelectedItem(item);
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
            setStatefulSets(sortObjects(data, {
              key: "age",
              order: "asc"
            }));
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
      setStatefulSets((old) => sortObjects(old, sortBy));
    }

    const filteredStatefulsets = statefulsets.filter((statefulset) =>
      statefulset.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <div className="space-y-6 h-full w-full relative">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between p-4 pb-0">
        <h2 className="text-2xl font-semibold">StatefulSets</h2>

        <div className="flex items-center gap-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <div><p className="text-lg">{`${filteredStatefulsets.length} Items`}</p></div>
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
        <div className="overflow-x-auto w-full px-4">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <SortableHeader label="Name" column="name" onSort={handleSort} />
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Ready</th>
                <th className="px-4 py-3">Up-to-date</th>
                <th className="px-4 py-3">Available</th>
                <SortableHeader label="Age" column="age" onSort={handleSort} />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredStatefulsets.map((statefulset) => (
                <tr key={`${statefulset.metadata.name}`} className="cursor-pointer hover:bg-gray-800/50" onDoubleClick={() => handleDoubleClick(statefulset)}>
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

      {isOpenDetail && (
        <StatefulDetails statefulSet={selectedItem} onClose={() => setIsOpenDetail(false)} />
      )}
    </div>
    );
}