export function KVRow({ label, value }) {
  return (
    <div className="flex items-start gap-4 px-4 py-1.5 hover:bg-gray-800/40">
      <span className="text-md text-gray-500 break-all w-40 md:w-60 lg:w-96 shrink-0">{label}</span>
      <span className="text-md text-gray-200 break-all font-mono">{value ?? "—"}</span>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-md font-semibold uppercase tracking-widest text-gray-500 mb-2 px-4">
        {title}
      </h3>
      {children}
    </div>
  );
}