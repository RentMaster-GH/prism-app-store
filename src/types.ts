export type CategoryType = 
  | 'All'
  | 'Audio & Music'
  | 'Design & Creative'
  | 'Health & Biometrics'
  | 'Developer Tools'
  | 'Productivity & Notes'
  | 'Sports'
  | 'Spatial & 3D';

export type DevicePlatform = 'All' | 'Phone' | 'Tablet' | 'Desktop' | 'Watch' | 'Vision';

export type PriceModel = 'Free' | 'One-Time' | 'Subscription' | 'Open Source';

export interface PermissionItem {
  id: string;
  name: string;
  category: 'Hardware' | 'Data' | 'Network' | 'System';
  required: boolean;
  reason: string;
  safetyImpact: 'Low' | 'Medium' | 'High';
}

export interface DataCollectedItem {
  category: string;
  linkedToUser: boolean;
  purposes: string[];
}

export interface VersionEntry {
  version: string;
  releaseDate: string;
  sizeMB: number;
  isLatest?: boolean;
  highlights: string[];
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  device: string;
  title: string;
  content: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  tagline: string;
  developer: string;
  developerVerified: boolean;
  category: CategoryType;
  price: number;
  priceFormatted: string;
  priceModel: PriceModel;
  subscriptionPeriod?: string;
  rating: number;
  reviewCount: number;
  downloadsCount: string;
  sizeMB: number;
  currentVersion: string;
  minOS: string;
  supportedDevices: DevicePlatform[];
  heroImage?: string;
  thumbnail: string;
  accentColor: string;
  editorialHighlight?: {
    headline: string;
    curatorQuote: string;
  };
  summary: string;
  features: string[];
  offlineCapable: boolean;
  zeroTrackers: boolean;
  openSource: boolean;
  license?: string;
  sourceCodeUrl?: string;
  liveAppUrl?: string;
  websiteUrl?: string;
  packageBundleName?: string;
  privacyGrade: 'A+' | 'A' | 'B+' | 'B';
  permissions: PermissionItem[];
  dataCollected: DataCollectedItem[];
  versionHistory: VersionEntry[];
  reviews: ReviewItem[];
  sandboxType: 'audio-synth' | 'vector-canvas' | 'biomechanics' | 'markdown-editor' | 'terminal' | 'adinkra-vector' | 'sports-tracker';
  isUserUploaded?: boolean;
  ownerId?: string; // Unique Identifier (UID) of the user who uploaded the app
  uploadedAt?: string;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface DeletedAppAuditItem {
  id: string;
  name: string;
  developer: string;
  category: string;
  reason: string;
  deletedBy: 'Owner' | 'Prism Store Developer / Manager';
  deletedAt: string;
  originalApp: AppItem;
  ownerId?: string;
}

export interface InstalledAppState {
  appId: string;
  installedVersion: string;
  installedAt: string;
  storageUsedMB: number;
  status: 'installed' | 'installing' | 'updating';
  progress: number;
}

