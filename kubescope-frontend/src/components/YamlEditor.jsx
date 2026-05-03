import { useRef, useState } from "react";
import { Save, RotateCcw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import yaml from "js-yaml";


export default function YamlEditor({ pod, onSaveSuccess }) {
  const initialYaml = yaml.dump(pod, { indent: 2, lineWidth: -1 });
  const [value, setValue] = useState(initialYaml);
  const [parseError, setParseError] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | success | error
  const [saveError, setSaveError] = useState(null);
  const textareaRef = useRef(null);

  // Validate YAML on every keystroke
  function handleChange(e) {
    const raw = e.target.value;
    setValue(raw);
    try {
      yaml.load(raw);
      setParseError(null);
    } catch (err) {
      setParseError(err.message);
    }
  }

  // Reset to the original pod YAML
  function handleReset() {
    setValue(initialYaml);
    setParseError(null);
    setSaveState("idle");
    setSaveError(null);
  }

  // Tab key inserts spaces instead of changing focus
  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const next = value.substring(0, start) + "  " + value.substring(end);
      setValue(next);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textareaRef.current.selectionStart = start + 2;
        textareaRef.current.selectionEnd = start + 2;
      });
    }
  }

  async function handleSave() {
    // Re-validate before sending
    let parsed;
    try {
      parsed = yaml.load(value);
    } catch (err) {
      setParseError(err.message);
      return;
    }

    setSaveState("saving");
    setSaveError(null);

    try {
      const { name, namespace } = pod.metadata;
      const res = await fetch(`/api/pods/?namespace=${namespace}&name=${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yaml: value }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.log(body);
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      setSaveState("success");
      onSaveSuccess?.();

      // Reset to idle after a brief success flash
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setSaveState("error");
      setSaveError(err.message);
    }
  }

  const isDirty = value !== initialYaml;
  const canSave = !parseError && isDirty && saveState !== "saving";

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50 shrink-0">
        <h3 className="font-medium text-blue-500">KubeScope YAML Editor</h3>
        <div className="flex items-center gap-2">
          {saveState === "success" && (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle size={14} /> Applied successfully
            </span>
          )}
          {saveState === "error" && (
            <span className="flex items-center gap-1.5 text-red-400 text-sm truncate max-w-xs" title={saveError}>
              <AlertCircle size={14} /> {saveError}
            </span>
          )}
          {parseError && saveState !== "error" && (
            <span className="flex items-center gap-1.5 text-yellow-400 text-sm truncate max-w-xs" title={parseError}>
              <AlertCircle size={14} /> Invalid YAML
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            disabled={!isDirty || saveState === "saving"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset to original"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saveState === "saving" ? (
              <><Loader2 size={13} className="animate-spin" /> Applying…</>
            ) : (
              <><Save size={13} /> Apply</>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={`absolute inset-0 w-full h-full resize-none bg-gray-950/60 text-sm font-mono leading-relaxed p-4 text-gray-300 focus:outline-none focus:ring-1 ${
            parseError
              ? "focus:ring-red-500/50 border-red-500/30"
              : "focus:ring-blue-500/30"
          }`}
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
}