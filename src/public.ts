/**
 * Serves the responsive, modern Public Status Page for Amul Protein Products.
 * No authentication required.
 */
export function getPublicHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amul Protein Stock — Live Availability & Status</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f0fdf4',
              500: '#22c55e',
              600: '#16a34a',
              700: '#15803d',
            }
          }
        }
      }
    }
  </script>
  <style>
    .glass {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .timeline-bar {
      display: flex;
      gap: 2px;
      height: 24px;
      width: 100%;
      border-radius: 6px;
      overflow: hidden;
      background: rgba(15, 23, 42, 0.8);
      padding: 2px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .timeline-segment {
      flex: 1;
      border-radius: 3px;
      transition: transform 0.15s ease, opacity 0.15s ease;
      cursor: pointer;
    }
    .timeline-segment:hover {
      transform: scaleY(1.25);
      z-index: 10;
    }
  </style>
</head>
<body class="min-h-full flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white bg-slate-950 text-slate-100">

  <!-- TOP HEADER -->
  <header class="glass sticky top-0 z-50 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <i class="fa-solid fa-bottle-droplet text-white text-lg"></i>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-bold text-lg text-white leading-tight">Amul Protein Tracker</h1>
          <span class="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">Live Status</span>
        </div>
        <p class="text-xs text-slate-400">Real-Time Stock Availability & Restock Monitor</p>
      </div>
    </div>

    <!-- Right Header Actions -->
    <div class="flex items-center gap-3">
      <!-- Live Pulse Indicator -->
      <div class="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span id="headerStatusText" class="text-slate-300">Continuous 1m Monitor</span>
      </div>

      <!-- Refresh button -->
      <button type="button" onclick="loadPublicStatus()" id="btnRefresh" title="Refresh live stock" class="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition active:scale-95">
        <i id="refreshIcon" class="fa-solid fa-rotate text-sm"></i>
      </button>

      <!-- Admin Portal Link -->
      <a href="/admin" class="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg transition">
        <i class="fa-solid fa-lock text-slate-400 text-xs"></i>
        <span>Admin Portal</span>
      </a>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">

    <!-- HERO OVERVIEW BANNER -->
    <div class="glass p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
      <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 mb-3">
            <span id="heroPulse" class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span id="heroStatusSummary">Checking inventory across Amul stores...</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Amul Protein Products Status</h2>
          <p class="text-sm text-slate-400 mt-1 max-w-xl">
            Live stock monitor for Amul Protein Lassi, Buttermilk, Blueberry Shake, and Whey. Updates automatically every 60 seconds directly from official store inventories.
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs font-medium self-start md:self-auto">
          <div class="text-right">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider">Last Checked</span>
            <span id="heroLastCheck" class="text-slate-200 font-mono font-semibold">Updating...</span>
          </div>
        </div>
      </div>

      <!-- METRIC CARDS ROW -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
        <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <span class="text-[11px] uppercase font-semibold text-slate-400 block mb-1">Tracked Items</span>
          <span id="statTracked" class="text-xl sm:text-2xl font-bold text-white font-mono">--</span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Active monitoring</span>
        </div>

        <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <span class="text-[11px] uppercase font-semibold text-slate-400 block mb-1">In Stock Now</span>
          <span id="statInStock" class="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">--</span>
          <span class="text-[10px] text-emerald-500/80 block mt-0.5">Ready to order</span>
        </div>

        <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <span class="text-[11px] uppercase font-semibold text-slate-400 block mb-1">24h Uptime</span>
          <span id="statUptime24h" class="text-xl sm:text-2xl font-bold text-sky-400 font-mono">--%</span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Average availability</span>
        </div>

        <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <span class="text-[11px] uppercase font-semibold text-slate-400 block mb-1">Check Frequency</span>
          <span class="text-xl sm:text-2xl font-bold text-teal-300 font-mono">60s</span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Global edge cron</span>
        </div>
      </div>
    </div>

    <!-- PRODUCTS LIST WITH AVAILABILITY TIMELINE GRAPHS -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg text-white">Target Products Availability</h3>
          <p class="text-xs text-slate-400">Current inventory level and 24-hour uptime availability timeline</p>
        </div>
        <div class="flex items-center gap-4 text-xs text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>In Stock</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700"></span>
            <span>Out of Stock</span>
          </div>
        </div>
      </div>

      <!-- Dynamic Product Cards Grid -->
      <div id="publicProductsContainer" class="space-y-4">
        <div class="glass p-12 rounded-3xl border border-slate-800 text-center text-slate-400">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-emerald-400 mb-3"></i>
          <p class="text-sm">Fetching live Amul store availability and history...</p>
        </div>
      </div>
    </div>

    <!-- TIMELINE TOOLTIP POPUP -->
    <div id="timelineTooltip" class="fixed hidden z-50 pointer-events-none bg-slate-900/95 border border-slate-700 px-3 py-2 rounded-xl text-xs shadow-xl text-slate-200 backdrop-blur-md"></div>

  </main>

  <!-- FOOTER -->
  <footer class="mt-auto border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>Amul High Protein Stock Tracker • Automated Cloudflare Edge Scanner</p>
      <div class="flex items-center gap-4 text-slate-400">
        <a href="https://shop.amul.com/en/browse/protein" target="_blank" class="hover:text-emerald-400 transition">Shop Amul Protein ↗</a>
        <a href="/admin" class="hover:text-white transition flex items-center gap-1"><i class="fa-solid fa-lock text-[10px]"></i> Admin Login</a>
      </div>
    </div>
  </footer>

  <!-- CLIENT SCRIPT -->
  <script>
    let publicData = null;
    let refreshTimer = null;

    async function loadPublicStatus() {
      const icon = document.getElementById('refreshIcon');
      if (icon) icon.classList.add('fa-spin');

      try {
        const res = await fetch('/api/public/status');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        publicData = await res.json();
        renderPublicView(publicData);
      } catch (err) {
        console.error('Failed to load public status:', err);
      } finally {
        if (icon) icon.classList.remove('fa-spin');
      }
    }

    function renderPublicView(data) {
      if (!data || !data.products) return;

      // Stats
      document.getElementById('statTracked').innerText = data.totalTracked;
      document.getElementById('statInStock').innerText = data.totalInStock;

      // Hero status
      const heroPulse = document.getElementById('heroPulse');
      const heroSummary = document.getElementById('heroStatusSummary');
      if (data.totalInStock > 0) {
        heroPulse.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        heroSummary.innerText = data.totalInStock + ' of ' + data.totalTracked + ' tracked items in stock right now!';
      } else {
        heroPulse.className = 'w-2 h-2 rounded-full bg-rose-400';
        heroSummary.innerText = 'All tracked items currently out of stock. Monitoring continuously...';
      }

      // Last scan timestamp
      if (data.lastScanTimestamp) {
        const d = new Date(data.lastScanTimestamp);
        document.getElementById('heroLastCheck').innerText = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';
      } else {
        document.getElementById('heroLastCheck').innerText = 'Just now';
      }

      // Average 24h uptime
      const uptimes = data.products.map(p => p.uptimePercentage24h || 0);
      const avgUptime = uptimes.length > 0 ? (uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(1) : 100;
      document.getElementById('statUptime24h').innerText = avgUptime + '%';

      // Render product cards
      const container = document.getElementById('publicProductsContainer');
      if (data.products.length === 0) {
        container.innerHTML = '<div class="glass p-8 rounded-2xl text-center text-slate-400">No tracked products found.</div>';
        return;
      }

      const now = Date.now();
      container.innerHTML = data.products.map(p => {
        const inStock = p.available && p.inventoryQuantity > 0;
        const timelineHtml = generateTimelineBars(p.history, now, inStock, p.inventoryQuantity);

        return \`
          <div class="glass p-6 sm:p-7 rounded-3xl border \\\${inStock ? 'border-emerald-500/40 shadow-xl shadow-emerald-950/20' : 'border-slate-800'} transition hover:border-slate-700 space-y-5">
            <!-- Card Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full \\\${inStock ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                    \\\${inStock ? '● In Stock' : '○ Out of Stock'}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">\\\${p.matchedRuleName || 'Protein'}</span>
                </div>
                <h4 class="font-bold text-base sm:text-lg text-white leading-snug">\\\${p.name}</h4>
              </div>

              <div class="flex items-center gap-3 self-start sm:self-auto">
                <div class="text-right">
                  <span class="text-xs text-slate-400 block text-[11px]">Price</span>
                  <span class="text-lg font-bold text-white font-mono">₹\\\${p.price}</span>
                </div>
                <a href="\\\${p.url}" target="_blank" class="flex items-center gap-2 font-semibold text-xs px-4 py-2.5 rounded-xl transition \\\${inStock ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'}">
                  <span>\\\${inStock ? 'Buy on Amul' : 'View on Store'}</span>
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>
            </div>

            <!-- Units & Status Info -->
            <div class="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
              <div class="flex items-center gap-4">
                <span>Available Units: <b class="font-mono \\\${inStock ? 'text-emerald-400' : 'text-slate-500'}">\\\${p.inventoryQuantity}</b></span>
                <span>•</span>
                <span>24h Availability: <b class="font-mono text-slate-200">\\\${p.uptimePercentage24h}%</b></span>
                <span>•</span>
                <span>7d Uptime: <b class="font-mono text-slate-200">\\\${p.uptimePercentage7d}%</b></span>
              </div>
              <span class="text-[11px] text-slate-500 mt-1 sm:mt-0">Past 24 Hours Availability Timeline</span>
            </div>

            <!-- Availability Timeline Bar Graph -->
            <div class="space-y-1.5">
              <div class="timeline-bar">
                \\\${timelineHtml}
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>24 hours ago</span>
                <span>12 hours ago</span>
                <span>Now (Latest)</span>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Generate 48 discrete 30-minute segment bars for the last 24h
    function generateTimelineBars(history, now, currentInStock, currentQty) {
      const segmentsCount = 48; // 30-min resolution across 24h
      const stepMs = (24 * 3600 * 1000) / segmentsCount;
      const windowStart = now - (24 * 3600 * 1000);

      const segments = [];

      for (let i = 0; i < segmentsCount; i++) {
        const segStart = windowStart + (i * stepMs);
        const segEnd = segStart + stepMs;

        // Check availability during this segment
        let wasInStock = false;
        let lastQty = 0;

        if (!history || history.length === 0) {
          wasInStock = (i === segmentsCount - 1) ? currentInStock : false;
          lastQty = currentQty || 0;
        } else {
          for (const iv of history) {
            const ivStart = iv.from;
            const ivEnd = iv.to || now;
            // Overlap check
            if (ivStart < segEnd && ivEnd > segStart) {
              if (iv.available) {
                wasInStock = true;
                lastQty = iv.quantity;
                break;
              }
            }
          }
        }

        const dateObj = new Date(segStart);
        const timeLabel = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const tooltipText = timeLabel + ' — ' + (wasInStock ? 'In Stock (' + lastQty + ' units)' : 'Out of Stock');
        const colorClass = wasInStock ? 'bg-emerald-500' : 'bg-slate-800/90 hover:bg-slate-700';

        segments.push(\`
          <div class="timeline-segment \\\${colorClass}"
               onmouseenter="showTooltip(event, '\\\${tooltipText}')"
               onmouseleave="hideTooltip()">
          </div>
        \`);
      }

      return segments.join('');
    }

    // Tooltip helper
    function showTooltip(e, text) {
      const tooltip = document.getElementById('timelineTooltip');
      if (!tooltip) return;
      tooltip.innerText = text;
      tooltip.classList.remove('hidden');
      const rect = e.target.getBoundingClientRect();
      tooltip.style.left = (rect.left + window.scrollX - 40) + 'px';
      tooltip.style.top = (rect.top + window.scrollY - 36) + 'px';
    }

    function hideTooltip() {
      const tooltip = document.getElementById('timelineTooltip');
      if (tooltip) tooltip.classList.add('hidden');
    }

    // Startup & Auto-refresh every 60s
    document.addEventListener('DOMContentLoaded', () => {
      loadPublicStatus();
      if (refreshTimer) clearInterval(refreshTimer);
      refreshTimer = setInterval(loadPublicStatus, 60000);
    });
  </script>
</body>
</html>
`;
}
