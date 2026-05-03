import { useEffect, useState } from "react";
import { getStorageClasses } from "../api/index";
import { countAge, sortObjects } from "../utils";
import SortableHeader from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import StorageClassDetails from "./details/StorageClassDetails";

export default function StorageClassesPage() {
    const [storageclasses, setStorageclasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Detail modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [isOpenDetail, setIsOpenDetail] = useState(false);
    const handleDoubleClick = (item) => {
      setSelectedItem(item);
      setIsOpenDetail(true);
    }

    useEffect(() => {
      async function fetchSCs() {
        try {
          setLoading(true);
          // Replace this with your Go backend call
          const data = await getStorageClasses();
          // console.log(data);
          if (data !== null) {
            setStorageclasses(sortObjects(data, {
              key: "age",
              order: "asc"
            }));
          } else {
            setStorageclasses([]);
          }
        } catch (err) {
          console.error("Failed to fetch StorageClasses:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      }
      fetchSCs();
    }, []);

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
      setStorageclasses((old) => sortObjects(old, sortBy));
    }

    function checkDefault(annotations) {
        if (annotations["storageclass.kubernetes.io/is-default-class"] && annotations["storageclass.kubernetes.io/is-default-class"] === "true")
            return "Yes"
        return "No"
    }

    const filteredSCs = storageclasses.filter((sc) =>
      sc.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return ( 
    <div className="space-y-6 h-full w-full relative">
      {/* ---- Header ---- */}
      <div className="flex items-end justify-between p-4 pb-0">
        <h2 className="text-2xl font-semibold">StorageClasses</h2>
        <div className="flex items-center gap-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <div><p className="text-lg">{`${filteredSCs.length} Items`}</p></div>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading StorageClasses...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full px-4">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <SortableHeader label="Name" column="name" onSort={handleSort} />
                <th className="px-4 py-3">Provisioner</th>
                <th className="px-4 py-3">Reclaim Policy</th>
                <th className="px-4 py-3">Default</th>
                <th className="px-4 py-3">Binding Mode</th>
                <SortableHeader label="Age" column="age" onSort={handleSort} />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredSCs.map((storageclass) => (
                <tr key={`${storageclass.metadata.name}`} className="cursor-pointer hover:bg-gray-800/50" onDoubleClick={() => handleDoubleClick(storageclass)}>
                  <td className="px-4 py-3 font-medium">{storageclass.metadata.name}</td>
                  <td className="px-4 py-3 text-gray-400">{storageclass.provisioner || "<none>"}</td>
                  <td className="px-4 py-3 text-gray-400">{storageclass.reclaimPolicy || "<unset>"}</td>
                  <td className="px-4 py-3 text-gray-400">{checkDefault(storageclass.metadata.annotations)}</td>
                  <td className="px-4 py-3 text-gray-400">{storageclass.volumeBindingMode || "<none>"}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(storageclass)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpenDetail && (
        <StorageClassDetails storageClass={selectedItem} onClose={() => setIsOpenDetail(false)} />
      )}
    </div>
    );
}
