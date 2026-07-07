import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { KVRow, Section } from "../../components/Modals";
import YamlEditor from "../../components/YamlEditor";

const PANEL_MIN_HEIGHT = 150;
const PANEL_MAX_HEIGHT = 600;
const PANEL_DEFAULT_HEIGHT = 380;

function StatusBadge({ available, desired }) {
  const ready = available >= desired;
  const partial = available > 0 && available < desired;
  const cls = ready
    ? "bg-green-500/20 text-green-400"
    : partial
    ? "bg-yellow-500/20 text-yellow-400"
    : "bg-red-500/20 text-red-400";
  const label = ready ? "Available" : partial ? "Degraded" : "Unavailable";
  return (
    <span className={`px-2 py-0.5 rounded text-md font-medium ${cls}`}>
      {label}
    </span>
  );
}

function ReplicaBar({ available = 0, ready = 0, desired = 1 }) {
  const pctAvailable = desired > 0 ? Math.round((available / desired) * 100) : 0;
  return (
    <div className="px-4 py-1.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-md text-gray-500">Replica health</span>
        <span className="text-md font-mono text-gray-200">
          {available}/{desired} available · {ready}/{desired} ready
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-700/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pctAvailable === 100
              ? "bg-green-500"
              : pctAvailable > 0
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${pctAvailable}%` }}
        />
      </div>
    </div>
  );
}

function ContainerTemplateCard({ container }) {
  return (
    <div className="mx-4 mb-2 rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-md font-medium text-gray-200">{container.name}</span>
        {container.resources?.requests && (
          <span className="text-md font-mono text-gray-500">
            {container.resources.requests.cpu} CPU · {container.resources.requests.memory} mem
          </span>
        )}
      </div>
      <div className="text-md text-gray-500 font-mono truncate mb-1">{container.image}</div>
      {container.ports?.length > 0 && (
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {container.ports.map((p, i) => (
            <span
              key={i}
              className="text-md bg-gray-700/50 text-gray-300 px-1.5 py-0.5 rounded font-mono"
            >
              {p.containerPort}/{p.protocol ?? "TCP"}
            </span>
          ))}
        </div>
      )}
      {container.env?.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {container.env.slice(0, 4).map((e, i) => (
            <div key={i} className="flex gap-2 text-md font-mono">
              <span className="text-gray-500 shrink-0">{e.name}</span>
              <span className="text-gray-400 truncate">
                {e.value ?? (e.valueFrom ? "<valueFrom>" : "—")}
              </span>
            </div>
          ))}
          {container.env.length > 4 && (
            <span className="text-md text-gray-600">+{container.env.length - 4} more</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeployDetails({ deployment, onClose }) {
  const [height, setHeight] = useState(PANEL_DEFAULT_HEIGHT);
  const [tab, setTab] = useState("overview");
  const [visible, setVisible] = useState(false);
  const dragRef = useRef(null);
  const startYRef = useRef(null);
  const startHeightRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

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
      const next = Math.min(
        Math.max(PANEL_MIN_HEIGHT, startHeightRef.current + delta),
        PANEL_MAX_HEIGHT
      );
      setHeight(next);
    }
    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  if (!deployment) return null;

  const meta = deployment.metadata;
  const spec = deployment.spec;
  const status = deployment.status;

  const desired = spec?.replicas ?? 0;
  const available = status?.availableReplicas ?? 0;
  const ready = status?.readyReplicas ?? 0;
  const updated = status?.updatedReplicas ?? 0;

  const strategy = spec?.strategy?.type ?? "—";
  const rollingUpdate = spec?.strategy?.rollingUpdate;

  const selector = spec?.selector?.matchLabels
    ? Object.entries(spec.selector.matchLabels)
    : [];
  const labels = meta.labels ? Object.entries(meta.labels) : [];
  const annotations = meta.annotations
    ? Object.entries(meta.annotations).filter(
        ([k]) => !k.startsWith("kubectl.kubernetes.io/last-applied")
      )
    : [];
  const containers = spec?.template?.spec?.containers ?? [];

  const conditions = status?.conditions ?? [];

  const tabs = ["overview", "containers", "strategy", "labels", "conditions", "edit"];

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
          <StatusBadge available={available} desired={desired} />
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
      <div className={`flex-1 min-h-0 ${tab === "edit" ? "overflow-hidden" : "overflow-y-auto py-3"}`}>

        {tab === "overview" && (
          <>
            <Section title="Replicas">
              <ReplicaBar available={available} ready={ready} desired={desired} />
              <KVRow label="Desired" value={String(desired)} />
              <KVRow label="Updated" value={String(updated)} />
              <KVRow label="Ready" value={String(ready)} />
              <KVRow label="Available" value={String(available)} />
            </Section>
            <Section title="Metadata">
              <KVRow label="UID" value={meta.uid} />
              <KVRow label="Created" value={meta.creationTimestamp} />
              <KVRow label="Generation" value={String(meta.generation ?? "—")} />
              <KVRow label="Observed Gen." value={String(status?.observedGeneration ?? "—")} />
              <KVRow
                label="Owner"
                value={
                  meta.ownerReferences?.length
                    ? `${meta.ownerReferences[0].kind}/${meta.ownerReferences[0].name}`
                    : "None"
                }
              />
            </Section>
          </>
        )}

        {tab === "containers" && (
          <Section title={`Container templates (${containers.length})`}>
            {containers.map((c) => (
              <ContainerTemplateCard key={c.name} container={c} />
            ))}
          </Section>
        )}

        {tab === "strategy" && (
          <>
            <Section title="Update strategy">
              <KVRow label="Type" value={strategy} />
              {rollingUpdate && (
                <>
                  <KVRow label="Max unavailable" value={String(rollingUpdate.maxUnavailable ?? "—")} />
                  <KVRow label="Max surge" value={String(rollingUpdate.maxSurge ?? "—")} />
                </>
              )}
              <KVRow
                label="Min ready sec."
                value={String(spec?.minReadySeconds ?? 0)}
              />
              <KVRow
                label="Progress deadline"
                value={
                  spec?.progressDeadlineSeconds
                    ? `${spec.progressDeadlineSeconds}s`
                    : "—"
                }
              />
              <KVRow
                label="Revision history"
                value={String(spec?.revisionHistoryLimit ?? 10)}
              />
            </Section>
            <Section title={`Selector (${selector.length})`}>
              {selector.length ? (
                selector.map(([k, v]) => <KVRow key={k} label={k} value={v} />)
              ) : (
                <p className="px-4 text-md text-gray-500">No selector</p>
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

        {tab === "conditions" && (
          <Section title="Conditions">
            {conditions.length ? (
              <div className="px-4 space-y-2">
                {conditions.map((c) => (
                  <div
                    key={c.type}
                    className="rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-md font-medium text-gray-300">{c.type}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-md text-gray-500 font-mono">
                          {c.lastUpdateTime?.split("T")[0]}
                        </span>
                        <span
                          className={`text-md font-semibold ${
                            c.status === "True" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                    {c.message && (
                      <p className="text-md text-gray-500 font-mono mt-1 break-all">
                        {c.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 text-md text-gray-500">No conditions available</p>
            )}
          </Section>
        )}

        {tab === "edit" && (
          <YamlEditor type="deployment" item={deployment} />
        )}
      </div>
    </div>
  );
}
