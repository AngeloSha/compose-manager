// web/src/components/FileList.tsx
import cls from "classnames";

interface Props {
  files: string[];
  selected: string | null;
  checked: string[];
  onSelect: (path: string) => void;
  onCheck: (path: string) => void;
}

export default function FileList({ files, selected, checked, onSelect, onCheck }: Props) {
  return (
    <ul>
      {files.map(p => {
        const isSel = p === selected;
        const isChk = checked.includes(p);
        return (
          <li key={p}>
            <label
              className={cls(
                "flex items-center gap-2 p-2 cursor-pointer text-sm select-none",
                isSel
                  ? "bg-indigo-100 dark:bg-indigo-900"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              )}
            >
              <input
                type="checkbox"
                checked={isChk}
                onChange={() => onCheck(p)}
                className="form-checkbox"
              />
              <span
                onClick={() => onSelect(p)}
                className={cls("truncate", isSel && "font-semibold")}
              >
                {p}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
