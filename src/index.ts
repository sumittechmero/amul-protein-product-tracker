import { Env, TrackedRule } from './types';
import { getAdminHtml } from './admin';
import {
  getConfig,
  saveConfig,
  getStockState,
  getScanLogs,
  runScan,
  matchesRule
} from './scanner';
import { sendTestNotification } from './telegram';
import { sendNtfyTest } from './ntfy';
import { sendAppriseTest } from './apprise';
import { fetchAmulProducts } from './amul';

function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      ...headers
    }
  });
}

function verifyAuth(request: Request, configuredPassword?: string): boolean {
  if (!configuredPassword) return true;
  const url = new URL(request.url);
  const passHeader = request.headers.get('x-admin-password');
  const passQuery = url.searchParams.get('password');
  const authHeader = request.headers.get('authorization');
  const bearerPass = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const candidate = passHeader || passQuery || bearerPass;
  return candidate === configuredPassword;
}

export default {
  /**
   * Handles HTTP requests (Admin Panel UI & REST API).
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'access-control-allow-headers': 'content-type, x-admin-password, authorization'
        }
      });
    }

    // Serve Admin UI
    if (path === '/' || path === '/admin' || path === '/index.html') {
      return new Response(getAdminHtml(), {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-cache'
        }
      });
    }

    // Health check endpoint (public)
    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'amul-stock-tracker',
        timestamp: Date.now()
      });
    }

    // Verify Admin Password for all /api/* routes
    if (path.startsWith('/api/')) {
      const config = await getConfig(env.AMUL_TRACKER_KV);
      const expectedPassword = config.adminPassword || env.DEFAULT_ADMIN_PASSWORD || 'admin';

      if (!verifyAuth(request, expectedPassword)) {
        return jsonResponse(
          { success: false, error: 'Unauthorized. Invalid admin password.' },
          401
        );
      }

      // GET /api/config
      if (path === '/api/config' && method === 'GET') {
        return jsonResponse(config);
      }

      // POST /api/config/telegram
      if (path === '/api/config/telegram' && method === 'POST') {
        const body = (await request.json()) as any;
        config.telegram = {
          botToken: body.botToken ?? config.telegram.botToken,
          chatId: body.chatId ?? config.telegram.chatId,
          notifyOnRestock: Boolean(body.notifyOnRestock ?? true),
          notifyOnOutOfStock: Boolean(body.notifyOnOutOfStock ?? false),
          cooldownHours: Number(body.cooldownHours) || 4
        };
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, telegram: config.telegram });
      }

      // POST /api/config/ntfy
      if (path === '/api/config/ntfy' && method === 'POST') {
        const body = (await request.json()) as any;
        config.ntfy = {
          serverUrl: (body.serverUrl ?? config.ntfy?.serverUrl ?? 'https://ntfy.sh').trim(),
          topic: (body.topic ?? config.ntfy?.topic ?? '').trim(),
          token: (body.token ?? config.ntfy?.token ?? '').trim(),
          enabled: Boolean(body.enabled ?? false),
          notifyOnRestock: Boolean(body.notifyOnRestock ?? true),
          notifyOnOutOfStock: Boolean(body.notifyOnOutOfStock ?? false)
        };
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, ntfy: config.ntfy });
      }

      // POST /api/config/apprise
      if (path === '/api/config/apprise' && method === 'POST') {
        const body = (await request.json()) as any;
        config.apprise = {
          serverUrl: (body.serverUrl ?? config.apprise?.serverUrl ?? '').trim(),
          urls: (body.urls ?? config.apprise?.urls ?? '').trim(),
          configKey: (body.configKey ?? config.apprise?.configKey ?? '').trim(),
          enabled: Boolean(body.enabled ?? false),
          notifyOnRestock: Boolean(body.notifyOnRestock ?? true),
          notifyOnOutOfStock: Boolean(body.notifyOnOutOfStock ?? false)
        };
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, apprise: config.apprise });
      }

      // POST /api/config/password
      if (path === '/api/config/password' && method === 'POST') {
        const body = (await request.json()) as any;
        const newPass = (body.password ?? '').trim();
        if (!newPass || newPass.length < 4) {
          return jsonResponse({ success: false, error: 'Password must be at least 4 characters long.' }, 400);
        }
        config.adminPassword = newPass;
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, message: 'Admin password updated successfully.' });
      }

      // POST /api/config/amul
      if (path === '/api/config/amul' && method === 'POST') {
        const body = (await request.json()) as any;
        config.amul = {
          substoreId: body.substoreId ?? config.amul.substoreId,
          category: body.category ?? config.amul.category,
          cookies: body.cookies ?? config.amul.cookies,
          limit: Number(body.limit) || 35
        };
        if (typeof body.isScanningActive === 'boolean') {
          config.isScanningActive = body.isScanningActive;
        }
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, amul: config.amul, isScanningActive: config.isScanningActive });
      }

      // GET /api/dashboard
      if (path === '/api/dashboard' && method === 'GET') {
        try {
          const amulRes = await fetchAmulProducts(config.amul);
          const logs = await getScanLogs(env.AMUL_TRACKER_KV);
          const lastScan = logs[0]?.timestamp || null;

          // Attach matched rule info
          const matchedProducts = [];
          for (const p of amulRes.products) {
            const rule = config.rules.find(r => matchesRule(p, r));
            if (rule) {
              matchedProducts.push({
                ...p,
                matchedRuleId: rule.id,
                matchedRuleName: rule.name
              });
            }
          }

          return jsonResponse({
            success: true,
            allProducts: amulRes.products,
            matchedProducts,
            totalFound: amulRes.totalFound,
            lastScanTimestamp: lastScan
          });
        } catch (err: any) {
          return jsonResponse({
            success: false,
            error: err.message,
            allProducts: [],
            matchedProducts: []
          });
        }
      }

      // POST /api/scan (Trigger manual scan)
      if (path === '/api/scan' && method === 'POST') {
        const scanResult = await runScan(env.AMUL_TRACKER_KV, 'manual', config);
        return jsonResponse(scanResult);
      }

      // POST /api/test-telegram
      if (path === '/api/test-telegram' && method === 'POST') {
        const body = (await request.json()) as any;
        const token = (body.botToken || config.telegram.botToken || '').trim();
        const chatId = (body.chatId || config.telegram.chatId || '').trim();

        if (!token || !chatId) {
          return jsonResponse(
            { success: false, error: 'Both Telegram Bot Token and Chat ID are required.' },
            400
          );
        }

        const testRes = await sendTestNotification(token, chatId);
        if (!testRes.success) {
          return jsonResponse({ success: false, error: testRes.error }, 400);
        }
        return jsonResponse({ success: true, message: 'Test message delivered to Telegram.' });
      }

      // POST /api/test-ntfy
      if (path === '/api/test-ntfy' && method === 'POST') {
        const body = (await request.json()) as any;
        const serverUrl = (body.serverUrl || config.ntfy?.serverUrl || 'https://ntfy.sh').trim();
        const topic = (body.topic || config.ntfy?.topic || '').trim();
        const token = (body.token || config.ntfy?.token || '').trim();

        if (!topic) {
          return jsonResponse({ success: false, error: 'ntfy topic is required.' }, 400);
        }

        const testRes = await sendNtfyTest(serverUrl, topic, token);
        if (!testRes.success) {
          return jsonResponse({ success: false, error: testRes.error }, 400);
        }
        return jsonResponse({ success: true, message: 'Test message published to ntfy topic.' });
      }

      // POST /api/test-apprise
      if (path === '/api/test-apprise' && method === 'POST') {
        const body = (await request.json()) as any;
        const serverUrl = (body.serverUrl || config.apprise?.serverUrl || '').trim();
        const urls = (body.urls || config.apprise?.urls || '').trim();
        const configKey = (body.configKey || config.apprise?.configKey || '').trim();

        if (!serverUrl) {
          return jsonResponse({ success: false, error: 'Apprise Server URL is required.' }, 400);
        }

        const testRes = await sendAppriseTest(serverUrl, urls, configKey);
        if (!testRes.success) {
          return jsonResponse({ success: false, error: testRes.error }, 400);
        }
        return jsonResponse({ success: true, message: 'Test notification dispatched to Apprise server successfully!' });
      }

      // POST /api/test-amul
      if (path === '/api/test-amul' && method === 'POST') {
        const body = (await request.json()) as any;
        const testAmulConfig = {
          substoreId: body.substoreId || config.amul.substoreId,
          category: body.category || config.amul.category,
          cookies: body.cookies !== undefined ? body.cookies : config.amul.cookies,
          limit: 35
        };

        try {
          const res = await fetchAmulProducts(testAmulConfig);
          return jsonResponse({
            success: true,
            totalFound: res.totalFound,
            category: testAmulConfig.category,
            productsCount: res.products.length
          });
        } catch (err: any) {
          return jsonResponse({ success: false, error: err.message }, 400);
        }
      }

      // GET /api/rules
      if (path === '/api/rules' && method === 'GET') {
        return jsonResponse(config.rules);
      }

      // POST /api/rules (Add new tracked rule)
      if (path === '/api/rules' && method === 'POST') {
        const body = (await request.json()) as any;
        const name = (body.name || '').trim();
        const keyword = (body.keyword || '').trim();

        if (!name || !keyword) {
          return jsonResponse({ success: false, error: 'Rule name and keyword are required.' }, 400);
        }

        const newRule: TrackedRule = {
          id: `rule-${Date.now()}`,
          name,
          keyword,
          enabled: true,
          createdAt: Date.now()
        };

        config.rules.push(newRule);
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, rules: config.rules, rule: newRule });
      }

      // POST /api/rules/:id/toggle
      const toggleMatch = path.match(/^\/api\/rules\/([^\/]+)\/toggle$/);
      if (toggleMatch && method === 'POST') {
        const ruleId = toggleMatch[1];
        const rule = config.rules.find(r => r.id === ruleId);
        if (!rule) {
          return jsonResponse({ success: false, error: 'Rule not found.' }, 404);
        }
        rule.enabled = !rule.enabled;
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, rules: config.rules });
      }

      // DELETE /api/rules/:id
      const deleteMatch = path.match(/^\/api\/rules\/([^\/]+)$/);
      if (deleteMatch && method === 'DELETE') {
        const ruleId = deleteMatch[1];
        config.rules = config.rules.filter(r => r.id !== ruleId);
        await saveConfig(env.AMUL_TRACKER_KV, config);
        return jsonResponse({ success: true, rules: config.rules });
      }

      // GET /api/logs
      if (path === '/api/logs' && method === 'GET') {
        const logs = await getScanLogs(env.AMUL_TRACKER_KV);
        return jsonResponse(logs);
      }
    }

    return new Response('Not Found', { status: 404 });
  },

  /**
   * Handles scheduled cron execution (Continuous background scanner).
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Cron triggered at ${new Date(event.scheduledTime).toISOString()}`);
    ctx.waitUntil(
      runScan(env.AMUL_TRACKER_KV, 'cron')
        .then(result => {
          console.log(`Cron scan completed: ${result.totalFound} products found, ${result.matchedCount} matched, ${result.alertsSent.length} alerts sent.`);
        })
        .catch(err => {
          console.error('Cron scan failed:', err);
        })
    );
  }
};
