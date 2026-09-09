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
