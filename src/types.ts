export type ServicePackage = {
  id: string;
  name: string;
  description: string;
  serviceType: string;
  coverage: string;
  price: number;
  duration: string;
  includes: string[];
  benefits: string[];
  requirements: string[];
  serviceArea: string;
  featured?: boolean;
  image?: string;
};

export type ServiceRequestStatus =
  | "inasubiri"
  | "imethibitishwa"
  | "inachakatwa"
  | "imepangwa"
  | "imekamilika"
  | "imeghairiwa";

export type ServiceRequest = {
  id: string;
  packageId: string;
  packageName: string;
  price: number;
  status: ServiceRequestStatus;
  createdAt: string;
  preferredDate: string;
  location: string;
  farmLocation: string;
  farmSize: string;
  cropType: string;
  notes?: string;
};

export type PostComment = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
};

export type Post = {
  id: string;
  author: string;
  avatar: string;
  location: string;
  time: string;
  text: string;
  image?: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: PostComment[];
};

export type LearningCategory = {
  id: string;
  name: string;
  emoji: string;
};

export type LearningArticle = {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  readTime: number;
  image?: string;
  author: string;
  sections: { title: string; body: string }[];
  actions: string[];
  expertTip?: string;
  relatedIds: string[];
};

export type Expert = {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: string;
  location: string;
  availability: string;
  phone: string;
  bio: string;
  avatar: string;
};

export type Loan = {
  id: string;
  institution: string;
  loanType: string;
  amount: string;
  requirements: string[];
  repayment: string;
  howToApply: string;
  cta: "omba" | "jifunze";
};

export type NotificationType =
  | "huduma"
  | "ushauri"
  | "maoni"
  | "penda"
  | "mafunzo"
  | "mikopo"
  | "tangazo";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export type Consultation = {
  id: string;
  problem: string;
  cropType: string;
  image?: string;
  createdAt: string;
  status: "inajibiwa" | "inasubiri";
  expertName?: string;
  reply?: string;
};
