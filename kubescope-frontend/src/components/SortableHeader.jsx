import {
    ChevronsUpDown
} from "lucide-react";

export default function SortableHeader({ label, column, onSort }) {
    return (
    <th
      className="px-4 py-3 cursor-pointer select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ChevronsUpDown className="sort-arrow" />
      </div>
    </th>
    );
}