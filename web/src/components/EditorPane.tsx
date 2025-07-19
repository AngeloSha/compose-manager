// web/src/components/EditorPane.tsx
import { Save } from "lucide-react";
import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";

interface Props {
  code: string;
  onChange: (v: string) => void;
  onSave: () => void;
  dirty: boolean;
}

export default function EditorPane({ code, onChange, onSave, dirty }: Props) {
  const [err, setErr] = useState("");

  // inline lint (YAML syntax)
  const lint = async (v: string) => {
    try {
      const msg = await fetch("/lint", { method: "POST", body: v }).then(r =>
        r.ok ? "" : r.text()
      );
      setErr(msg);
    } catch {
      setErr("Lint error");
    }
  };

  return (
    <div className="h-full relative flex flex-col">
      <div className="flex justify-end p-2 bg-gray-100 dark:bg-gray-800">
        <button
          onClick={onSave}
          disabled={!dirty}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
        >
          <Save size={16} /> Save
        </button>
      </div>
      <MonacoEditor
        height="calc(100% - 3rem)"
        language="yaml"
        theme={document.documentElement.classList.contains("dark") ? "vs-dark" : "light"}
        value={code}
        onChange={(v) => {
          onChange(v || "");
          lint(v || "");
        }}
        options={{ automaticLayout: true, wordWrap: "on" }}
      />
      {err && (
        <div className="absolute bottom-2 left-2 bg-red-600 text-white px-3 py-1 rounded shadow max-w-sm text-xs">
          {err}
        </div>
      )}
    </div>
  );
}

