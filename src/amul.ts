import { AmulConfig, AmulRawProduct, ProductInfo } from './types';

const AMUL_STORE_ID = '62fa94df8c13af2e242eba16';
const AMUL_IMAGE_BASE_URL = 'https://shop.amul.com/s/62fa94df8c13af2e242eba16/';

/**
 * Generates the dynamic SHA-256 tid authentication token required by Amul API.
 */
export async function generateAmulTid(sessionTid: string, storeId = AMUL_STORE_ID): Promise<string> {
  const s = Date.now().toString();
  const t = Math.floor(Math.random() * 1000).toString();
  const payload = `${storeId}:${s}:${t}:${sessionTid}`;
  
  const msgUint8 = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${s}:${t}:${hashHex}`;
}

export interface FetchAmulResult {
  success: boolean;
  products: ProductInfo[];
  totalFound: number;
  sessionTid: string;
  error?: string;
}

/**
 * Fetches products from shop.amul.com with dynamic tid generation and session authentication.
 */
export async function fetchAmulProducts(config: AmulConfig): Promise<FetchAmulResult> {
  const category = config.category || 'protein';
  const substoreId = config.substoreId || '66505ff06510ee3d5903fd42';
  const limit = config.limit || 35;
  const cookieHeader = (config.cookies || '').trim();

  let activeCookies = cookieHeader;
  let sessionTid = '';

  // 1. Fetch /user/info.js to obtain the session tid
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const infoHeaders: Record<string, string> = {
      'user-agent': userAgent,
      'referer': `https://shop.amul.com/en/browse/${category}`,
      'accept': '*/*'
    };
    if (activeCookies) {
      infoHeaders['cookie'] = activeCookies;
    }

    const infoRes = await fetch('https://shop.amul.com/user/info.js', {
      headers: infoHeaders
    });

    // If cookies were not provided, capture any cookies set by Amul
    if (!activeCookies) {
      const setCookies = infoRes.headers.getSetCookie ? infoRes.headers.getSetCookie() : [];
      if (setCookies.length > 0) {
        activeCookies = setCookies.map(c => c.split(';')[0]).join('; ');
      }
    }

    const infoText = await infoRes.text();
    const tidMatch = infoText.match(/"tid"\s*:\s*"([^"]+)"/);
    if (tidMatch && tidMatch[1]) {
      sessionTid = tidMatch[1];
    }
  } catch (err: any) {
    console.warn('Failed to fetch /user/info.js:', err.message);
  }

  // Fallback session tid if Amul did not return one
  if (!sessionTid) {
    sessionTid = 's' + Math.random().toString(36).substring(2, 12);
  }

  // 2. Generate dynamic full tid
  const fullTid = await generateAmulTid(sessionTid);

  // 3. Query Amul products API
  const queryParams = new URLSearchParams({
    'fields[name]': '1',
    'fields[brand]': '1',
    'fields[categories]': '1',
    'fields[collections]': '1',
    'fields[alias]': '1',
    'fields[sku]': '1',
    'fields[price]': '1',
    'fields[compare_price]': '1',
    'fields[original_price]': '1',
    'fields[images]': '1',
    'fields[available]': '1',
    'fields[inventory_quantity]': '1',
    'filters[0][field]': 'categories',
    'filters[0][value][0]': category,
    'filters[0][operator]': 'in',
    'filters[0][original]': '1',
    'limit': limit.toString(),
    'start': '0',
    'v': '6',
    'device_type': 'other',
    'substore': substoreId
  });

  const apiUrl = `https://shop.amul.com/api/1/entity/ms.products?${queryParams.toString()}`;

  const apiHeaders: Record<string, string> = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'base_url': `https://shop.amul.com/en/browse/${category}`,
    'frontend': '1',
    'referer': `https://shop.amul.com/en/browse/${category}`,
    'tid': fullTid,
    'user-agent': userAgent
  };

  if (activeCookies) {
    apiHeaders['cookie'] = activeCookies;
  }

  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: apiHeaders
  });

  if (res.status === 401) {
    throw new Error('Amul API returned 401 Unauthorized. The session or cookies may need to be updated in the Admin Panel.');
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Amul API returned HTTP ${res.status}: ${errBody.substring(0, 200)}`);
  }

  const json = await res.json() as {
    data?: AmulRawProduct[];
    paging?: { total?: number };
  };

  const rawProducts = json.data || [];
  const products: ProductInfo[] = rawProducts.map(p => {
    const isAvailable = p.available === 1 || p.available === true;
    const inventoryQuantity = typeof p.inventory_quantity === 'number' ? p.inventory_quantity : 0;
    const firstImage = p.images && p.images[0] && p.images[0].image ? p.images[0].image : undefined;
    const imageUrl = firstImage ? (firstImage.startsWith('http') ? firstImage : `${AMUL_IMAGE_BASE_URL}${firstImage}`) : undefined;
    const productUrl = p.alias ? `https://shop.amul.com/en/product/${p.alias}` : `https://shop.amul.com/en/browse/${category}`;

    return {
      id: p._id,
      name: p.name || 'Unnamed Product',
      alias: p.alias || '',
      price: typeof p.price === 'number' ? p.price : 0,
      available: isAvailable,
      inventoryQuantity: inventoryQuantity,
      imageUrl,
      url: productUrl
    };
  });

  return {
    success: true,
    products,
    totalFound: json.paging?.total || products.length,
    sessionTid
  };
}
