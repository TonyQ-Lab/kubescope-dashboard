import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { KVRow, Section } from "../../components/Modals";

const PANEL_MIN_HEIGHT = 150;
const PANEL_MAX_HEIGHT = 600;
const PANEL_DEFAULT_HEIGHT = 380;

const PHASE_COLORS = {
  Available: "bg-green-500/20 text-green-400",
  Bound:     "bg-blue-500/20 text-blue-400",
  Released:  "bg-yellow-500/20 text-yellow-400",
  Failed:    "bg-red-500/20 text-red-400",
};

function StatusBadge({ phase }) {
  const cls = PHASE_COLORS[phase] ?? "bg-gray-500/20 text-gray-400";
  return (
    <span className={`px-2 py-0.5 rounded text-md font-medium ${cls}`}>
      {phase ?? "Unknown"}
    </span>
  );
}


// Detects which volume source type is set and returns { type, details }
function parseVolumeSource(spec) {
  const knownSources = [
    "hostPath", "nfs", "csi", "awsElasticBlockStore", "gcePersistentDisk",
    "azureDisk", "azureFile", "cephfs", "fc", "flocker", "glusterfs",
    "iscsi", "local", "portworxVolume", "quobyte", "rbd", "scaleIO",
    "storageos", "vsphereVolume",
  ];
  for (const key of knownSources) {
    if (spec?.[key]) return { type: key, details: spec[key] };
  }
  return { type: "unknown", details: {} };
}

function VolumeSourceCard({ type, details }) {
  const entries = Object.entries(details).filter(([, v]) => v !== "" && v != null);
  return (
    <div className="mx-4 mb-2 rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2">
      <span className="text-md font-medium text-gray-200">{type}</span>
      {entries.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-md font-mono">
              <span className="text-gray-500 shrink-0 w-24">{k}</span>
              <span className="text-gray-300 break-all">
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PersistentVolumeDetails({ pv, onClose }) {
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

  if (!pv) return null;

  const meta = pv.metadata;
  const spec = pv.spec;
  const status = pv.status;

  const phase = status?.phase;
  const capacity = spec?.capacity?.storage ?? "—";
  const accessModes = spec?.accessModes ?? [];
  const reclaimPolicy = spec?.persistentVolumeReclaimPolicy ?? "—";
  const storageClass = spec?.storageClassName ?? "—";
  const volumeMode = spec?.volumeMode ?? "Filesystem";
  const claimRef = spec?.claimRef;
  const { type: sourceType, details: sourceDetails } = parseVolumeSource(spec);

  const annotations = meta.annotations
    ? Object.entries(meta.annotations).filter(
        ([k]) => !k.startsWith("kubectl.kubernetes.io/last-applied")
      )
    : [];
  const labels = meta.labels ? Object.entries(meta.labels) : [];
  const finalizers = meta.finalizers ?? [];

  const tabs = ["overview", "source", "binding", "labels"];

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
          {/* PVs are cluster-scoped — show capacity instead of namespace */}
          <span className="text-md text-gray-500 shrink-0 font-mono">{capacity}</span>
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
            <Section title="Capacity & access">
              <KVRow label="Capacity" value={capacity} />
              <KVRow label="Access modes" value={accessModes.join(", ")} />
              <KVRow label="Volume mode" value={volumeMode} />
              <KVRow label="Reclaim policy" value={reclaimPolicy} />
              <KVRow label="Storage class" value={storageClass} />
              <KVRow label="Volume source" value={sourceType} />
            </Section>
            <Section title="Metadata">
              <KVRow label="UID" value={meta.uid} />
              <KVRow label="Created" value={meta.creationTimestamp} />
              <KVRow
                label="Phase transition"
                value={status?.lastPhaseTransitionTime ?? "—"}
              />
              {finalizers.length > 0 && (
                <KVRow label="Finalizers" value={finalizers.join(", ")} />
              )}
            </Section>
          </>
        )}

        {tab === "source" && (
          <Section title={`Volume source · ${sourceType}`}>
            <VolumeSourceCard type={sourceType} details={sourceDetails} />
          </Section>
        )}

        {tab === "binding" && (
          <>
            <Section title="Claim reference">
              {claimRef ? (
                <>
                  <KVRow label="Claim" value={`${claimRef.namespace}/${claimRef.name}`} />
                  <KVRow label="UID" value={claimRef.uid} />
                  <KVRow label="Kind" value={claimRef.kind} />
                  <KVRow label="API version" value={claimRef.apiVersion} />
                </>
              ) : (
                <p className="px-4 text-md text-gray-500">Not bound to any claim</p>
              )}
            </Section>
            <Section title="Binding annotations">
              {annotations.filter(([k]) => k.startsWith("pv.kubernetes.io/")).length ? (
                annotations
                  .filter(([k]) => k.startsWith("pv.kubernetes.io/"))
                  .map(([k, v]) => <KVRow key={k} label={k.replace("pv.kubernetes.io/", "")} value={v} />)
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
