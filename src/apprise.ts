import { ProductInfo } from './types';

export interface AppriseResult {
  success: boolean;
  error?: string;
}

/**
 * Sends a notification using an Apprise API microservice.
 * Apprise supports 80+ notification services via URL schemes (e.g. tgram://, discord://, slack://, mailto://, etc.)
 */
export async function sendAppriseNotification(
  serverUrl: string,
  targetUrls: string,
  title: string,
  body: string,
  configKey?: string,
  attachUrl?: string
): Promise<AppriseResult> {
  const base = (serverUrl || '').trim().replace(/\/+$/, '');
  const urls = targetUrls.trim();

  if (!base) {
    return { success: false, error: 'Apprise Server URL is not configured.' };
  }

  // Apprise endpoint: /notify or /notify/{key}
  const endpoint = configKey ? `${base}/notify/${encodeURIComponent(configKey.trim())}` : `${base}/notify`;

  const payload: Record<string, any> = {
    title,
    body,
    type: 'info'
  };

  if (urls) {
    payload.urls = urls;
  }

  if (attachUrl) {
    payload.attachment = [attachUrl];
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        error: `Apprise API returned HTTP ${res.status}: ${errText.substring(0, 150)}`
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to connect to Apprise server at ${base}: ${err.message}`
    };
  }
}

/**
 * Sends an Apprise restock notification when an item becomes available.
 */
export async function sendAppriseRestockAlert(
  serverUrl: string,
  targetUrls: string,
  product: ProductInfo,
  configKey?: string
): Promise<AppriseResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const title = `🚨 Amul Restock: ${product.name}`;
  const body = [
    `🟢 ${product.name} is now IN STOCK!`,
    `📦 Stock: ${product.inventoryQuantity} units available`,
    `💰 Price: ₹${product.price}`,
    `🛒 Buy Now: ${product.url}`,
    `⏰ Checked at ${istTime} IST`
  ].join('\n');

  return sendAppriseNotification(serverUrl, targetUrls, title, body, configKey, product.imageUrl);
}

/**
 * Sends the daily stock summary report at 9:00 AM IST to Apprise.
 */
export async function sendAppriseDailySummary(
  serverUrl: string,
  targetUrls: string,
  inStockProducts: ProductInfo[],
  oosProducts: ProductInfo[],
  configKey?: string
): Promise<AppriseResult> {
  const istDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short'
  });

  const title = `📊 Daily Stock Digest (${istDate}): ${inStockProducts.length} in stock`;
  const lines = [
    `📅 9:00 AM IST Morning Update`,
    ``
  ];

  if (inStockProducts.length > 0) {
    lines.push(`🟢 IN STOCK (${inStockProducts.length}):`);
    for (const p of inStockProducts) {
      lines.push(`• ${p.name} (${p.inventoryQuantity} units, ₹${p.price})`);
    }
  } else {
    lines.push(`⚪ No tracked products in stock.`);
  }

  lines.push(``);

  if (oosProducts.length > 0) {
    lines.push(`🔴 CONTINUOUSLY OUT OF STOCK (${oosProducts.length}):`);
    for (const p of oosProducts) {
      lines.push(`• ${p.name} (₹${p.price})`);
    }
  }

  const heroImage = inStockProducts.find(p => p.imageUrl)?.imageUrl || oosProducts.find(p => p.imageUrl)?.imageUrl;

  return sendAppriseNotification(serverUrl, targetUrls, title, lines.join('\n'), configKey, heroImage);
}

/**
 * Sends a test notification to verify the Apprise API connection.
 */
export async function sendAppriseTest(
  serverUrl: string,
  targetUrls: string,
  configKey?: string
): Promise<AppriseResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const title = `🤖 Amul Stock Tracker — Apprise Connected!`;
  const body = [
    `✅ Your Apprise service is successfully connected!`,
    `Restock alerts will be dispatched to your configured channels.`,
    `⏰ Tested at ${istTime} IST`
  ].join('\n');

  return sendAppriseNotification(serverUrl, targetUrls, title, body, configKey);
}

/**
 * Sends an Apprise out-of-stock notification when an item is no longer available.
 */
export async function sendAppriseOutOfStockAlert(
  serverUrl: string,
  targetUrls: string,
  product: ProductInfo,
  configKey?: string
): Promise<AppriseResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const title = `⚠️ Amul Out of Stock: ${product.name}`;
  const body = [
    `🔴 ${product.name} is now OUT OF STOCK.`,
    `💰 Price: ₹${product.price}`,
    `⏰ Checked at ${istTime} IST`
  ].join('\n');

  return sendAppriseNotification(serverUrl, targetUrls, title, body, configKey, product.imageUrl);
}

