import {
  AppConfig,
  ProductInfo,
  PublicProductStatus,
  PublicStatusResponse,
  ScanLog,
  StockHistory,
  StockHistoryInterval,
  StockState,
  TrackedRule
} from './types';
import { fetchAmulProducts } from './amul';
import { sendOutOfStockAlert, sendRestockAlert } from './telegram';
import { sendNtfyOutOfStockAlert, sendNtfyRestockAlert } from './ntfy';
import { sendAppriseOutOfStockAlert, sendAppriseRestockAlert } from './apprise';

const CONFIG_KEY = 'app_config';
const STOCK_STATE_KEY = 'stock_state';
const SCAN_LOGS_KEY = 'scan_logs';
const STOCK_HISTORY_KEY = 'stock_history';
const MAX_LOGS = 50;

/**
 * Returns default initial configuration with the 3 target products requested by the user.
 */
export function getDefaultConfig(): AppConfig {
  const now = Date.now();
  return {
    telegram: {
      botToken: '',
      chatId: '',
      notifyOnRestock: true,
      notifyOnOutOfStock: false,
      cooldownHours: 4
    },
    ntfy: {
      serverUrl: 'https://amul-ntfy.onrender.com',
      topic: 'amul-protein-alerts',
      token: '',
      enabled: false,
      notifyOnRestock: true,
      notifyOnOutOfStock: false
    },
    apprise: {
      serverUrl: '',
      urls: '',
      configKey: '',
      enabled: false,
      notifyOnRestock: true,
      notifyOnOutOfStock: false
    },
    amul: {
      substoreId: '66505ff06510ee3d5903fd42', // Gujarat substore
      category: 'protein',
      // Seeded with user-provided jsessionid for instant working connectivity
      cookies: 'jsessionid=s%3APxVRf3vIVbfydh1%2FCNwjmqrU.vA3qqTzYU3Cg0It6DIUCrJOLIwk0%2FYoXkojO5iK35LU',
      limit: 35
    },
    adminPassword: '1sumit100',
    isScanningActive: true,
    rules: [
      {
        id: 'rule-lassi',
        name: 'Protein Lassi',
        keyword: 'protein lassi',
        enabled: true,
        createdAt: now
      },
      {
        id: 'rule-buttermilk',
        name: 'Protein Buttermilk',
        keyword: 'protein buttermilk',
        enabled: true,
        createdAt: now
      },
      {
        id: 'rule-blueberry',
        name: 'Blueberry Protein Shake',
        keyword: 'blueberry protein',
        enabled: true,
        createdAt: now
      }
    ]
  };
}

/**
 * In-memory fallback if KV is not yet provisioned in a bare development environment.
 */
const memoryStore = new Map<string, string>();

async function kvGet<T>(kv: KVNamespace | undefined, key: string): Promise<T | null> {
  try {
    if (kv) {
      const data = await kv.get(key, 'json');
      return data as T | null;
    }
  } catch (e) {
    console.warn(`KV get failed for ${key}, falling back to memory:`, e);
  }
  const raw = memoryStore.get(key);
  return raw ? JSON.parse(raw) : null;
}

async function kvPut(kv: KVNamespace | undefined, key: string, value: any): Promise<void> {
  const str = JSON.stringify(value);
  try {
    if (kv) {
      await kv.put(key, str);
      return;
    }
  } catch (e) {
    console.warn(`KV put failed for ${key}, falling back to memory:`, e);
  }
  memoryStore.set(key, str);
}

export async function getConfig(kv: KVNamespace | undefined): Promise<AppConfig> {
  const existing = await kvGet<AppConfig>(kv, CONFIG_KEY);
  const defaults = getDefaultConfig();
  if (!existing) {
    await kvPut(kv, CONFIG_KEY, defaults);
    return defaults;
  }
  let needsSave = false;
  if (!existing.ntfy) {
    existing.ntfy = defaults.ntfy;
    needsSave = true;
  }
  if (!existing.apprise) {
    existing.apprise = defaults.apprise;
    needsSave = true;
  }
  if (!existing.adminPassword || existing.adminPassword === 'admin') {
    existing.adminPassword = '1sumit100';
    needsSave = true;
  }
  if (!existing.rules || existing.rules.length === 0) {
    existing.rules = defaults.rules;
    needsSave = true;
  }
  if (needsSave) {
    await kvPut(kv, CONFIG_KEY, existing);
  }
  return existing;
}

