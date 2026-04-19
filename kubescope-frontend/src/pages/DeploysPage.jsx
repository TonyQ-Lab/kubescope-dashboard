import { useEffect, useState } from "react";
import { getNamespaces, getDeployments } from "../api/index";
import { countAge, sortObjects } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector";
import SortableHeader from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import DeployDetails from "./details/DeployDetails";

export default function DeploysPage() {
    const [deployments, setDeployments] = useState([]);
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
      async function fetchDeployments() {
        try {
            setLoading(true);
            // Replace this with your Go backend call
            const data = await getDeployments(currentNs);
            // console.log(data);
            if (data !== null) {
              setDeployments(sortObjects(data, {
                key: "age",
                order: "asc"
              }));
            } else {
              setDeployments([]);
            }
        } catch (err) {
            console.error("Failed to fetch Deployments:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
      }
      fetchDeployments();
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
      setDeployments((old) => sortObjects(old, sortBy));
    }

    function statusColor(status) {
      switch (status) {
        case "Running":
        case "Available":
            return "bg-green-500/20 text-green-400";
        case "Pending":
        case "Progressing":
            return "bg-yellow-500/20 text-yellow-400";
        case "CrashLoopBackOff":
        case "ReplicaFailure":
            return "bg-red-500/20 text-red-400";
        default:
            return "bg-gray-500/20 text-gray-400";
      }
    }

    function getCondition(deployment) {
        let available = false;
        let progressing = false;
        let conditions = deployment.status.conditions;

        for (const condi of conditions) {
            if (condi.type === "Available" && condi.status === "True") {
                available = true;
            }
            if (condi.type === "Progressing" && condi.status === "True") {
                progressing = true;
            }
        }
        if (available === true) {
            return "Available";
        } else if (progressing === true) {
            return "Progressing"
        } else {
            return "ReplicaFailure"
        }
    }

    const filteredDeploys = deployments.filter((deploy) =>
      deploy.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <div className="space-y-6 h-full w-full relative">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between p-4 pb-0">
        <h2 className="text-2xl font-semibold">Deployments</h2>
        <div className="flex items-center gap-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <div><p className="text-lg">{`${filteredDeploys.length} Items`}</p></div>
        </div>
        {/* ---- Namespace Selector ---- */}
        <NamespaceSelector currentNS={currentNs} setCurrentNS={setCurrentNS} namespaces={namespaces} />
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading Deployments...</p>
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
                <th className="px-4 py-3">Condition</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredDeploys.map((deployment) => (
                <tr key={`${deployment.metadata.uid}`} className="cursor-pointer hover:bg-gray-800/50" onDoubleClick={() => handleDoubleClick(deployment)}>
                  <td className="px-4 py-3 font-medium">{deployment.metadata.name}</td>
                  <td className="px-4 py-3 font-medium">{deployment.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400">{`${deployment.status.readyReplicas}/${deployment.spec.replicas}`}</td>
                  <td className="px-4 py-3 text-gray-400">{deployment.status.updatedReplicas}</td>
                  <td className="px-4 py-3 text-gray-400">{deployment.status.availableReplicas}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(deployment)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(
                        getCondition(deployment)
                      )}`}
                    >
                      {getCondition(deployment)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpenDetail && (
        <DeployDetails deployment={selectedItem} onClose={() => setIsOpenDetail(false)} />
      )}
    </div>
    );
}