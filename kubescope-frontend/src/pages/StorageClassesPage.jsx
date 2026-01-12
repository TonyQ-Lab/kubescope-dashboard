import { useEffect, useState } from "react";
import { getStorageClasses } from "../api/index";
import { countAge, sortObjects } from "../utils";
import SortableHeader from "../components/SortableHeader";

export default function StorageClassesPage() {
    const [storageclasses, setStorageclasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return ( 
    <div className="space-y-6 p-4 mt-1 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold mr-12">StorageClasses</h2>
        <div>
          <p className="text-lg">{`${storageclasses.length} Items`}</p>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading StorageClasses...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full">
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
              {storageclasses.map((storageclass) => (
                <tr key={`${storageclass.metadata.name}`} className="hover:bg-gray-800/50">
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
    </div>
    );
}
