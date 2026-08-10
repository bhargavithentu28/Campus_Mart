export interface MockUser {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  joinedDate: Date;
  department: string;
  year: number;
  branch: string;
  ratings: number[];
  badges: string[];
  isVerified: boolean;
  isAdmin: boolean;
}

export interface MockProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  category: string;
  images: string[];
  seller: string | MockUser;
  pickupLocation: string;
  pickupTime: string;
  isNegotiable: boolean;
  isSold: boolean;
  viewsCount: number;
  likesCount: number;
  aiAnalysis: {
    recommendedPrice: number;
    quickSalePrice: number;
    scamScore: number;
    aiSummary: string;
    isFlagged: boolean;
  };
  createdAt: Date;
}

export interface MockMessage {
  _id: string;
  chat: string;
  sender: string;
  text: string;
  image?: string;
  file?: string;
  seen: boolean;
  createdAt: Date;
}

export interface MockChat {
  _id: string;
  participants: string[] | MockUser[];
  lastMessage?: string | MockMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockNotification {
  _id: string;
  recipient: string;
  sender?: string;
  type: 'message' | 'offer' | 'wishlist' | 'price_drop' | 'system';
  title: string;
  body: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface MockReport {
  _id: string;
  reporter: string;
  reportedProduct?: string;
  reportedUser?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

export const mockUsers: MockUser[] = [
  {
    _id: "u_1",
    email: "rohan.sharma2023@coep.ac.in",
    name: "Rohan Sharma",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    joinedDate: new Date("2025-08-15"),
    department: "Computer Engineering",
    year: 3,
    branch: "B.Tech Software",
    ratings: [5, 4, 5, 5],
    badges: ["Verified Student", "Top Rated Seller", "Cycle Owner"],
    isVerified: true,
    isAdmin: false
  },
  {
    _id: "u_2",
    email: "priya.patel2024@coep.ac.in",
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    joinedDate: new Date("2025-09-01"),
    department: "Electronics & Telecomm",
    year: 2,
    branch: "B.Tech VLSI",
    ratings: [4, 5, 4],
    badges: ["Verified Student", "Helper"],
    isVerified: true,
    isAdmin: false
  },
  {
    _id: "u_admin",
    email: "admin.campusmart@coep.ac.in",
    name: "CampusMart Administrator",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    joinedDate: new Date("2025-01-01"),
    department: "Campus Operations",
    year: 4,
    branch: "Staff",
    ratings: [5],
    badges: ["Moderator", "Staff Verified"],
    isVerified: true,
    isAdmin: true
  }
];

export const mockProducts: MockProduct[] = [
  {
    _id: "p_1",
    title: "Hercules Top Gear 21-Speed Cycle",
    description: "Selling my Hercules bicycle in excellent running condition. Shimanos gears work perfectly, new dual brakes and high-grip front tires installed last month. Perfect for riding from hostels to academic department blocks.",
    price: 3500,
    condition: "Good",
    category: "Cycles",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"
    ],
    seller: "u_1",
    pickupLocation: "Hostel Block C Lounge",
    pickupTime: "Evenings after 6:00 PM",
    isNegotiable: true,
    isSold: false,
    viewsCount: 142,
    likesCount: 12,
    aiAnalysis: {
      recommendedPrice: 3800,
      quickSalePrice: 3000,
      scamScore: 8,
      aiSummary: "A well-maintained Hercules 21-speed geared bicycle, ideal for daily campus travel. New brakes and tires add value. Priced fairly.",
      isFlagged: false
    },
    createdAt: new Date("2026-06-28T10:00:00Z")
  },
  {
    _id: "p_2",
    title: "iPad Air 4th Gen (64GB, Wi-Fi) with Apple Pencil 2",
    description: "Perfect for taking digital handwritten notes in lectures! Selling my iPad Air (Space Gray) which is scratchless. Glass screen protector is pre-installed. Selling along with original Apple Pencil 2nd generation and magnetic flip cover.",
    price: 28000,
    condition: "Like New",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"
    ],
    seller: "u_2",
    pickupLocation: "Central Library Entrance",
    pickupTime: "12 PM to 4 PM (Lunch hours)",
    isNegotiable: false,
    isSold: false,
    viewsCount: 290,
    likesCount: 45,
    aiAnalysis: {
      recommendedPrice: 29000,
      quickSalePrice: 26500,
      scamScore: 4,
      aiSummary: "Scratch-free iPad Air 4th Gen bundled with Apple Pencil 2. Excellent student productivity tool. Pricing matches market averages.",
      isFlagged: false
    },
    createdAt: new Date("2026-07-01T14:30:00Z")
  },
  {
    _id: "p_3",
    title: "Engineering Mechanics Lab Manual & Equipment Set",
    description: "Complete mechanics kit including drawing board, scale set, T-square, and completed lab workbook for 1st Year engineering. The workbook is checked and clean. Extremely useful to save money on buying fresh drawing boards.",
    price: 600,
    condition: "Good",
    category: "Lab Equipment",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600"
    ],
    seller: "u_1",
    pickupLocation: "Mechanical Workshop Block",
    pickupTime: "Tuesdays/Thursdays at 4:30 PM",
    isNegotiable: true,
    isSold: false,
    viewsCount: 54,
    likesCount: 3,
    aiAnalysis: {
      recommendedPrice: 650,
      quickSalePrice: 450,
      scamScore: 2,
      aiSummary: "Essential first-year engineering kit containing drawing utilities and a manual. Highly discounted and convenient.",
      isFlagged: false
    },
    createdAt: new Date("2026-07-03T09:15:00Z")
  },
  {
    _id: "p_4",
    title: "Wooden Study Desk with Drawers",
    description: "Sturdy wooden table for hostel rooms. Has three drawers with functioning locks. Easily fits a dual-monitor setup or multiple text books. Can provide two plastic chairs for free along with this table.",
    price: 1800,
    condition: "Fair",
    category: "Furniture",
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600"
    ],
    seller: "u_2",
    pickupLocation: "Girls Hostel Block A (Room 304)",
    pickupTime: "Weekends anytime",
    isNegotiable: true,
    isSold: false,
    viewsCount: 88,
    likesCount: 9,
    aiAnalysis: {
      recommendedPrice: 2000,
      quickSalePrice: 1500,
      scamScore: 5,
      aiSummary: "Spacious hostel study desk. Fair condition with normal wear. Bonus chairs included, making it highly economical for room setup.",
      isFlagged: false
    },
    createdAt: new Date("2026-07-04T12:00:00Z")
  },
  {
    _id: "p_5",
    title: "HC Verma Concepts of Physics Vol 1 & 2",
    description: "Concepts of Physics by H.C. Verma. Clean pages, no pencil marks, ideal for revision or competitive exam preparation (JEE/GATE physics fundamentals). Essential books for physics courses.",
    price: 300,
    condition: "Good",
    category: "Books",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"
    ],
    seller: "u_1",
    pickupLocation: "Main Canteen Parking",
    pickupTime: "Anytime",
    isNegotiable: false,
    isSold: false,
    viewsCount: 32,
    likesCount: 1,
    aiAnalysis: {
      recommendedPrice: 350,
      quickSalePrice: 250,
      scamScore: 1,
      aiSummary: "HC Verma Volume 1 and 2 in clean condition. Highly sought textbook bundle. Very budget-friendly.",
      isFlagged: false
    },
    createdAt: new Date("2026-07-05T08:00:00Z")
  }
];

