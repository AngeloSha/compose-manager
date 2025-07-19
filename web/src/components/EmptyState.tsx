// web/src/components/EmptyState.tsx
export default function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
      <p>Select a file from the left to view or edit its compose YAML.</p>
    </div>
  );
}

