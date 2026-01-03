import { ChevronDown } from "lucide-react";


export default function NamespaceSelector({ currentNS, setCurrentNS, namespaces }) {
    return (
    <div className="relative min-w-6">
        <select
            value={currentNS}
            onChange={(e) => setCurrentNS(e.target.value)}
            className="w-full sm:w-[280px] md:w-[320px] pl-3 pr-10 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors"
        >
        {namespaces.map((ns) => (
            <option key={ns} value={ns}>
            {ns}
            </option>
        ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    )
}