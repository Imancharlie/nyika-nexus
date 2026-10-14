import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

type Params = Record<string, string | number | boolean | undefined>;

/** List endpoint that may or may not be paginated; always returns {results, count}. */
export const useAdminList = <T>(path: string, params: Params = {}) =>
  useQuery({
    queryKey: ["admin", path, params],
    queryFn: async () => {
      const data = await api.get<Paginated<T> | T[]>(path, params);
      return Array.isArray(data) ? { results: data, count: data.length, next: null, previous: null } : data;
    },
    placeholderData: keepPreviousData,
  });

export const useAdminQuery = <T>(path: string, enabled = true) =>
  useQuery({ queryKey: ["admin", path], queryFn: () => api.get<T>(path), enabled });

/** Mutation that refreshes every admin query and shows a toast. */
export const useAdminMutation = <TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  success?: string,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      if (success) toast.success(success);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
  });
};

export const adminApi = api;

export const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const fmtDay = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { dateStyle: "medium" }) : "—";

export const linesToList = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);
export const listToLines = (list?: string[]) => (list ?? []).join("\n");
