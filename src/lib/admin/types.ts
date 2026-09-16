export type AdminRole = 'USER' | 'ADMIN';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  emailVerified: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  firstLogin: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  createdAt?: string;
};

export type OperationOverview = {
  totalEvents: number;
  last24HoursEvents: number;
  last24HoursFailures: number;
  last24HoursByCategory: Record<string, number>;
};

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type SupplierCategory =
  | 'VENUE' | 'CATERING' | 'PHOTOGRAPHY_AND_VIDEO' | 'MUSIC' | 'DECOR'
  | 'WEDDING_ATTIRE' | 'BEAUTY' | 'CAKES_AND_SWEETS' | 'PLANNING'
  | 'TRANSPORT' | 'STATIONERY' | 'FAVORS' | 'JEWELRY' | 'OTHER';

export type Supplier = {
  id: string;
  name: string;
  category: SupplierCategory;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: SupplierStatus;
  notes?: string;
};

export type PageMetadata = { size: number; number: number; totalElements: number; totalPages: number };
export type Page<T> = { content: T[]; page: PageMetadata };
