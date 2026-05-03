import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const PANEL_MIN_HEIGHT = 150;
const PANEL_MAX_HEIGHT = 600;
const PANEL_DEFAULT_HEIGHT = 380;

const PHASE_COLORS = {
  Bound:   "bg-blue-500/20 text-blue-400",
  Pending: "bg-yellow-500/20 text-yellow-400",
  Lost:    "bg-red-500/20 text-red-400",
};

function StatusBadge({ phase }) {
  const cls = PHASE_COLORS[phase] ?? "bg-gray-500/20 text-gray-400";
  return (
    <span className={`px-2 py-0.5 rounded text-md font-medium ${cls}`}>
      {phase ?? "Unknown"}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-md font-semibold uppercase tracking-widest text-gray-500 mb-2 px-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function KVRow({ label, value }) {
  return (
    <div className="flex items-start gap-4 px-4 py-1.5 hover:bg-gray-800/40 group">
      <span className="text-md text-gray-500 w-44 shrink-0 pt-0.5">{label}</span>
      <span className="text-md text-gray-200 break-all font-mono">{value ?? "—"}</span>
    </div>
  );
}

function CapacityBar({ requested, actual }) {
  // Parse values like "500Mi", "1Gi", "10Gi" → bytes for comparison
  function toBytes(str) {
    if (!str) return 0;
    const units = { Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3, Ti: 1024 ** 4, K: 1000, M: 1000 ** 2, G: 1000 ** 3 };
    const match = String(str).match(/^([\d.]+)([A-Za-z]+)?$/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = match[2] ?? "";
    return num * (units[unit] ?? 1);
  }

  const reqBytes = toBytes(requested);
  const actBytes = toBytes(actual);
  if (!reqBytes || !actBytes) return null;

  const pct = Math.min(Math.round((reqBytes / actBytes) * 100), 100);
  const overProvisioned = actBytes > reqBytes;

  return (
    <div className="px-4 py-1.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-md text-gray-500">Storage utilisation</span>
        <span className="text-md font-mono text-gray-200">
          {requested} requested · {actual} provisioned
          {overProvisioned && (
            <span className="text-yellow-400 ml-2">over-provisioned</span>
          )}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-700/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function PersistentVolumeClaimDetails({ pvc, onClose }) {
  const [height, setHeight] = useState(PANEL_DEFAULT_HEIGHT);
  const [tab, setTab] = useState("overview");
  const [visible, setVisible] = useState(false);
  const dragRef = useRef(null);
  const startYRef = useRef(null);
  const startHeightRef = useRef(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  function onMouseDown(e) {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    function onMouseMove(ev) {
      const delta = startYRef.current - ev.clientY;
      setHeight(Math.min(Math.max(PANEL_MIN_HEIGHT, startHeightRef.current + delta), PANEL_MAX_HEIGHT));
    }
    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  if (!pvc) return null;

  const meta = pvc.metadata;
  const spec = pvc.spec;
  const status = pvc.status;

  const phase = status?.phase;
  const requestedStorage = spec?.resources?.requests?.storage;
  const actualCapacity = status?.capacity?.storage;
  const accessModes = spec?.accessModes ?? [];
  const statusAccessModes = status?.accessModes ?? [];
  const volumeMode = spec?.volumeMode ?? "Filesystem";
  const storageClass = spec?.storageClassName ?? "—";
  const volumeName = spec?.volumeName;

  // Binding state annotations
  const bindCompleted = meta.annotations?.["pv.kubernetes.io/bind-completed"] === "yes";
  const boundByController = meta.annotations?.["pv.kubernetes.io/bound-by-controller"] === "yes";

  const annotations = meta.annotations
    ? Object.entries(meta.annotations).filter(
        ([k]) => !k.startsWith("kubectl.kubernetes.io/last-applied")
      )
    : [];
  const labels = meta.labels ? Object.entries(meta.labels) : [];
  const finalizers = meta.finalizers ?? [];

  // Selector (optional, used with static provisioning)
  const matchLabels = spec?.selector?.matchLabels
    ? Object.entries(spec.selector.matchLabels)
    : [];

  const tabs = ["overview", "binding", "labels"];

  return (
    <div
      className="absolute bottom-0 w-full flex flex-col border-t border-gray-700 bg-gray-900 shadow-2xl"
      style={{
        height: `${height}px`,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Drag handle */}
      <div
        ref={dragRef}
        onMouseDown={onMouseDown}
        className="h-1.5 w-full cursor-row-resize flex items-center justify-center group shrink-0"
        title="Drag to resize"
      >
        <div className="w-8 h-0.5 rounded-full bg-gray-700 group-hover:bg-gray-500 transition-colors" />
      </div>

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/70 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-md font-semibold text-gray-100 truncate">{meta.name}</span>
          <span className="text-md text-gray-500 shrink-0">{meta.namespace}</span>
          <StatusBadge phase={phase} />
        </div>
        <button
          onClick={handleClose}
          className="ml-4 text-gray-500 hover:text-gray-200 transition-colors shrink-0 text-lg leading-none"
          title="Close"
        >
          <X />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-700/70 px-2 shrink-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-md font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-3">

        {tab === "overview" && (
          <>
            <Section title="Storage">
              {requestedStorage && actualCapacity && (
                <CapacityBar requested={requestedStorage} actual={actualCapacity} />
              )}
              <KVRow label="Requested" value={requestedStorage} />
              {actualCapacity && (
                <KVRow label="Provisioned" value={actualCapacity} />
              )}
              <KVRow label="Storage class" value={storageClass} />
              <KVRow label="Volume mode" value={volumeMode} />
              <KVRow label="Access modes (spec)" value={accessModes.join(", ")} />
              {statusAccessModes.length > 0 && (
                <KVRow label="Access modes (actual)" value={statusAccessModes.join(", ")} />
              )}
            </Section>
            <Section title="Metadata">
              <KVRow label="UID" value={meta.uid} />
              <KVRow label="Created" value={meta.creationTimestamp} />
              {finalizers.length > 0 && (
                <KVRow label="Finalizers" value={finalizers.join(", ")} />
              )}
            </Section>
          </>
        )}

        {tab === "binding" && (
          <>
            <Section title="Bound volume">
              {volumeName ? (
                <>
                  <KVRow label="PersistentVolume" value={volumeName} />
                  <KVRow
                    label="Bind completed"
                    value={
                      <span className={bindCompleted ? "text-green-400" : "text-gray-400"}>
                        {String(bindCompleted)}
                      </span>
                    }
                  />
                  <KVRow
                    label="Bound by controller"
                    value={
                      <span className={boundByController ? "text-blue-400" : "text-gray-400"}>
                        {String(boundByController)}
                      </span>
                    }
                  />
                </>
              ) : (
                <p className="px-4 text-md text-gray-500">
                  {phase === "Pending"
                    ? "Waiting for a matching PersistentVolume"
                    : "Not bound to any volume"}
                </p>
              )}
            </Section>
            {matchLabels.length > 0 && (
              <Section title={`Volume selector (${matchLabels.length})`}>
                {matchLabels.map(([k, v]) => (
                  <KVRow key={k} label={k} value={v} />
                ))}
              </Section>
            )}
            <Section title="Binding annotations">
              {annotations.filter(([k]) => k.startsWith("pv.kubernetes.io/")).length ? (
                annotations
                  .filter(([k]) => k.startsWith("pv.kubernetes.io/"))
                  .map(([k, v]) => (
                    <KVRow key={k} label={k.replace("pv.kubernetes.io/", "")} value={v} />
                  ))
              ) : (
                <p className="px-4 text-md text-gray-500">No binding annotations</p>
              )}
            </Section>
          </>
        )}

        {tab === "labels" && (
          <>
            <Section title={`Labels (${labels.length})`}>
              {labels.length ? (
                labels.map(([k, v]) => <KVRow key={k} label={k} value={v} />)
              ) : (
                <p className="px-4 text-md text-gray-500">No labels</p>
              )}
            </Section>
            <Section title={`Annotations (${annotations.length})`}>
              {annotations.length ? (
                annotations.map(([k, v]) => <KVRow key={k} label={k} value={v} />)
              ) : (
                <p className="px-4 text-md text-gray-500">No annotations</p>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
