import { useEffect, useState } from "react";
import { getNamespaces, getServices } from "../api/index";
import { countAge, getPortString, getExternalIP } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
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
          setServices(data);
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


  return (
  <div className="space-y-6 p-4 h-full w-full">
    {/* ---- Header ---- */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Services</h2>
      <div>
        <p className="text-lg">{`${services.length} Items`}</p>
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
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm min-w-max">
          <thead className="bg-gray-800/50 text-gray-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Namespace</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">ClusterIP</th>
              <th className="px-4 py-3">Ports</th>
              <th className="px-4 py-3">External-IP</th>
              <th className="px-4 py-3">Age</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {services.map((service) => (
              <tr key={`${service.metadata.name}`} className="hover:bg-gray-800/50">
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
  </div>
  );
}