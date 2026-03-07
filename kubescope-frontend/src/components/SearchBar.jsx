import { Search } from "lucide-react";

export default function SearchBar({ searchTerm, setSearchTerm, placeholder="Search by name..." }) {
    return (
    <div className="relative w-full sm:w-[200px] md:w-[260px] lg:w-[300px]">
        <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
        />

        <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 
                    bg-gray-800 
                    border border-gray-700 
                    rounded-xl 
                    text-sm 
                    text-gray-200 
                    placeholder-gray-400
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-blue-500 
                    focus:border-blue-500
                    transition"
        />
    </div>
    )
}