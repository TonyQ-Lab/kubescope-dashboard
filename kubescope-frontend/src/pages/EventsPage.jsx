import { useEffect, useState } from "react";
import { getNamespaces, getEvents } from "../api";
import { countAge } from "../utils";
import { ChevronDown } from "lucide-react";

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
            console.log(data);
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
        <div className="relative min-w-6">
          <select
            value={currentNs}
            onChange={(e) => setCurrentNS(e.target.value)}
            className="w-full sm:w-[280px] md:w-[320px] pl-3 pr-10 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All Namespaces</option>
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
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
                      {event.message.length > 0 ? event.message : "<none>"}
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