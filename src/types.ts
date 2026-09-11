export interface Env {
  AMUL_TRACKER_KV: KVNamespace;
  DEFAULT_ADMIN_PASSWORD?: string;
}

export interface TrackedRule {
  id: string;
  name: string;
  keyword: string; // matched case-insensitively against product name or alias
  enabled: boolean;
  createdAt: number;
  productId?: string;
  alias?: string;
  imageUrl?: string;
  price?: number;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  notifyOnRestock: boolean;
  notifyOnOutOfStock: boolean;
  cooldownHours: number; // minimum hours between repeat notifications for same in-stock product
}

export interface NtfyConfig {
  serverUrl: string; // e.g. https://amul-ntfy.onrender.com
  topic: string; // e.g. amul-protein-alerts
  token?: string; // optional auth token
  enabled: boolean;
  notifyOnRestock: boolean;
  notifyOnOutOfStock: boolean;
}

export interface AppriseConfig {
  serverUrl: string; // e.g. https://apprise.example.com
  urls: string; // e.g. tgram://bottoken/chatid, discord://...
  configKey?: string;
  enabled: boolean;
  notifyOnRestock: boolean;
  notifyOnOutOfStock: boolean;
}

export interface DailySummaryConfig {
  enabled: boolean;
  timeIst: string; // e.g. "09:00" for 9:00 AM IST
  lastSentDate?: string; // e.g. "2026-09-11" to prevent duplicate summaries
}

export interface AmulConfig {
  substoreId: string;
  category: string;
  cookies: string;
  limit: number;
}

export interface AppConfig {
  telegram: TelegramConfig;
  ntfy: NtfyConfig;
  apprise: AppriseConfig;
  amul: AmulConfig;
  summary: DailySummaryConfig;
  adminPassword: string;
  isScanningActive: boolean;
  rules: TrackedRule[];
}

export interface AmulRawProduct {
  _id: string;
  name: string;
  alias?: string;
  price?: number;
  available?: number | boolean;
  inventory_quantity?: number;
  brand?: string;
  images?: Array<{ image?: string }>;
}

export interface ProductInfo {
  id: string;
  alias: string;
  name: string;
  price: number;
  available: boolean;
  inventoryQuantity: number;
  imageUrl?: string;
  url: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
}

export interface StockStateItem {
  id: string;
  alias: string;
  name: string;
  price: number;
  available: boolean;
  inventoryQuantity: number;
  lastChecked: number;
  lastAlertSentAt?: number;
  lastStatusChangeAt?: number;
  imageUrl?: string;
  matchedRuleId?: string;
}

export type StockState = Record<string, StockStateItem>;

export interface ScanLog {
  id: string;
  timestamp: number;
  trigger: 'cron' | 'manual';
  totalFound: number;
  matchedCount: number;
  inStockCount: number;
  matchedProducts: Array<{
    id: string;
    name: string;
    available: boolean;
    stock: number;
    price: number;
  }>;
  alertsSent: string[];
  status: 'success' | 'warning' | 'error';
  message?: string;
}

export interface StockHistoryInterval {
  from: number; // Unix timestamp ms
  to?: number; // Unix timestamp ms (undefined if currently ongoing)
  available: boolean;
  quantity: number;
}

export type StockHistory = Record<string, StockHistoryInterval[]>;

export interface PublicProductStatus {
  id: string;
  name: string;
  alias: string;
  price: number;
  available: boolean;
  inventoryQuantity: number;
  imageUrl?: string;
  url: string;
  matchedRuleName?: string;
  lastChecked: number;
  lastStatusChangeAt?: number;
  history: StockHistoryInterval[];
  uptimePercentage24h: number;
  uptimePercentage7d: number;
  uptimePercentage30d: number;
}

export interface PublicStatusResponse {
  success: boolean;
  lastScanTimestamp: number | null;
  isScanningActive: boolean;
  totalTracked: number;
  totalInStock: number;
  products: PublicProductStatus[];
}
