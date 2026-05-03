import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { KVRow, Section } from "../../components/Modals";

const PANEL_MIN_HEIGHT = 150;
const PANEL_MAX_HEIGHT = 600;
const PANEL_DEFAULT_HEIGHT = 380;

function StatusBadge({ status }) {
  const colorMap = {
    Running: "bg-green-500/20 text-green-400",
    Pending: "bg-yellow-500/20 text-yellow-400",
    CrashLoopBackOff: "bg-red-500/20 text-red-400",
    Succeeded: "bg-blue-500/20 text-blue-400",
    Failed: "bg-red-500/20 text-red-400",
  };
  const cls = colorMap[status] ?? "bg-gray-500/20 text-gray-400";
  return (
    <span className={`px-2 py-0.5 rounded text-md font-medium ${cls}`}>
      {status}
    </span>
  );
}

function ContainerCard({ container, status }) {
  const stateKey = status?.state ? Object.keys(status.state)[0] : "unknown";
  const stateColorMap = {
    running: "text-green-400",
    waiting: "text-yellow-400",
    terminated: "text-red-400",
  };
  const stateColor = stateColorMap[stateKey] ?? "text-gray-400";

  return (
    <div className="mx-4 mb-2 rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-md font-medium text-gray-200">{container.name}</span>
        <span className={`text-md font-mono ${stateColor}`}>{stateKey}</span>
      </div>
      <div className="text-md text-gray-500 font-mono truncate mb-1">{container.image}</div>
      {status && (
        <div className="flex gap-4 mt-1.5 text-md text-gray-400">
          <span>
            Ready:{" "}
            <span className={status.ready ? "text-green-400" : "text-red-400"}>
              {status.ready ? "true" : "false"}
            </span>
          </span>
          <span>
            Restarts:{" "}
            <span className="text-gray-200">{status.restartCount ?? 0}</span>
          </span>
        </div>
      )}
      {container.ports?.length > 0 && (
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {container.ports.map((p, i) => (
            <span key={i} className="text-md bg-gray-700/50 text-gray-300 px-1.5 py-0.5 rounded font-mono">
              {p.containerPort}/{p.protocol ?? "TCP"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PodDetails({ pod, onClose }) {
  const [height, setHeight] = useState(PANEL_DEFAULT_HEIGHT);
  const [tab, setTab] = useState("overview");
  const [visible, setVisible] = useState(false);
  const dragRef = useRef(null);
  const startYRef = useRef(null);
  const startHeightRef = useRef(null);

  // Slide-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  // Drag-to-resize
  function onMouseDown(e) {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    function onMouseMove(ev) {
      const delta = startYRef.current - ev.clientY;
      const next = Math.min(Math.max(PANEL_MIN_HEIGHT, startHeightRef.current + delta), PANEL_MAX_HEIGHT);
      setHeight(next);
    }
    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  if (!pod) return null;

  const meta = pod.metadata;
  const spec = pod.spec;
  const status = pod.status;
  const containerStatuses = status?.containerStatuses ?? [];

  const labels = meta.labels ? Object.entries(meta.labels) : [];
  const annotations = meta.annotations
    ? Object.entries(meta.annotations).filter(([k]) => !k.startsWith("kubectl.kubernetes.io/last-applied"))
    : [];

  const tabs = ["overview", "containers", "labels", "conditions"];

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
          <StatusBadge status={status?.phase} />
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
            <Section title="Metadata">
              <KVRow label="UID" value={meta.uid} />
              <KVRow label="Created" value={meta.creationTimestamp} />
              <KVRow label="Node" value={spec?.nodeName} />
              <KVRow label="Service Account" value={spec?.serviceAccountName} />
              <KVRow label="Pod IP" value={status?.podIP} />
              <KVRow label="Host IP" value={status?.hostIP} />
              <KVRow
                label="Owner"
                value={
                  meta.ownerReferences?.length
                    ? `${meta.ownerReferences[0].kind}/${meta.ownerReferences[0].name}`
                    : "None"
                }
              />
              <KVRow label="QoS Class" value={status?.qosClass} />
            </Section>
          </>
        )}

        {tab === "containers" && (
          <Section title={`Containers (${spec?.containers?.length ?? 0})`}>
            {spec?.containers?.map((c) => {
              const cs = containerStatuses.find((s) => s.name === c.name);
              return <ContainerCard key={c.name} container={c} status={cs} />;
            })}
          </Section>
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

        {tab === "conditions" && (
          <Section title="Conditions">
            {status?.conditions?.length ? (
              <div className="px-4 space-y-2">
                {status.conditions.map((c) => (
                  <div
                    key={c.type}
                    className="flex items-center justify-between rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2"
                  >
                    <span className="text-md font-medium text-gray-300">{c.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-md text-gray-500 font-mono">{c.lastTransitionTime?.split("T")[0]}</span>
                      <span
                        className={`text-md font-semibold ${
                          c.status === "True" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 text-md text-gray-500">No conditions available</p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
