// web/src/api.ts

export interface FileMap {
  [path: string]: string;
}

export async function listFiles(): Promise<string[]> {
  const res = await fetch('/files');
  if (!res.ok) throw new Error(`listFiles: ${res.statusText}`);
  const data = (await res.json()) as FileMap;
  // return an array of paths
  return Object.keys(data);
}

export async function loadFile(path: string): Promise<string> {
  const res = await fetch(`/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`loadFile: ${res.statusText}`);
  return res.text();
}

export async function saveFile(path: string, body: string): Promise<void> {
  const res = await fetch(`/file?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    body,
  });
  if (!res.ok) throw new Error(`saveFile: ${res.statusText}`);
}

export async function mergeFiles(paths: string[]): Promise<string> {
  const q = paths.map(encodeURIComponent).join(',');
  const res = await fetch(`/merge?paths=${q}`);
  if (!res.ok) throw new Error(`mergeFiles: ${res.statusText}`);
  return res.text();
}

