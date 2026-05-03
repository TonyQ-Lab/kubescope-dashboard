import { useEffect, useState } from "react";
import { getNamespaces, getServices } from "../api/index";
import { countAge, getPortString, getExternalIP, sortObjects } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector";
import SortableHeader from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import ServiceDetails from "./details/ServiceDetails";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
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
    async function fetchServices() {
      try {
        setLoading(true);
        // Replace this with your Go backend call
        const data = await getServices(currentNs);
        // console.log(data);
        if (data !== null) {
          setServices(sortObjects(data, {
            key: "age",
            order: "asc"
          }));
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Failed to fetch Services:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
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
    console.log(`Sort called: ${key} - ${sortBy.order}`);
    setServices((old) => sortObjects(old, sortBy));
  }

  const filteredServices = services.filter((svc) =>
    svc.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
  <div className="space-y-6 h-full w-full relative">
    {/* ---- Header ---- */}
    <div className="flex items-center justify-between p-4 pb-0">
      <h2 className="text-2xl font-semibold">Services</h2>

      <div className="flex items-center gap-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        <div><p className="text-lg">{`${filteredServices.length} Items`}</p></div>
      </div>
      {/* ---- Namespace Selector ---- */}
      <NamespaceSelector currentNS={currentNs} setCurrentNS={setCurrentNS} namespaces={namespaces} />
    </div>

    {/* ---- Loading ---- */}
    {loading ? (
      <p className="text-gray-400">Loading Services...</p>
    ) : error !== null ? (
      <p className="text-gray-400">{`${error}`}</p>
    ) : (
      <div className="overflow-x-auto w-full px-4">
        <table className="w-full text-left text-sm min-w-max">
          <thead className="bg-gray-800/50 text-gray-300">
            <tr>
              <SortableHeader label="Name" column="name" onSort={handleSort} />
              <th className="px-4 py-3">Namespace</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">ClusterIP</th>
              <th className="px-4 py-3">Ports</th>
              <th className="px-4 py-3">External-IP</th>
              <SortableHeader label="Age" column="age" onSort={handleSort} />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {filteredServices.map((service) => (
              <tr key={`${service.metadata.name}`} className="cursor-pointer hover:bg-gray-800/50" onDoubleClick={() => handleDoubleClick(service)}>
                <td className="px-4 py-3 font-medium">{service.metadata.name}</td>
                <td className="px-4 py-3 font-medium">{service.metadata.namespace}</td>
                <td className="px-4 py-3 text-gray-400">{service.spec.type}</td>
                <td className="px-4 py-3 text-gray-400">{service.spec.clusterIP}</td>
                <td className="px-4 py-3 text-gray-400">{getPortString(service.spec.ports)}</td>
                <td className="px-4 py-3 text-gray-400">{getExternalIP(service)}</td>
                <td className="px-4 py-3 text-gray-400">{countAge(service)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {isOpenDetail && (
      <ServiceDetails service={selectedItem} onClose={() => setIsOpenDetail(false)} />
    )}
  </div>
  );
}