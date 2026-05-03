import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { KVRow, Section } from "../../components/Modals";

const PANEL_MIN_HEIGHT = 150;
const PANEL_MAX_HEIGHT = 600;
const PANEL_DEFAULT_HEIGHT = 380;

function StatusBadge({ conditions }) {
  const ready = conditions?.find((c) => c.type === "Ready");
  const isReady = ready?.status === "True";
  const cls = isReady ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400";
  return (
    <span className={`px-2 py-0.5 rounded text-md font-medium ${cls}`}>
      {isReady ? "Ready" : "Not Ready"}
    </span>
  );
}

function RoleBadge({ labels }) {
  const roles = Object.keys(labels ?? {})
    .filter((k) => k.startsWith("node-role.kubernetes.io/"))
    .map((k) => k.replace("node-role.kubernetes.io/", ""));
  if (!roles.length) return null;
  return (
    <>
      {roles.map((r) => (
        <span key={r} className="px-2 py-0.5 rounded text-md font-medium bg-purple-500/20 text-purple-400">
          {r}
        </span>
      ))}
    </>
  );
}

function ResourceBar({ label, used, total, unit = "" }) {
  if (!total) return null;
  const pct = Math.min(Math.round((used / total) * 100), 100);
  const color = pct > 85 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="px-4 py-1.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-md text-gray-500">{label}</span>
        <span className="text-md font-mono text-gray-200">
          {used}{unit} / {total}{unit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-700/60 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ConditionRow({ condition }) {
  const pressure = condition.type !== "Ready";
  // For pressure conditions, "True" is bad; for Ready, "True" is good
  const isGood = pressure ? condition.status === "False" : condition.status === "True";
  return (
    <div className="rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-md font-medium text-gray-300">{condition.type}</span>
        <div className="flex items-center gap-3">
          <span className="text-md text-gray-500 font-mono">
            {condition.lastHeartbeatTime?.split("T")[0]}
          </span>
          <span className={`text-md font-semibold ${isGood ? "text-green-400" : "text-red-400"}`}>
            {condition.status}
          </span>
        </div>
      </div>
      {condition.message && (
        <p className="text-md text-gray-500 font-mono mt-1 break-all">{condition.message}</p>
      )}
    </div>
  );
}

function ImageRow({ image }) {
  // Prefer the tagged name over the digest-only name
  const tagged = image.names?.find((n) => !n.includes("@sha256:") || n.includes(":")) ?? image.names?.[0];
  const shortName = tagged?.split("/").slice(-1)[0] ?? "—";
  const sizeMB = image.sizeBytes ? (image.sizeBytes / 1024 / 1024).toFixed(1) : null;
  return (
    <div className="flex items-center justify-between px-4 py-1.5 hover:bg-gray-800/40">
      <span className="text-md text-gray-200 font-mono truncate flex-1 mr-4">{shortName}</span>
      {sizeMB && <span className="text-md text-gray-500 font-mono shrink-0">{sizeMB} MB</span>}
    </div>
  );
}

function formatMemory(ki) {
  if (!ki) return "—";
  const val = parseInt(ki, 10);
  if (isNaN(val)) return ki;
  const gb = (val / 1024 / 1024).toFixed(1);
  return `${gb} GiB`;
}

function formatStorage(ki) {
  if (!ki) return "—";
  const val = parseInt(ki, 10);
  if (isNaN(val)) return ki;
  const gb = (val / 1024 / 1024).toFixed(0);
  return `${gb} GiB`;
}

export default function NodeDetails({ node, onClose }) {
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

  if (!node) return null;

  const meta = node.metadata;
  const spec = node.spec;
  const status = node.status;
  const info = status?.nodeInfo ?? {};

  const capacity = status?.capacity ?? {};
  const allocatable = status?.allocatable ?? {};
  const conditions = status?.conditions ?? [];
  const addresses = status?.addresses ?? [];
  const images = status?.images ?? [];
  const taints = spec?.taints ?? [];

  const internalIP = addresses.find((a) => a.type === "InternalIP")?.address;
  const externalIP = addresses.find((a) => a.type === "ExternalIP")?.address;
  const hostname = addresses.find((a) => a.type === "Hostname")?.address;

  const labels = meta.labels
    ? Object.entries(meta.labels).filter(([k]) => !k.startsWith("node-role.kubernetes.io/"))
    : [];
  const annotations = meta.annotations
    ? Object.entries(meta.annotations).filter(
        ([k]) => !k.startsWith("kubectl.kubernetes.io/last-applied")
      )
    : [];

  const cpuTotal = parseInt(capacity.cpu ?? "0", 10);
  const cpuAlloc = parseInt(allocatable.cpu ?? "0", 10);
  const memTotalKi = parseInt(capacity.memory ?? "0", 10);
  const memAllocKi = parseInt(allocatable.memory ?? "0", 10);
  const podTotal = parseInt(capacity.pods ?? "0", 10);
  const podAlloc = parseInt(allocatable.pods ?? "0", 10);

  const tabs = ["overview", "resources", "system", "images", "labels"];

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
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-md font-semibold text-gray-100 truncate">{meta.name}</span>
          <StatusBadge conditions={conditions} />
          <RoleBadge labels={meta.labels} />
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
            <Section title="Network">
              <KVRow label="Internal IP" value={internalIP} />
              {externalIP && <KVRow label="External IP" value={externalIP} />}
              <KVRow label="Hostname" value={hostname} />
              <KVRow label="Pod CIDR" value={spec?.podCIDR} />
              {spec?.podCIDRs?.length > 1 && (
                <KVRow label="Pod CIDRs" value={spec.podCIDRs.join(", ")} />
              )}
              <KVRow label="Kubelet port" value={String(status?.daemonEndpoints?.kubeletEndpoint?.Port ?? "—")} />
            </Section>
            <Section title="Metadata">
              <KVRow label="UID" value={meta.uid} />
              <KVRow label="Created" value={meta.creationTimestamp} />
              <KVRow label="Architecture" value={info.architecture} />
              <KVRow label="OS" value={info.operatingSystem} />
            </Section>
            {taints.length > 0 && (
              <Section title={`Taints (${taints.length})`}>
                {taints.map((t, i) => (
                  <KVRow key={i} label={t.effect} value={t.value ? `${t.key}=${t.value}` : t.key} />
                ))}
              </Section>
            )}
            <Section title="Conditions">
              <div className="px-4 space-y-2">
                {conditions.map((c) => <ConditionRow key={c.type} condition={c} />)}
              </div>
            </Section>
          </>
        )}

        {tab === "resources" && (
          <>
            <Section title="Capacity">
              <ResourceBar label="CPU" used={cpuAlloc} total={cpuTotal} unit=" cores" />
              <ResourceBar
                label="Memory"
                used={Math.round(memAllocKi / 1024 / 1024 * 10) / 10}
                total={Math.round(memTotalKi / 1024 / 1024 * 10) / 10}
                unit=" GiB"
              />
              <ResourceBar label="Pods" used={podAlloc} total={podTotal} />
            </Section>
            <Section title="Capacity (raw)">
              <KVRow label="CPU" value={`${capacity.cpu} cores`} />
              <KVRow label="Memory" value={formatMemory(capacity.memory?.replace("Ki", ""))} />
              <KVRow label="Ephemeral storage" value={formatStorage(capacity["ephemeral-storage"]?.replace("Ki", ""))} />
              <KVRow label="Pods" value={capacity.pods} />
              <KVRow label="HugePages 1Gi" value={capacity["hugepages-1Gi"]} />
              <KVRow label="HugePages 2Mi" value={capacity["hugepages-2Mi"]} />
            </Section>
            <Section title="Allocatable">
              <KVRow label="CPU" value={`${allocatable.cpu} cores`} />
              <KVRow label="Memory" value={formatMemory(allocatable.memory?.replace("Ki", ""))} />
              <KVRow label="Ephemeral storage" value={formatStorage(allocatable["ephemeral-storage"]?.replace("Ki", ""))} />
              <KVRow label="Pods" value={allocatable.pods} />
            </Section>
          </>
        )}

        {tab === "system" && (
          <>
            <Section title="Runtime">
              <KVRow label="Container runtime" value={info.containerRuntimeVersion} />
              <KVRow label="Kubelet" value={info.kubeletVersion} />
              {info.kubeProxyVersion && (
                <KVRow label="Kube proxy" value={info.kubeProxyVersion} />
              )}
              <KVRow label="Kernel" value={info.kernelVersion} />
              <KVRow label="OS image" value={info.osImage} />
            </Section>
            <Section title="Identity">
              <KVRow label="Machine ID" value={info.machineID} />
              <KVRow label="System UUID" value={info.systemUUID} />
              <KVRow label="Boot ID" value={info.bootID} />
            </Section>
            {status?.runtimeHandlers?.length > 0 && (
              <Section title={`Runtime handlers (${status.runtimeHandlers.length})`}>
                {status.runtimeHandlers.map((rh, i) => (
                  <div key={i} className="mx-4 mb-2 rounded-md border border-gray-700/60 bg-gray-800/30 px-3 py-2">
                    <span className="text-md font-medium text-gray-200 font-mono">
                      {rh.name || "<default>"}
                    </span>
                    <div className="flex gap-4 mt-1 text-md text-gray-400">
                      <span>
                        Recursive RO mounts:{" "}
                        <span className={rh.features?.recursiveReadOnlyMounts ? "text-green-400" : "text-gray-500"}>
                          {String(rh.features?.recursiveReadOnlyMounts ?? false)}
                        </span>
                      </span>
                      <span>
                        User namespaces:{" "}
                        <span className={rh.features?.userNamespaces ? "text-green-400" : "text-gray-500"}>
                          {String(rh.features?.userNamespaces ?? false)}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </>
        )}

        {tab === "images" && (
          <Section title={`Cached images (${images.length})`}>
            {images.length ? (
              images.map((img, i) => <ImageRow key={i} image={img} />)
            ) : (
              <p className="px-4 text-md text-gray-500">No images cached</p>
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