export async function saveConfig(kv: KVNamespace | undefined, config: AppConfig): Promise<void> {
  await kvPut(kv, CONFIG_KEY, config);
}

export async function getStockState(kv: KVNamespace | undefined): Promise<StockState> {
  const existing = await kvGet<StockState>(kv, STOCK_STATE_KEY);
  return existing || {};
}

export async function saveStockState(kv: KVNamespace | undefined, state: StockState): Promise<void> {
  await kvPut(kv, STOCK_STATE_KEY, state);
}

export async function getScanLogs(kv: KVNamespace | undefined): Promise<ScanLog[]> {
  const existing = await kvGet<ScanLog[]>(kv, SCAN_LOGS_KEY);
  return existing || [];
}

export async function appendScanLog(kv: KVNamespace | undefined, log: ScanLog): Promise<void> {
  const logs = await getScanLogs(kv);
  logs.unshift(log);
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }
  await kvPut(kv, SCAN_LOGS_KEY, logs);
}

export async function getStockHistory(kv: KVNamespace | undefined): Promise<StockHistory> {
  const existing = await kvGet<StockHistory>(kv, STOCK_HISTORY_KEY);
  return existing || {};
}

export async function saveStockHistory(kv: KVNamespace | undefined, history: StockHistory): Promise<void> {
  await kvPut(kv, STOCK_HISTORY_KEY, history);
}

/**
 * Calculates availability uptime percentage (0-100%) for a given product history within a time window.
 */
export function calculateUptimePercentage(
  intervals: StockHistoryInterval[],
  windowMs: number,
  now = Date.now()
): number {
  if (!intervals || intervals.length === 0) return 0;
  const windowStart = now - windowMs;
  let inStockMs = 0;
  let totalTrackedMs = 0;

  for (const interval of intervals) {
    const start = Math.max(interval.from, windowStart);
    const end = Math.min(interval.to || now, now);

    if (end > start) {
      const duration = end - start;
      totalTrackedMs += duration;
      if (interval.available) {
        inStockMs += duration;
      }
    }
  }

  if (totalTrackedMs === 0) {
    const current = intervals[intervals.length - 1];
    return current?.available ? 100 : 0;
  }

  return Math.min(100, Math.max(0, Math.round((inStockMs / totalTrackedMs) * 1000) / 10));
}

/**
 * Compiles public status data for consumer display (no auth required).
 */
export async function getPublicStatusData(kv: KVNamespace | undefined): Promise<PublicStatusResponse> {
  const config = await getConfig(kv);
  const state = await getStockState(kv);
  const history = await getStockHistory(kv);
  const logs = await getScanLogs(kv);
  const now = Date.now();

  const publicProducts: PublicProductStatus[] = [];
  const trackedRules = config.rules.filter(r => r.enabled);

  for (const rule of trackedRules) {
    const matchedStateItem = Object.values(state).find(item =>
      item.name.toLowerCase().includes(rule.keyword.toLowerCase()) ||
      rule.keyword.toLowerCase().includes(item.name.toLowerCase()) ||
      item.alias.toLowerCase().includes(rule.keyword.toLowerCase())
    );

    const productHistory = matchedStateItem ? (history[matchedStateItem.id] || []) : [];
    const inStock = matchedStateItem ? (matchedStateItem.available && matchedStateItem.inventoryQuantity > 0) : false;
    const quantity = matchedStateItem ? matchedStateItem.inventoryQuantity : 0;
    const price = matchedStateItem ? matchedStateItem.price : 0;
    const url = matchedStateItem?.alias
      ? `https://shop.amul.com/en/product/${matchedStateItem.alias}`
      : `https://shop.amul.com/en/browse/${config.amul.category || 'protein'}`;

    publicProducts.push({
      id: matchedStateItem?.id || rule.id,
      name: matchedStateItem?.name || rule.name,
      alias: matchedStateItem?.alias || '',
      price,
      available: inStock,
      inventoryQuantity: quantity,
      url,
      matchedRuleName: rule.name,
      lastChecked: matchedStateItem?.lastChecked || now,
      lastStatusChangeAt: matchedStateItem?.lastStatusChangeAt || now,
      history: productHistory,
      uptimePercentage24h: calculateUptimePercentage(productHistory, 24 * 3600 * 1000, now),
      uptimePercentage7d: calculateUptimePercentage(productHistory, 7 * 24 * 3600 * 1000, now),
      uptimePercentage30d: calculateUptimePercentage(productHistory, 30 * 24 * 3600 * 1000, now)
    });
  }

  return {
    success: true,
    lastScanTimestamp: logs[0]?.timestamp || null,
    isScanningActive: config.isScanningActive,
    totalTracked: publicProducts.length,
    totalInStock: publicProducts.filter(p => p.available).length,
    products: publicProducts
  };
}

