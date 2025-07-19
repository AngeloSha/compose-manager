// web/src/components/MergeDialog.tsx
import { useState } from "react";
import DiffViewer from "react-diff-viewer";

interface Props {
  yaml: string;
  paths: string[];
  onClose: () => void;
  onSave: (dest: string) => void;
}

export default function MergeDialog({ yaml, paths, onClose, onSave }: Props) {
  const [dst, setDst] = useState("/data/merged-compose.yml");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-11/12 max-w-6xl p-6 rounded-2xl shadow-2xl space-y-4">
        <h2 className="text-xl font-semibold mb-2">
          Preview merge ({paths.length} files)
        </h2>

        <DiffViewer
          oldValue={paths.length ? "" : ""}
          newValue={yaml}
          splitView
          styles={{
            variables: {
              dark: {
                codeFoldGutterBackground: "#1e1e1e",
              },
            },
          }}
        />

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dst}
            onChange={e => setDst(e.target.value)}
            className="flex-1 px-3 py-1 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-sm"
          />
          <button
            onClick={() => onSave(dst)}
            className="px-4 py-1 bg-green-600 text-white rounded"
          >
            Save Merged
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-300 dark:bg-gray-700 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

