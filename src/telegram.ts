import { ProductInfo } from './types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export interface TelegramResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Sends a raw text or HTML message to a Telegram chat/channel using the Bot API.
 */
export async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
  options: { parseMode?: 'HTML' | 'MarkdownV2'; disablePreview?: boolean } = {}
): Promise<TelegramResult> {
  const cleanToken = token.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return {
      success: false,
      error: 'Telegram Bot Token or Chat ID is not configured.'
    };
  }

  const endpoint = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
  const body: Record<string, any> = {
    chat_id: cleanChatId,
    text: text,
    parse_mode: options.parseMode || 'HTML',
    disable_web_page_preview: options.disablePreview ?? false
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json = await res.json() as {
      ok: boolean;
      description?: string;
      result?: { message_id?: number };
    };

    if (!json.ok) {
      return {
        success: false,
        error: json.description || `Telegram API responded with HTTP ${res.status}`
      };
    }

    return {
      success: true,
      messageId: json.result?.message_id
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Network error connecting to Telegram: ${err.message}`
    };
  }
}

/**
 * Sends a photo with HTML caption to a Telegram chat/channel using the Bot API.
 */
export async function sendTelegramPhoto(
  token: string,
  chatId: string,
  photoUrl: string,
  caption: string,
  options: { parseMode?: 'HTML' | 'MarkdownV2' } = {}
): Promise<TelegramResult> {
  const cleanToken = token.trim();
  const cleanChatId = chatId.trim();
  const cleanPhotoUrl = (photoUrl || '').trim();

  if (!cleanToken || !cleanChatId || !cleanPhotoUrl) {
    return {
      success: false,
      error: 'Telegram Bot Token, Chat ID, or Photo URL is missing.'
    };
  }

  const endpoint = `https://api.telegram.org/bot${cleanToken}/sendPhoto`;
  const body: Record<string, any> = {
    chat_id: cleanChatId,
    photo: cleanPhotoUrl,
    caption: caption,
    parse_mode: options.parseMode || 'HTML'
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json = await res.json() as {
      ok: boolean;
      description?: string;
      result?: { message_id?: number };
    };

    if (!json.ok) {
      return {
        success: false,
        error: json.description || `Telegram API responded with HTTP ${res.status}`
      };
    }

    return {
      success: true,
      messageId: json.result?.message_id
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Network error connecting to Telegram photo API: ${err.message}`
    };
  }
}

/**
 * Sends a rich formatted restock alert with product image when an item becomes available.
 */
export async function sendRestockAlert(
  token: string,
  chatId: string,
  product: ProductInfo
): Promise<TelegramResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const stockText = product.inventoryQuantity > 0
    ? `<b>${product.inventoryQuantity}</b> units in stock`
    : 'In Stock';

  const message = [
    `🚨 <b>AMUL PRODUCT RESTOCK ALERT!</b>`,
    ``,
    `🟢 <b>${escapeHtml(product.name)}</b> is now <b>AVAILABLE</b>!`,
    ``,
    `📦 <b>Stock:</b> ${stockText}`,
    `💰 <b>Price:</b> ₹${product.price}`,
    ``,
    `🛒 <b>Direct Buy Link:</b>`,
    `<a href="${escapeHtml(product.url)}">${escapeHtml(product.url)}</a>`,
    ``,
    `⏰ <i>Checked at ${istTime} IST</i>`
  ].join('\n');

  if (product.imageUrl) {
    const photoRes = await sendTelegramPhoto(token, chatId, product.imageUrl, message);
    if (photoRes.success) {
      return photoRes;
    }
    console.warn('sendTelegramPhoto failed, falling back to message:', photoRes.error);
  }

  return sendTelegramMessage(token, chatId, message, { parseMode: 'HTML', disablePreview: false });
}

/**
 * Sends an out-of-stock notification.
 */
export async function sendOutOfStockAlert(
  token: string,
  chatId: string,
  product: ProductInfo
): Promise<TelegramResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const message = [
    `⚠️ <b>AMUL STOCK STATUS UPDATE</b>`,
    ``,
    `🔴 <b>${escapeHtml(product.name)}</b> is now <b>OUT OF STOCK</b>.`,
    `💰 <b>Price:</b> ₹${product.price}`,
    `⏰ <i>Updated at ${istTime} IST</i>`
  ].join('\n');

  if (product.imageUrl) {
    const photoRes = await sendTelegramPhoto(token, chatId, product.imageUrl, message);
    if (photoRes.success) return photoRes;
  }

  return sendTelegramMessage(token, chatId, message, { parseMode: 'HTML', disablePreview: true });
}

/**
 * Sends the daily stock summary report at 9:00 AM IST.
 */
export async function sendTelegramDailySummary(
  token: string,
  chatId: string,
  inStockProducts: ProductInfo[],
  oosProducts: ProductInfo[]
): Promise<TelegramResult> {
  const istDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const lines = [
    `📊 <b>AMUL PROTEIN — DAILY STOCK DIGEST</b>`,
    `📅 <i>${istDate} • 9:00 AM IST Digest</i>`,
    ``
  ];

  if (inStockProducts.length > 0) {
    lines.push(`🟢 <b>AVAILABLE IN STOCK (${inStockProducts.length})</b>:`);
    for (const p of inStockProducts) {
      lines.push(`• <a href="${escapeHtml(p.url)}"><b>${escapeHtml(p.name)}</b></a>`);
      lines.push(`   └ 📦 <b>${p.inventoryQuantity}</b> units • ₹${p.price}`);
    }
  } else {
    lines.push(`⚪ <i>No tracked items currently in stock.</i>`);
  }

  lines.push(``);

  if (oosProducts.length > 0) {
    lines.push(`🔴 <b>CONTINUOUSLY OUT OF STOCK (${oosProducts.length})</b>:`);
    for (const p of oosProducts) {
      lines.push(`• <a href="${escapeHtml(p.url)}">${escapeHtml(p.name)}</a> (₹${p.price})`);
    }
  }

  lines.push(``);
  lines.push(`🛒 <i>Tap any product to order directly from official Amul store.</i>`);

  const message = lines.join('\n');
  const heroImage = inStockProducts.find(p => p.imageUrl)?.imageUrl || oosProducts.find(p => p.imageUrl)?.imageUrl;

  if (heroImage) {
    const photoRes = await sendTelegramPhoto(token, chatId, heroImage, message);
    if (photoRes.success) return photoRes;
  }

  return sendTelegramMessage(token, chatId, message, { parseMode: 'HTML', disablePreview: false });
}

/**
 * Verifies Telegram Bot credentials by sending a test ping.
 */
export async function sendTestNotification(
  token: string,
  chatId: string
): Promise<TelegramResult> {
  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const message = [
    `🤖 <b>Amul Stock Tracker — Bot Verification</b>`,
    ``,
    `✅ Telegram alerts are successfully connected!`,
    `Your Cloudflare Worker will notify you here immediately whenever tracked protein products are back in stock.`,
    ``,
    `⏰ <i>Sent at ${istTime} IST</i>`
  ].join('\n');

  return sendTelegramMessage(token, chatId, message, { parseMode: 'HTML', disablePreview: true });
}
