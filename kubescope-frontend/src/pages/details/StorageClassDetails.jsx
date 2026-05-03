import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { KVRow, Section } from "../../components/Modals";

const PANEL_MIN_HEIGHT = 150;
const PANEL_MAX_HEIGHT = 600;
const PANEL_DEFAULT_HEIGHT = 380;

function DefaultBadge({ annotations }) {
  const isDefault =
    annotations?.["storageclass.kubernetes.io/is-default-class"] === "true" ||
    annotations?.["storageclass.beta.kubernetes.io/is-default-class"] === "true";
  if (!isDefault) return null;
  return (
    <span className="px-2 py-0.5 rounded text-md font-medium bg-green-500/20 text-green-400">
      default
    </span>
  );
}

function BindingModeBadge({ mode }) {
  const cls =
    mode === "WaitForFirstConsumer"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-blue-500/20 text-blue-400";
  return (
    <span className={`px-2 py-0.5 rounded text-md font-medium ${cls}`}>
      {mode ?? "Immediate"}
    </span>
  );
}

export default function StorageClassDetails({ storageClass, onClose }) {
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

  if (!storageClass) return null;

  const meta = storageClass.metadata;

  const provisioner = storageClass.provisioner ?? "—";
  const reclaimPolicy = storageClass.reclaimPolicy ?? "Delete";
  const bindingMode = storageClass.volumeBindingMode ?? "Immediate";
  const allowVolumeExpansion = storageClass.allowVolumeExpansion ?? false;
  const parameters = storageClass.parameters
    ? Object.entries(storageClass.parameters)
    : [];
  const mountOptions = storageClass.mountOptions ?? [];
  const allowedTopologies = storageClass.allowedTopologies ?? [];

  const labels = meta.labels ? Object.entries(meta.labels) : [];
  const annotations = meta.annotations
    ? Object.entries(meta.annotations).filter(
        ([k]) =>
          !k.startsWith("kubectl.kubernetes.io/last-applied") &&
          !k.startsWith("storageclass.kubernetes.io/is-default-class") &&
          !k.startsWith("storageclass.beta.kubernetes.io/is-default-class")
      )
    : [];

  const tabs = ["overview", "parameters", "labels"];

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
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-md font-semibold text-gray-100 truncate">{meta.name}</span>
          <DefaultBadge annotations={meta.annotations} />
          <BindingModeBadge mode={bindingMode} />
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
            <Section title="Provisioner">
              <KVRow label="Provisioner" value={provisioner} />
              <KVRow label="Reclaim policy" value={reclaimPolicy} />
              <KVRow label="Binding mode" value={bindingMode} />
              <KVRow
                label="Volume expansion"
                value={
                  <span className={allowVolumeExpansion ? "text-green-400" : "text-gray-500"}>
                    {allowVolumeExpansion ? "allowed" : "not allowed"}
                  </span>
                }
              />
            </Section>
            {mountOptions.length > 0 && (
              <Section title={`Mount options (${mountOptions.length})`}>
                {mountOptions.map((opt, i) => (
                  <div key={i} className="px-4 py-1.5 hover:bg-gray-800/40">
                    <span className="text-md text-gray-200 font-mono">{opt}</span>
                  </div>
                ))}
              </Section>
            )}
            {allowedTopologies.length > 0 && (
              <Section title={`Allowed topologies (${allowedTopologies.length})`}>
                {allowedTopologies.map((topo, i) => (
                  <div key={i} className="mx-4 mb-2 rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2">
                    {topo.matchLabelExpressions?.map((expr, j) => (
                      <div key={j} className="text-md font-mono">
                        <span className="text-gray-500">{expr.key}: </span>
                        <span className="text-gray-200">{expr.values?.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </Section>
            )}
            <Section title="Metadata">
              <KVRow label="UID" value={meta.uid} />
              <KVRow label="Created" value={meta.creationTimestamp} />
            </Section>
          </>
        )}

        {tab === "parameters" && (
          <Section title={`Provisioner parameters (${parameters.length})`}>
            {parameters.length ? (
              parameters.map(([k, v]) => <KVRow key={k} label={k} value={v} />)
            ) : (
              <p className="px-4 text-md text-gray-500">
                No parameters — provisioner uses its defaults
              </p>
            )}
          </Section>
        )}

        {tab === "labels" && (
          <>
            <Section title={`Labels (${labels.length})`}>
              {labels.length ? (
                labels.map(([k, v]) => <KVRow key={k} label={k} value={v || '""'} />)
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
