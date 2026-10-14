import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AppNotification,
  Consultation,
  Expert,
  Group,
  LearningArticle,
  LearningCategory,
  Loan,
  Order,
  OrderRequest,
  Payment,
  Post,
  PostComment,
  Product,
  ServicePackage,
  ServiceRequest,
  Ticket,
  TicketMessage,
} from "@/types";

const useList = <T>(key: QueryKey, path: string, params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({ queryKey: [...key, params ?? {}], queryFn: () => api.get<T[]>(path, params) });

const useItem = <T>(key: QueryKey, path: string, enabled = true) =>
  useQuery({ queryKey: key, queryFn: () => api.get<T>(path), enabled });

// ---------- farm ----------
export const usePackages = () => useList<ServicePackage>(["packages"], "/packages/");
export const usePackage = (id?: string) => useItem<ServicePackage>(["packages", id], `/packages/${id}/`, !!id);
export const useServiceRequests = () => useList<ServiceRequest>(["service-requests"], "/service-requests/");

export const useCreateServiceRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, string>) => api.post<ServiceRequest>("/service-requests/", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-requests"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useExperts = () => useList<Expert>(["experts"], "/experts/");
export const useLoans = () => useList<Loan>(["loans"], "/loans/");
export const useConsultations = () => useList<Consultation>(["consultations"], "/consultations/");

export const useCreateConsultation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData) => api.post<Consultation>("/consultations/", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consultations"] }),
  });
};

export const useCategories = () => useList<LearningCategory>(["categories"], "/learning/categories/");
export const useArticles = () => useList<LearningArticle>(["articles"], "/learning/articles/");
export const useArticle = (id?: string) => useItem<LearningArticle>(["articles", "one", id], `/learning/articles/${id}/`, !!id);

export const useToggleSaveArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ saved: boolean }>(`/learning/articles/${id}/save/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
};

// ---------- notifications ----------
export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<AppNotification[]>("/notifications/"),
    refetchInterval: 60_000,
  });

export const useUnreadCount = () => {
  const { data } = useNotifications();
  return data?.filter((n) => !n.read).length ?? 0;
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | "all") =>
      api.post(id === "all" ? "/notifications/read-all/" : `/notifications/${id}/read/`),
    onMutate: (id) => {
      qc.setQueryData<AppNotification[]>(["notifications"], (old) =>
        old?.map((n) => (id === "all" || n.id === id ? { ...n, read: true } : n)),
      );
    },
  });
};

// ---------- community ----------
export type PostFilter = { group?: number; mine?: boolean; saved?: boolean };

export const usePosts = (filter: PostFilter = {}) =>
  useList<Post>(["posts"], "/posts/", {
    group: filter.group,
    mine: filter.mine ? 1 : undefined,
    saved: filter.saved ? 1 : undefined,
  });

const replacePost = (qc: ReturnType<typeof useQueryClient>, post: Post) => {
  qc.setQueriesData<Post[]>({ queryKey: ["posts"] }, (old) => old?.map((p) => (p.id === post.id ? post : p)));
};

export const usePostActions = () => {
  const qc = useQueryClient();
  const like = useMutation({
    mutationFn: (id: number) => api.post<Post>(`/posts/${id}/like/`),
    onMutate: (id) => {
      qc.setQueriesData<Post[]>({ queryKey: ["posts"] }, (old) =>
        old?.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)),
      );
    },
    onSuccess: (post) => replacePost(qc, post),
  });
  const save = useMutation({
    mutationFn: (id: number) => api.post<Post>(`/posts/${id}/save/`),
    onSuccess: (post) => {
      replacePost(qc, post);
      qc.invalidateQueries({ queryKey: ["posts", { saved: 1 }] });
    },
  });
  const comment = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => api.post<PostComment>(`/posts/${id}/comments/`, { text }),
    onSuccess: (c, { id }) => {
      qc.setQueriesData<Post[]>({ queryKey: ["posts"] }, (old) =>
        old?.map((p) => (p.id === id ? { ...p, comments: [...p.comments, c] } : p)),
      );
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/posts/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
  return { like, save, comment, remove };
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData) => api.post<Post>("/posts/", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
};

export const useGroups = (mine = false) => useList<Group>(["groups"], "/groups/", { mine: mine ? 1 : undefined });
export const useGroup = (id?: string) => useItem<Group>(["groups", "one", id], `/groups/${id}/`, !!id);

export const useGroupActions = () => {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["groups"] });
  return {
    join: useMutation({ mutationFn: (id: number) => api.post<Group>(`/groups/${id}/join/`), onSuccess: refresh }),
    leave: useMutation({ mutationFn: (id: number) => api.post<Group>(`/groups/${id}/leave/`), onSuccess: refresh }),
    create: useMutation({
      mutationFn: (body: Partial<Group>) => api.post<Group>("/groups/", body),
      onSuccess: refresh,
    }),
  };
};

// ---------- market ----------
export const useProducts = () => useList<Product>(["products"], "/products/");
export const useOrders = () => useList<Order>(["orders"], "/orders/");
export const useOrderRequests = () => useList<OrderRequest>(["order-requests"], "/order-requests/");
export const usePayments = () => useList<Payment>(["payments"], "/payments/");

export type PayResult = { payment: Payment; gateway: "pending_confirmation" | "manual" | "failed" };

export const useOrderActions = () => {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["payments"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  return {
    create: useMutation({
      mutationFn: (body: { items: { productId: number; quantity: number }[]; deliveryLocation: string; phone?: string; notes?: string }) =>
        api.post<Order>("/orders/", body),
      onSuccess: refresh,
    }),
    pay: useMutation({
      mutationFn: ({ id, phone }: { id: number; phone?: string }) => api.post<PayResult>(`/orders/${id}/pay/`, { phone }),
      onSuccess: refresh,
    }),
    cancel: useMutation({ mutationFn: (id: number) => api.post<Order>(`/orders/${id}/cancel/`), onSuccess: refresh }),
  };
};

export const useCreateOrderRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<OrderRequest>) => api.post<OrderRequest>("/order-requests/", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order-requests"] }),
  });
};

// ---------- support ----------
export const useTickets = () => useList<Ticket>(["tickets"], "/support/tickets/");
export const useTicket = (id?: string) => useItem<Ticket>(["tickets", "one", id], `/support/tickets/${id}/`, !!id);

export const useTicketActions = () => {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["tickets"] });
  return {
    create: useMutation({
      mutationFn: (body: { subject: string; category: string; message: string }) => api.post<Ticket>("/support/tickets/", body),
      onSuccess: refresh,
    }),
    reply: useMutation({
      mutationFn: ({ id, body }: { id: number; body: string }) => api.post<TicketMessage>(`/support/tickets/${id}/reply/`, { body }),
      onSuccess: refresh,
    }),
  };
};
