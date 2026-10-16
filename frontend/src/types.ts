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
  image?: string | null;
  active?: boolean;
  sortOrder?: number;
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
  pk: number;
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
  id: number;
  author: string;
  authorId: number;
  avatar: string;
  text: string;
  time: string;
  createdAt: string;
};

export type Post = {
  id: number;
  author: string;
  authorId: number;
  avatar: string;
  location: string;
  time: string;
  createdAt: string;
  text: string;
  image?: string | null;
  video?: string | null;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: PostComment[];
  groupId?: number | null;
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
  image?: string | null;
  author: string;
  sections: { title: string; body: string }[];
  actions: string[];
  expertTip?: string;
  relatedIds: string[];
  saved: boolean;
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
  | "tangazo"
  | "oda"
  | "malipo"
  | "msaada";

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  time: string;
  createdAt: string;
  read: boolean;
};

export type Consultation = {
  id: number;
  problem: string;
  cropType: string;
  image?: string | null;
  createdAt: string;
  status: "inajibiwa" | "inasubiri";
  expertName?: string | null;
  reply?: string;
};

export type ProductCategory = "mbegu" | "mbolea" | "vifaa" | "dawa" | "mifugo";

export type Product = {
  id: number;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  unit: string;
  stock: number;
  inStock: boolean;
  image: string | null;
  featured: boolean;
  active: boolean;
};

export type OrderStatus = "imepokelewa" | "inaandaliwa" | "njiani" | "imefika" | "imeghairiwa";
export type PaymentStatus = "inasubiri" | "imelipwa" | "imeshindikana";

export type OrderItem = {
  id: number;
  productId: number | null;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: number;
  code: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  deliveryLocation: string;
  phone: string;
  notes: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderRequestStatus = "mpya" | "inashughulikiwa" | "imekamilika" | "imekataliwa";

export type OrderRequest = {
  id: number;
  productName: string;
  category: ProductCategory | "";
  quantity: string;
  location: string;
  neededBy: string | null;
  notes: string;
  status: OrderRequestStatus;
  adminReply: string;
  createdAt: string;
};

export type Payment = {
  id: number;
  reference: string;
  orderId: number | null;
  orderCode: string | null;
  amount: number;
  phone: string;
  description: string;
  status: PaymentStatus;
  method: string;
  createdAt: string;
  paidAt: string | null;
};

export type Group = {
  id: number;
  name: string;
  description: string;
  region: string;
  crop: string;
  image: string | null;
  membersCount: number;
  memberAvatars: string[];
  isMember: boolean;
  active: boolean;
  createdAt: string;
};

export type TicketStatus = "wazi" | "imejibiwa" | "imefungwa";
export type TicketCategory = "akaunti" | "malipo" | "oda" | "huduma" | "nyingine";

export type TicketMessage = {
  id: number;
  author: string;
  body: string;
  fromStaff: boolean;
  createdAt: string;
};

export type Ticket = {
  id: number;
  code: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string; phone: string };
};