/**
 * Checks if a product matches a given rule.
 * Handles fuzzy multi-word patterns (e.g. "protein buttermilk" matches "Amul High Protein Buttermilk, 200 mL").
 */
export function matchesRule(product: ProductInfo, rule: TrackedRule): boolean {
  if (!rule.enabled || !rule.keyword) return false;

  const targetText = `${product.name} ${product.alias}`.toLowerCase();
  const keyword = rule.keyword.trim().toLowerCase();

  // If keyword contains space, require all words to be present in targetText
  const terms = keyword.split(/\s+/).filter(Boolean);
  if (terms.length > 1) {
    const allTermsMatch = terms.every(t => {
      // Normalize 'buttermilk' vs 'butter milk'
      if (t === 'buttermilk' || t === 'butter-milk') {
        return targetText.includes('buttermilk') || targetText.includes('butter milk');
      }
      return targetText.includes(t);
    });
    if (allTermsMatch) return true;
  }

  // Direct substring or regex
  try {
    const regex = new RegExp(keyword.replace(/\*/g, '.*'), 'i');
    return regex.test(targetText);
  } catch {
    return targetText.includes(keyword);
  }
}

export interface ScanExecutionResult {
  success: boolean;
  totalFound: number;
  matchedCount: number;
  inStockCount: number;
  matchedProducts: ProductInfo[];
  alertsSent: string[];
  log: ScanLog;
  error?: string;
}

/**
 * Sends a lightweight keep-alive ping to self-hosted Render services (e.g. ntfy, Apprise)
 * to ensure they never sleep on Render's free tier (which spins down after 15m of inactivity).
 */
export async function keepAliveRenderServices(config: AppConfig): Promise<void> {
  const urlsToPing: string[] = [];

  if (config.ntfy?.serverUrl?.includes('.onrender.com')) {
    const base = config.ntfy.serverUrl.trim().replace(/\/+$/, '');
    urlsToPing.push(`${base}/v1/health`);
  }

  if (config.apprise?.serverUrl?.includes('.onrender.com')) {
    const base = config.apprise.serverUrl.trim().replace(/\/+$/, '');
    urlsToPing.push(`${base}/status`);
  }

  // Always ping the default amul-ntfy Render service to keep it active
  const defaultRenderNtfy = 'https://amul-ntfy.onrender.com/v1/health';
  if (!urlsToPing.includes(defaultRenderNtfy)) {
    urlsToPing.push(defaultRenderNtfy);
  }

  await Promise.allSettled(
    urlsToPing.map(url =>
      fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'Cloudflare-Worker-Amul-KeepAlive/1.0' },
        signal: AbortSignal.timeout(4000)
      }).catch(() => {})
    )
  );
}

/**
 * Runs a scan against Amul, detects inventory changes, triggers alerts, and saves state.
 */
