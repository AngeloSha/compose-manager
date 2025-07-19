import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFiles, saveFile } from '../api';

export const useFiles = () =>
  useQuery({ queryKey: ['files'], queryFn: getFiles });

export const useSaveFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      saveFile(path, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] })
  });
};

