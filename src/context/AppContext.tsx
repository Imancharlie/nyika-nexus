import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppNotification,
  Consultation,
  Post,
  PostComment,
  ServicePackage,
  ServiceRequest,
} from "@/types";
import { initialServiceRequests } from "@/data/services";
import { initialPosts } from "@/data/posts";
import { currentUser, initialConsultations } from "@/data/user";
import { initialNotifications } from "@/data/notifications";
import { formatDate } from "@/lib/utils";

type PersistedState = {
  serviceRequests: ServiceRequest[];
  posts: Post[];
  consultations: Consultation[];
  notifications: AppNotification[];
  savedArticleIds: string[];
  requestCounter: number;
};

const STORAGE_KEY = "agrimika_state_v1";

const defaultState: PersistedState = {
  serviceRequests: initialServiceRequests,
  posts: initialPosts,
  consultations: initialConsultations,
  notifications: initialNotifications,
  savedArticleIds: ["magonjwa-ya-nyanya", "matumizi-sahihi-ya-mbolea"],
  requestCounter: 124,
};

const loadState = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
};

type NewServiceRequest = {
  package: ServicePackage;
  preferredDate: string;
  location: string;
  farmLocation: string;
  farmSize: string;
  cropType: string;
  notes: string;
};

type AppContextValue = PersistedState & {
  createServiceRequest: (input: NewServiceRequest) => string;
  addPost: (text: string, image?: string) => void;
  toggleLike: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleSaveArticle: (articleId: string) => void;
  addConsultation: (problem: string, cropType: string, image?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PersistedState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable — prototype continues in memory
    }
  }, [state]);

  const createServiceRequest = useCallback(
    (input: NewServiceRequest) => {
      const id = `AGR-${String(state.requestCounter).padStart(6, "0")}`;
      const request: ServiceRequest = {
        id,
        packageId: input.package.id,
        packageName: input.package.name,
        price: input.package.price,
        status: "inasubiri",
        createdAt: formatDate(),
        preferredDate: input.preferredDate || formatDate(),
        location: input.location,
        farmLocation: input.farmLocation,
        farmSize: input.farmSize,
        cropType: input.cropType,
        notes: input.notes,
      };
      setState((prev) => ({
        ...prev,
        serviceRequests: [request, ...prev.serviceRequests],
        requestCounter: prev.requestCounter + 1,
        notifications: [
          {
            id: `n-${Date.now()}`,
            type: "huduma",
            title: "Ombi jipya limepokelewa",
            body: `Ombi namba ${id} limepokelewa. Tutakupigia simu ili kuendelea na hatua zinazofuata.`,
            time: "sasa hivi",
            read: false,
          },
          ...prev.notifications,
        ],
      }));
      return id;
    },
    [state.requestCounter]
  );

  const addPost = useCallback((text: string, image?: string) => {
    const post: Post = {
      id: `post-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      location: currentUser.location,
      time: "sasa hivi",
      text,
      image,
      likes: 0,
      liked: false,
      saved: false,
      comments: [],
    };
    setState((prev) => ({ ...prev, posts: [post, ...prev.posts] }));
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
          : post
      ),
    }));
  }, []);

  const toggleSavePost = useCallback((postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId ? { ...post, saved: !post.saved } : post
      ),
    }));
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    const comment: PostComment = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text,
      time: "sasa hivi",
    };
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      ),
    }));
  }, []);

  const toggleSaveArticle = useCallback((articleId: string) => {
    setState((prev) => ({
      ...prev,
      savedArticleIds: prev.savedArticleIds.includes(articleId)
        ? prev.savedArticleIds.filter((id) => id !== articleId)
        : [articleId, ...prev.savedArticleIds],
    }));
  }, []);

  const addConsultation = useCallback(
    (problem: string, cropType: string, image?: string) => {
      const consultation: Consultation = {
        id: `ush-${Date.now()}`,
        problem,
        cropType,
        image,
        createdAt: "sasa hivi",
        status: "inasubiri",
      };
      setState((prev) => ({
        ...prev,
        consultations: [consultation, ...prev.consultations],
        notifications: [
          {
            id: `n-${Date.now()}`,
            type: "ushauri",
            title: "Ombi lako limetumwa kwa mtaalamu",
            body: "Tutakujulisha mara mtaalamu atakapojibu ombi lako la ushauri.",
            time: "sasa hivi",
            read: false,
          },
          ...prev.notifications,
        ],
      }));
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, []);

  const unreadCount = useMemo(
    () => state.notifications.filter((item) => !item.read).length,
    [state.notifications]
  );

  const value: AppContextValue = {
    ...state,
    createServiceRequest,
    addPost,
    toggleLike,
    toggleSavePost,
    addComment,
    toggleSaveArticle,
    addConsultation,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
