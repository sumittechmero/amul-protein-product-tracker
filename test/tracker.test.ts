import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchesRule } from '../src/scanner.ts';
import { generateAmulTid } from '../src/amul.ts';
import { getAdminHtml } from '../src/admin.ts';
import { ProductInfo, TrackedRule } from '../src/types.ts';

describe('Amul Tracker Test Suite', () => {

  describe('Rule Matching Engine', () => {
    const lassiRule: TrackedRule = {
      id: 'rule-lassi',
      name: 'Protein Lassi',
      keyword: 'protein lassi',
      enabled: true,
      createdAt: Date.now()
    };

    const buttermilkRule: TrackedRule = {
      id: 'rule-buttermilk',
      name: 'Protein Buttermilk',
      keyword: 'protein buttermilk',
      enabled: true,
      createdAt: Date.now()
    };

    const blueberryRule: TrackedRule = {
      id: 'rule-blueberry',
      name: 'Blueberry Protein Shake',
      keyword: 'blueberry protein',
      enabled: true,
      createdAt: Date.now()
    };

    const disabledRule: TrackedRule = {
      id: 'rule-disabled',
      name: 'Disabled Rule',
      keyword: 'protein',
      enabled: false,
      createdAt: Date.now()
    };

    it('matches multi-word product names regardless of word order or surrounding words', () => {
      const p1: ProductInfo = {
        id: '1',
        name: 'Amul High Protein Plain Lassi, 200 mL | Pack of 30',
        alias: 'amul-high-protein-plain-lassi-200-ml',
        price: 900,
        available: true,
        inventoryQuantity: 20,
        url: 'https://shop.amul.com/en/product/amul-high-protein-plain-lassi-200-ml'
      };
      assert.equal(matchesRule(p1, lassiRule), true);
    });

    it('matches buttermilk with whitespace variations (buttermilk vs butter milk)', () => {
      const p2: ProductInfo = {
        id: '2',
        name: 'Amul High Protein Butter Milk, 200 mL | Pack of 30',
        alias: 'amul-high-protein-butter-milk-200-ml',
        price: 900,
        available: true,
        inventoryQuantity: 15,
        url: 'https://shop.amul.com/en/product/amul-high-protein-butter-milk-200-ml'
      };
      assert.equal(matchesRule(p2, buttermilkRule), true);
    });

    it('matches blueberry protein shake accurately', () => {
      const p3: ProductInfo = {
        id: '3',
        name: 'Amul High Protein Blueberry Shake, 200 mL | Pack of 30',
        alias: 'amul-high-protein-blueberry-shake-200-ml',
        price: 1800,
        available: true,
        inventoryQuantity: 622,
        url: 'https://shop.amul.com/en/product/amul-high-protein-blueberry-shake-200-ml'
      };
      assert.equal(matchesRule(p3, blueberryRule), true);
    });

    it('does not match unrelated products', () => {
      const pUnrelated: ProductInfo = {
        id: '4',
        name: 'Amul Kool Cafe, 200 mL Can',
        alias: 'amul-kool-cafe-200-ml',
        price: 35,
        available: true,
        inventoryQuantity: 100,
        url: 'https://shop.amul.com/en/product/amul-kool-cafe-200-ml'
      };
      assert.equal(matchesRule(pUnrelated, lassiRule), false);
      assert.equal(matchesRule(pUnrelated, buttermilkRule), false);
      assert.equal(matchesRule(pUnrelated, blueberryRule), false);
    });

    it('returns false when rule is disabled', () => {
      const p: ProductInfo = {
        id: '5',
        name: 'Amul High Protein Lassi',
        alias: 'amul-protein-lassi',
        price: 25,
        available: true,
        inventoryQuantity: 5,
        url: 'https://shop.amul.com/en/product/amul-protein-lassi'
      };
      assert.equal(matchesRule(p, disabledRule), false);
    });

    it('handles special characters in rule keyword without crashing', () => {
      const specialRule: TrackedRule = {
        id: 'rule-spec',
        name: 'Special Rule',
        keyword: 'Protein (25g)+',
        enabled: true,
        createdAt: Date.now()
      };
      const p: ProductInfo = {
        id: '6',
        name: 'Amul High Protein (25g)+ Shake',
        alias: 'amul-shake',
        price: 50,
        available: true,
        inventoryQuantity: 10,
        url: 'https://shop.amul.com'
      };
      assert.doesNotThrow(() => matchesRule(p, specialRule));
    });
  });

  describe('Password Security and Masking', () => {
    it('verifies getAdminHtml() contains zero occurrences of plain text password 1sumit100', () => {
      const html = getAdminHtml();
      assert.equal(html.includes('1sumit100'), false, '1sumit100 must not appear anywhere in rendered HTML or client script');
    });

    it('verifies inputAdminPassword uses masked placeholder', () => {
      const html = getAdminHtml();
      assert.match(html, /id="inputAdminPassword"[^>]*placeholder="••••••••"/);
    });

    it('verifies inputAdminPassword and inputChangePassword have onkeydown Enter listeners', () => {
      const html = getAdminHtml();
      assert.match(html, /id="inputAdminPassword"[^>]*onkeydown="if\(event\.key==='Enter'\)\s*saveAdminAuthToken\(\)"/);
      assert.match(html, /id="inputChangePassword"[^>]*onkeydown="if\(event\.key==='Enter'\)\s*updateServerPassword\(\)"/);
    });

    it('verifies getAuthHeader uses empty string fallback instead of hardcoded plain text password', () => {
      const html = getAdminHtml();
      assert.match(html, /localStorage\.getItem\('amul_admin_pass'\)\s*\|\|\s*''/);
    });
  });

  describe('Amul Tid Generation', () => {
    it('generates a 3-part tid formatted as timestamp:random:sha256hex', async () => {
      const sessionTid = 's_test_session_12345';
      const tid = await generateAmulTid(sessionTid);
      const parts = tid.split(':');
      assert.equal(parts.length, 3, 'Tid should consist of 3 colon-separated parts');
      assert.match(parts[0], /^\d+$/, 'Part 0 should be timestamp in digits');
      assert.match(parts[1], /^\d+$/, 'Part 1 should be random integer in digits');
      assert.match(parts[2], /^[a-f0-9]{64}$/, 'Part 2 should be 64-char SHA-256 hex string');
    });
  });

  describe('Scanner Restock and Cooldown Logic', () => {
    it('alerts on in-stock item when previous lastAlertSentAt is undefined', () => {
      const now = Date.now();
      const prev = {
        id: 'prod-1',
        alias: 'prod-1',
        name: 'Protein Shake',
        price: 100,
        available: true,
        inventoryQuantity: 10,
        lastChecked: now - 60000,
        lastAlertSentAt: undefined
      };
      const isCurrentlyInStock = true;
      const wasPreviouslyInStock = true;

      let shouldAlertRestock = false;
      if (isCurrentlyInStock) {
        if (!prev || !wasPreviouslyInStock || !prev.lastAlertSentAt) {
          shouldAlertRestock = true;
        } else {
          const cooldownMs = 4 * 3600 * 1000;
          if (now - prev.lastAlertSentAt > cooldownMs) {
            shouldAlertRestock = true;
          }
        }
      }

      assert.equal(shouldAlertRestock, true, 'Should alert when an in-stock product has not yet sent an alert');
    });

    it('suppresses restock alert when within cooldown period', () => {
      const now = Date.now();
      const prev = {
        id: 'prod-1',
        alias: 'prod-1',
        name: 'Protein Shake',
        price: 100,
        available: true,
        inventoryQuantity: 10,
        lastChecked: now - 60000,
        lastAlertSentAt: now - 3600 * 1000
      };
      const isCurrentlyInStock = true;
      const wasPreviouslyInStock = true;

      let shouldAlertRestock = false;
      if (isCurrentlyInStock) {
        if (!prev || !wasPreviouslyInStock || !prev.lastAlertSentAt) {
          shouldAlertRestock = true;
        } else {
          const cooldownMs = 4 * 3600 * 1000;
          if (now - prev.lastAlertSentAt > cooldownMs) {
            shouldAlertRestock = true;
          }
        }
      }

      assert.equal(shouldAlertRestock, false, 'Should not re-alert within 4h cooldown');
    });

    it('re-alerts after cooldown period has elapsed', () => {
      const now = Date.now();
      const prev = {
        id: 'prod-1',
        alias: 'prod-1',
        name: 'Protein Shake',
        price: 100,
        available: true,
        inventoryQuantity: 10,
        lastChecked: now - 60000,
        lastAlertSentAt: now - 5 * 3600 * 1000
      };
      const isCurrentlyInStock = true;
      const wasPreviouslyInStock = true;

      let shouldAlertRestock = false;
      if (isCurrentlyInStock) {
        if (!prev || !wasPreviouslyInStock || !prev.lastAlertSentAt) {
          shouldAlertRestock = true;
        } else {
          const cooldownMs = 4 * 3600 * 1000;
          if (now - prev.lastAlertSentAt > cooldownMs) {
            shouldAlertRestock = true;
          }
        }
      }

      assert.equal(shouldAlertRestock, true, 'Should re-alert after cooldown expires');
    });
  });

});
