import { useEffect, useState } from "react";
import { getNodes } from "../api/index";
import { countAge, sortObjects } from "../utils";
import SortableHeader from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import NodeDetails from "./details/NodeDetails";

export default function NodesPage() {
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
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
      async function fetchNodes() {
        try {
            setLoading(true);
            // Replace this with your Go backend call
            const data = await getNodes();
            // console.log(data);
            if (data !== null) {
              setNodes(sortObjects(data, {
                key: "age",
                order: "asc"
              }));
            } else {
              setNodes([]);
            }
        } catch (err) {
            console.error("Failed to fetch Nodes:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
      }
      fetchNodes();
    }, [])

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
      setNodes((old) => sortObjects(old, sortBy));
    }

    function getStatus(node) {
        let memoryPressure = false;
        let diskPressure = false;
        let pidPressure = false;

        const statuses = node.status.conditions;
        for (const status of statuses) {
            if (status.type === "Ready" && status.status === "True")
                return "Ready";
            if (status.type === "MemoryPressure" && status.status === "True")
                memoryPressure = true;
            if (status.type === "DiskPressure" && status.status === "True")
                diskPressure = true;
            if (status.type === "PIDPressure" && status.status === "True")
                pidPressure = true;
        }
        if (memoryPressure) return "MemoryPressure";
        if (diskPressure) return "DiskPressure";
        if (pidPressure) return "PIDPressure";
    }

    function statusColor(status) {
      switch (status) {
        case "Ready":
            return "bg-green-500/20 text-green-400";
        default:
            return "bg-yellow-500/20 text-yellow-400";
      }
    }

    function getTaints(node) {
        if (!node.spec.taints) {
            return "<none>";
        }
        const taints = node.spec.taints;
        let result = [];
        for (const taint of taints) {
            result.push(`${taint.key}=${taint.value}:${taint.effect}`);
        }
        return result.join(", ");
    }

    function getRoles(node) {
        let roles = [];
        const labels = node.metadata.labels;
        const re = new RegExp("node-role.kubernetes.io/", "i");

        for (let key in labels) {
            if (re.exec(key)) {
                roles.push(key.split("/")[1]);
            }
        }
        if (roles.length === 0) 
            return "<none>";
        return roles.join(", ");
    }

    const filteredNodes = nodes.filter((node) =>
      node.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return ( 
    <div className="space-y-6 h-full w-full relative">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between p-4 pb-0">
        <h2 className="text-2xl font-semibold">Nodes</h2>
        
        <div className="flex items-center gap-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <div><p className="text-lg">{`${filteredNodes.length} Items`}</p></div>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading Nodes...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full px-4">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <SortableHeader label="Name" column="name" onSort={handleSort} />
                <th className="px-4 py-3">Taints</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Version</th>
                <SortableHeader label="Age" column="age" onSort={handleSort} />
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredNodes.map((node) => (
                <tr key={`${node.metadata.name}`} className="cursor-pointer hover:bg-gray-800/50" onDoubleClick={() => handleDoubleClick(node)}>
                  <td className="px-4 py-3 font-medium">{node.metadata.name}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-md">
                    <div className='line-clamp-2'>
                      {getTaints(node)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-md">
                    <div className='line-clamp-2'>
                      {getRoles(node)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{node.status.nodeInfo.kubeletVersion || "<unknown>"}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(node)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(getStatus(node))}`}
                    >
                      {getStatus(node)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpenDetail && (
        <NodeDetails node={selectedItem} onClose={() => setIsOpenDetail(false)} />
      )}
    </div>
    );
}