export const mockChats: MockChat[] = [
  {
    _id: "c_1",
    participants: ["u_1", "u_2"],
    lastMessage: "m_2",
    createdAt: new Date("2026-07-05T15:00:00Z"),
    updatedAt: new Date("2026-07-05T15:15:00Z")
  }
];

export const mockMessages: MockMessage[] = [
  {
    _id: "m_1",
    chat: "c_1",
    sender: "u_2",
    text: "Hi Rohan, is your Hercules Cycle still available for ₹3500?",
    seen: true,
    createdAt: new Date("2026-07-05T15:00:00Z")
  },
  {
    _id: "m_2",
    chat: "c_1",
    sender: "u_1",
    text: "Hey Priya, yes it is! I can show it to you today near the Hostel C parking lounge if you want.",
    seen: false,
    createdAt: new Date("2026-07-05T15:15:00Z")
  }
];

export const mockNotifications: MockNotification[] = [
  {
    _id: "n_1",
    recipient: "u_1",
    sender: "u_2",
    type: "message",
    title: "New Message from Priya",
    body: "Priya: Hi Rohan, is your Hercules Cycle still available for ₹3500?",
    referenceId: "c_1",
    isRead: false,
    createdAt: new Date("2026-07-05T15:00:00Z")
  },
  {
    _id: "n_2",
    recipient: "u_1",
    type: "system",
    title: "Listing Verified",
    body: "Your iPad Air listing has been scanned by CampusMart AI and is now live on the marketplace.",
    isRead: true,
    createdAt: new Date("2026-07-01T14:35:00Z")
  }
];

export const mockReports: MockReport[] = [
  {
    _id: "r_1",
    reporter: "u_2",
    reportedProduct: "p_3",
    reason: "Incorrect photo; listing claims to be drawing board but image is generic engineering workshop photo.",
    status: "pending",
    createdAt: new Date("2026-07-04T10:00:00Z")
  }
];
