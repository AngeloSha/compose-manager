// web/src/App.tsx

import React, { useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import { Moon, Sun, Merge, Save } from 'lucide-react';
import cls from 'classnames';
import { listFiles, loadFile, saveFile, mergeFiles } from './api';
import EditorPane from './components/EditorPane';
import MergeDialog from './components/MergeDialog';
import EmptyState from './components/EmptyState';
import './index.css';

export default function App() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const [dark, setDark] = useState(prefersDark.matches);
  const [files, setFiles] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [dirty, setDirty] = useState(false);
  const [mergePaths, setMergePaths] = useState<string[]>([]);
  const [mergedYaml, setMergedYaml] = useState<string>('');
  const [showMerge, setShowMerge] = useState(false);

  // fetch file list on load
  useEffect(() => {
    listFiles().then(setFiles).catch(console.error);
  }, []);

  // dark‑mode toggle
  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add('dark') : root.classList.remove('dark');
  }, [dark]);

  // load the currently selected file
  useEffect(() => {
    if (current) {
      loadFile(current)
        .then((txt) => { setCode(txt); setDirty(false); })
        .catch(console.error);
    }
  }, [current]);

  const handleSave = async () => {
    if (current) {
      await saveFile(current, code);
      setDirty(false);
    }
  };

  const handleMerge = async () => {
    if (mergePaths.length < 2) return;
    const y = await mergeFiles(mergePaths);
    setMergedYaml(y);
    setShowMerge(true);
  };

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900">
      <header className="h-12 px-4 flex items-center justify-between bg-white dark:bg-gray-800 shadow">
        <h1 className="font-semibold">Compose‑Manager</h1>
        <div className="flex gap-3">
          <button
            disabled={mergePaths.length < 2}
            onClick={handleMerge}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Merge selected"
          >
            <Merge size={18} />
          </button>
          <button
            disabled={!dirty}
            onClick={handleSave}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Save current file"
          >
            <Save size={18} />
          </button>
          <button onClick={() => setDark(!dark)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <SplitPane split="vertical" minSize={200} defaultSize={240} className="flex-1">
        <aside className="h-full overflow-y-auto border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <ul>
            {files.map((p) => (
              <li key={p}>
                <label
                  className={cls(
                    'flex items-center gap-2 p-2 cursor-pointer',
                    current === p
                      ? 'bg-indigo-100 dark:bg-indigo-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={mergePaths.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) setMergePaths([...mergePaths, p]);
                      else setMergePaths(mergePaths.filter((x) => x !== p));
                    }}
                  />
                  <span onClick={() => setCurrent(p)} className="truncate">
                    {p}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </aside>

        <section className="h-full">
          {current ? (
            <EditorPane
              code={code}
              onChange={(v) => { setCode(v); setDirty(true); }}
              onSave={handleSave}
            />
          ) : (
            <EmptyState />
          )}
        </section>
      </SplitPane>

      {showMerge && (
        <MergeDialog
          yaml={mergedYaml}
          paths={mergePaths}
          onClose={() => setShowMerge(false)}
        />
      )}
    </div>
  );
}

