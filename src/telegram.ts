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
 * Sends a rich formatted restock alert when an item becomes available.
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
    `<a href="${product.url}">${product.url}</a>`,
    ``,
    `⏰ <i>Checked at ${istTime} IST</i>`
  ].join('\n');

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

  return sendTelegramMessage(token, chatId, message, { parseMode: 'HTML', disablePreview: true });
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
