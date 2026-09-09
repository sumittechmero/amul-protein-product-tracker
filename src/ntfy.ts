import { ProductInfo } from './types';

export interface NtfyResult {
  success: boolean;
  error?: string;
}

export interface PublishOptions {
  priority?: '1' | '2' | '3' | '4' | '5' | 'min' | 'low' | 'default' | 'high' | 'urgent';
  tags?: string[];
  clickUrl?: string;
  token?: string;
}

/**
 * Publishes a notification to a self-hosted ntfy instance (e.g. hosted on Render) or ntfy.sh.
 */
export async function publishNtfy(
  serverUrl: string,
  topic: string,
  title: string,
  message: string,
  options: PublishOptions = {}
): Promise<NtfyResult> {
  const base = (serverUrl || 'https://ntfy.sh').trim().replace(/\/+$/, '');
  const cleanTopic = topic.trim();

  if (!cleanTopic) {
    return { success: false, error: 'ntfy topic is not configured.' };
  }

  const endpoint = `${base}/${encodeURIComponent(cleanTopic)}`;

  const headers: Record<string, string> = {
    'Title': title,
    'Priority': options.priority || '4',
    'Content-Type': 'text/plain; charset=utf-8'
  };

  if (options.tags && options.tags.length > 0) {
    headers['Tags'] = options.tags.join(',');
  }

  if (options.clickUrl) {
    headers['Click'] = options.clickUrl;
    headers['Actions'] = `view, Buy Now, ${options.clickUrl}`;
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token.trim()}`;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: message
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        error: `ntfy server returned HTTP ${res.status}: ${errText.substring(0, 150)}`
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to connect to ntfy at ${base}: ${err.message}`
    };
  }
}

/**
 * Dispatches an instant restock push notification to ntfy.
 */
export async function sendNtfyRestockAlert(
  serverUrl: string,
  topic: string,
  product: ProductInfo,
  token?: string
): Promise<NtfyResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const title = `🚨 Restock Alert: ${product.name}`;
  const message = [
    `🟢 ${product.name} is now IN STOCK!`,
    `📦 Stock: ${product.inventoryQuantity} units available`,
    `💰 Price: ₹${product.price}`,
    `⏰ Checked: ${istTime} IST`,
    `🔗 Tap to buy on Amul Shop: ${product.url}`
  ].join('\n');

  return publishNtfy(serverUrl, topic, title, message, {
    priority: 'urgent',
    tags: ['bell', 'shopping_cart', 'package'],
    clickUrl: product.url,
    token
  });
}

/**
 * Sends a test ping to ntfy to verify connection and topic reception.
 */
export async function sendNtfyTest(
  serverUrl: string,
  topic: string,
  token?: string
): Promise<NtfyResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const title = `🤖 Amul Stock Tracker — ntfy Connected!`;
  const message = [
    `✅ Your self-hosted ntfy server on Render is successfully connected!`,
    `Stock restock alerts will be delivered here instantly.`,
    `⏰ Sent at ${istTime} IST`
  ].join('\n');

  return publishNtfy(serverUrl, topic, title, message, {
    priority: 'high',
    tags: ['white_check_mark', 'rocket'],
    clickUrl: serverUrl,
    token
  });
}

/**
 * Dispatches an out-of-stock notification to ntfy.
 */
export async function sendNtfyOutOfStockAlert(
  serverUrl: string,
  topic: string,
  product: ProductInfo,
  token?: string
): Promise<NtfyResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const title = `⚠️ Out of Stock: ${product.name}`;
  const message = [
    `🔴 ${product.name} is now OUT OF STOCK.`,
    `💰 Price: ₹${product.price}`,
    `⏰ Checked: ${istTime} IST`
  ].join('\n');

  return publishNtfy(serverUrl, topic, title, message, {
    priority: 'default',
    tags: ['warning', 'x'],
    clickUrl: product.url,
    token
  });
}

