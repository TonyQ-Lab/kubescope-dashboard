import { useEffect, useState } from "react";
import { getNamespaces, getEvents } from "../api";
import { countAge } from "../utils";
import NamespaceSelector from "../components/NamespaceSelector"

function EventsPage() {
    const [events, setEvents] = useState([]);
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
      async function fetchEvents() {
        try {
            setLoading(true);
            // Replace this with your Go backend call
            const data = await getEvents(currentNs);
            if (data !== null) {
              setEvents(data);
            } else {
              setEvents([]);
            }
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
      }

      fetchEvents();
    }, [currentNs])

    function statusColor(status) {
      switch (status) {
        case "Normal":
          return "bg-green-500/20 text-green-400";
        case "Warning":
          return "bg-yellow-500/20 text-yellow-400";
        default:
          return "bg-gray-500/20 text-gray-400";
      }
    }

    function getInvolvedObject(object) {
      if (object.kind && object.name)
        return `${object.kind}: ${object.name}`;
      return "Unknown";
    }


    return ( 
    <div className="space-y-6 p-4 h-full w-full">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Events</h2>
        <div>
          <p className="text-lg">{`${events.length} Items`}</p>
        </div>
        {/* ---- Namespace Selector ---- */}
        <NamespaceSelector currentNS={currentNs} setCurrentNS={setCurrentNS} namespaces={namespaces} />
      </div>

      {/* ---- Loading ---- */}
      {loading ? (
        <p className="text-gray-400">Loading Events...</p>
      ) : error !== null ? (
        <p className="text-gray-400">{`${error}`}</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Involved Object</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Age</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {events.map((event) => (
                <tr key={`${event.metadata.name}`} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(
                        event.type
                      )}`}
                    >
                      {event.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{event.metadata.namespace}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-md">
                    <div className='line-clamp-2'>
                      {event.message ? event.message : "<none>"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{getInvolvedObject(event.involvedObject)}</td>
                  <td className="px-4 py-3 text-gray-400">{`${event.reportingComponent} ${event.reportingInstance}`}</td>
                  <td className="px-4 py-3 text-gray-400">{countAge(event)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
}

export default EventsPage;