export async function runScan(
  kv: KVNamespace | undefined,
  trigger: 'cron' | 'manual',
  overrideConfig?: AppConfig
): Promise<ScanExecutionResult> {
  const config = overrideConfig || (await getConfig(kv));
  const now = Date.now();

  // Continuously ping Render services to prevent free-tier spindown
  keepAliveRenderServices(config).catch(() => {});

  // If disabled and triggered by cron, skip (do not write to KV)
  if (!config.isScanningActive && trigger === 'cron') {
    const skipLog: ScanLog = {
      id: `log-${now}`,
      timestamp: now,
      trigger,
      totalFound: 0,
      matchedCount: 0,
      inStockCount: 0,
      matchedProducts: [],
      alertsSent: [],
      status: 'warning',
      message: 'Scanning paused in configuration.'
    };
    return {
      success: true,
      totalFound: 0,
      matchedCount: 0,
      inStockCount: 0,
      matchedProducts: [],
      alertsSent: [],
      log: skipLog
    };
  }

  let amulResult;
  try {
    amulResult = await fetchAmulProducts(config.amul);
  } catch (err: any) {
    const errorLog: ScanLog = {
      id: `log-${now}`,
      timestamp: now,
      trigger,
      totalFound: 0,
      matchedCount: 0,
      inStockCount: 0,
      matchedProducts: [],
      alertsSent: [],
      status: 'error',
      message: err.message || 'Failed to fetch Amul products.'
    };
    if (trigger === 'manual') {
      await appendScanLog(kv, errorLog);
    }
    return {
      success: false,
      totalFound: 0,
      matchedCount: 0,
      inStockCount: 0,
      matchedProducts: [],
      alertsSent: [],
      log: errorLog,
      error: err.message
    };
  }

  const previousState = await getStockState(kv);
  const stockHistory = await getStockHistory(kv);
  let hasAnyStateChanged = false;
  let historyChanged = false;

  const matchedProducts: ProductInfo[] = [];
  const alertsSent: string[] = [];

  // Match products against active rules
  for (const product of amulResult.products) {
    const matchingRule = config.rules.find(r => matchesRule(product, r));
    if (matchingRule) {
      product.matchedRuleId = matchingRule.id;
      product.matchedRuleName = matchingRule.name;
      matchedProducts.push(product);

      const prev = previousState[product.id];
      const isCurrentlyInStock = product.available && product.inventoryQuantity > 0;
      const wasPreviouslyInStock = prev ? prev.available && prev.inventoryQuantity > 0 : false;

      let shouldAlertRestock = false;
      let shouldAlertOOS = false;

      if (isCurrentlyInStock) {
        if (!prev || !wasPreviouslyInStock || !prev.lastAlertSentAt) {
          // Status transitioned from OOS to In Stock, or no alert has been sent yet
          shouldAlertRestock = true;
        } else {
          // It was already in stock, check cooldown
          const cooldownMs = (config.telegram?.cooldownHours || 4) * 3600 * 1000;
          if (now - prev.lastAlertSentAt > cooldownMs) {
            shouldAlertRestock = true;
          }
        }
      } else if (wasPreviouslyInStock && !isCurrentlyInStock) {
        // Status transitioned from In Stock to OOS
        if (
          config.telegram?.notifyOnOutOfStock ||
          config.ntfy?.notifyOnOutOfStock ||
          config.apprise?.notifyOnOutOfStock
        ) {
          shouldAlertOOS = true;
        }
      }

      let alertSentForThisProduct = false;

      // Dispatch Telegram notifications if configured
      if (config.telegram?.botToken && config.telegram?.chatId) {
        if (shouldAlertRestock && config.telegram.notifyOnRestock) {
          const res = await sendRestockAlert(
            config.telegram.botToken,
            config.telegram.chatId,
            product
          );
          if (res.success) {
            alertsSent.push(`Restock alert sent for: ${product.name} (${product.inventoryQuantity} units)`);
            alertSentForThisProduct = true;
          } else {
            console.error(`Telegram alert error for ${product.name}:`, res.error);
          }
        } else if (shouldAlertOOS && config.telegram.notifyOnOutOfStock) {
          const res = await sendOutOfStockAlert(
            config.telegram.botToken,
            config.telegram.chatId,
            product
          );
          if (res.success) {
            alertsSent.push(`Telegram out-of-stock update sent for: ${product.name}`);
            alertSentForThisProduct = true;
          }
        }
      }

      // Dispatch ntfy push notifications if configured and enabled
      if (config.ntfy?.enabled && config.ntfy?.topic) {
        if (shouldAlertRestock && config.ntfy.notifyOnRestock) {
          const ntfyRes = await sendNtfyRestockAlert(
            config.ntfy.serverUrl,
            config.ntfy.topic,
            product,
            config.ntfy.token
          );
          if (ntfyRes.success) {
            alertsSent.push(`ntfy push alert sent for: ${product.name}`);
            alertSentForThisProduct = true;
          } else {
            console.error(`ntfy alert error for ${product.name}:`, ntfyRes.error);
          }
        } else if (shouldAlertOOS && config.ntfy.notifyOnOutOfStock) {
          const ntfyRes = await sendNtfyOutOfStockAlert(
            config.ntfy.serverUrl,
            config.ntfy.topic,
            product,
            config.ntfy.token
          );
          if (ntfyRes.success) {
            alertsSent.push(`ntfy out-of-stock alert sent for: ${product.name}`);
            alertSentForThisProduct = true;
          } else {
            console.error(`ntfy out-of-stock alert error for ${product.name}:`, ntfyRes.error);
          }
        }
      }

      // Dispatch Apprise notifications if configured and enabled
      if (config.apprise?.enabled && config.apprise?.serverUrl) {
        if (shouldAlertRestock && config.apprise.notifyOnRestock) {
          const appriseRes = await sendAppriseRestockAlert(
            config.apprise.serverUrl,
            config.apprise.urls,
            product,
            config.apprise.configKey
          );
          if (appriseRes.success) {
            alertsSent.push(`Apprise alert sent for: ${product.name}`);
            alertSentForThisProduct = true;
          } else {
            console.error(`Apprise alert error for ${product.name}:`, appriseRes.error);
          }
        } else if (shouldAlertOOS && config.apprise.notifyOnOutOfStock) {
          const appriseRes = await sendAppriseOutOfStockAlert(
            config.apprise.serverUrl,
            config.apprise.urls,
            product,
            config.apprise.configKey
          );
          if (appriseRes.success) {
            alertsSent.push(`Apprise out-of-stock alert sent for: ${product.name}`);
            alertSentForThisProduct = true;
          } else {
            console.error(`Apprise out-of-stock alert error for ${product.name}:`, appriseRes.error);
          }
        }
      }

      // Check if state transitioned or alert dispatched
      const isStatusTransition = !prev || wasPreviouslyInStock !== isCurrentlyInStock;
      if (isStatusTransition || alertSentForThisProduct) {
        hasAnyStateChanged = true;
      }

      // Track interval history for availability graphs
      if (!stockHistory[product.id]) {
        stockHistory[product.id] = [{
          from: now,
          available: isCurrentlyInStock,
          quantity: product.inventoryQuantity
        }];
        historyChanged = true;
      } else {
        const intervals = stockHistory[product.id];
        const lastInterval = intervals[intervals.length - 1];
        if (lastInterval && lastInterval.available !== isCurrentlyInStock) {
          lastInterval.to = now;
          intervals.push({
            from: now,
            available: isCurrentlyInStock,
            quantity: product.inventoryQuantity
          });
          // Prune intervals older than 35 days to preserve a full 1-month rolling availability window
          const cutoff = now - (35 * 24 * 3600 * 1000);
          stockHistory[product.id] = intervals.filter(iv => (iv.to || now) > cutoff);
          historyChanged = true;
        } else if (lastInterval && lastInterval.quantity !== product.inventoryQuantity && isCurrentlyInStock) {
          // Update current quantity in active interval without creating new interval
          lastInterval.quantity = product.inventoryQuantity;
          historyChanged = true;
        }
      }

      // Update state record for this product
      previousState[product.id] = {
        id: product.id,
        alias: product.alias,
        name: product.name,
        price: product.price,
        available: isCurrentlyInStock,
        inventoryQuantity: product.inventoryQuantity,
        lastChecked: now,
        lastAlertSentAt: alertSentForThisProduct ? now : prev?.lastAlertSentAt,
        lastStatusChangeAt: prev && wasPreviouslyInStock !== isCurrentlyInStock ? now : prev?.lastStatusChangeAt || now
      };
    }
  }

  // CRITICAL KV OPTIMIZATION:
  // Only persist to KV if a status change occurred or an alert was sent!
  // This reduces daily KV writes from 1,440+ down to < 20 writes/day, well below the 1,000/day limit.
  if (hasAnyStateChanged) {
    await saveStockState(kv, previousState);
  }
  if (historyChanged) {
    await saveStockHistory(kv, stockHistory);
  }

  const inStockCount = matchedProducts.filter(p => p.available && p.inventoryQuantity > 0).length;

  const log: ScanLog = {
    id: `log-${now}`,
    timestamp: now,
    trigger,
    totalFound: amulResult.totalFound,
    matchedCount: matchedProducts.length,
    inStockCount,
    matchedProducts: matchedProducts.map(p => ({
      id: p.id,
      name: p.name,
      available: p.available && p.inventoryQuantity > 0,
      stock: p.inventoryQuantity,
      price: p.price
    })),
    alertsSent,
    status: 'success',
    message: `Scanned ${amulResult.totalFound} products. ${matchedProducts.length} tracked items matched (${inStockCount} in stock).`
  };

  // Only persist log if manual trigger, alert dispatched, or status changed
  if (trigger === 'manual' || alertsSent.length > 0 || hasAnyStateChanged) {
    await appendScanLog(kv, log);
  }

  return {
    success: true,
    totalFound: amulResult.totalFound,
    matchedCount: matchedProducts.length,
    inStockCount,
    matchedProducts,
    alertsSent,
    log
  };
}
