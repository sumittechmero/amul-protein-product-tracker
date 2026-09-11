/**
 * Serves the responsive, modern Public Status Page Single Page Application (unauthenticated).
 */
export function getPublicHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amul Protein Stock Tracker — Live Availability & 30-Day History</title>
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
    [x-cloak] { display: none !important; }
    .glass {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .timeline-bar {
      display: flex;
      gap: 3px;
      height: 28px;
      align-items: stretch;
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
        <span id="headerStatusText" class="text-slate-300">Continuous 10m Monitor</span>
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
            Live stock monitor for Amul Protein Lassi, Buttermilk, Blueberry Shake, and Whey. Updates automatically every 10 minutes directly from official store inventories.
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
          <span class="text-[11px] uppercase font-semibold text-slate-400 block mb-1">30-Day Uptime</span>
          <span id="statUptime30d" class="text-xl sm:text-2xl font-bold text-sky-400 font-mono">--%</span>
          <span class="text-[10px] text-slate-500 block mt-0.5">1-month availability</span>
        </div>

        <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <span class="text-[11px] uppercase font-semibold text-slate-400 block mb-1">Check Frequency</span>
          <span class="text-xl sm:text-2xl font-bold text-teal-300 font-mono">10m</span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Global edge cron (10 min)</span>
        </div>
      </div>
    </div>

    <!-- PRODUCTS LIST WITH AVAILABILITY TIMELINE GRAPHS -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="font-bold text-lg text-white">Target Products Availability</h3>
          <p class="text-xs text-slate-400">Current inventory level and historical uptime availability timeline</p>
        </div>
        <div class="flex items-center gap-4 text-xs text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>In Stock</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
            <span>Partial Stock</span>
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
    <div id="timelineTooltip" class="fixed hidden z-50 pointer-events-none bg-slate-900/95 border border-slate-700 px-3 py-2 rounded-xl text-xs shadow-2xl text-slate-200 backdrop-blur-md"></div>

  </main>

  <!-- FOOTER -->
  <footer class="mt-auto border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>Amul High Protein Stock Tracker • Automated Cloudflare Edge Scanner (10m Cron)</p>
      <div class="flex items-center gap-4 text-slate-400">
        <a href="https://shop.amul.com/en/browse/protein" target="_blank" class="hover:text-emerald-400 transition">Shop Amul Protein ↗</a>
        <a href="/admin" class="hover:text-white transition flex items-center gap-1"><i class="fa-solid fa-lock text-[10px]"></i> Admin Login</a>
      </div>
    </div>
  </footer>

  <!-- CLIENT SCRIPT -->
  <script>
    var publicData = null;
    var refreshTimer = null;
    var activeTimelineMode = '30d';

    function setTimelineMode(mode) {
      activeTimelineMode = mode;
      if (publicData) renderPublicView(publicData);
    }

    async function loadPublicStatus() {
      var icon = document.getElementById('refreshIcon');
      if (icon) icon.classList.add('fa-spin');

      try {
        var res = await fetch('/api/public/status');
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

      document.getElementById('statTracked').innerText = data.totalTracked;
      document.getElementById('statInStock').innerText = data.totalInStock;

      var heroPulse = document.getElementById('heroPulse');
      var heroSummary = document.getElementById('heroStatusSummary');
      if (data.totalInStock > 0) {
        heroPulse.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        heroSummary.innerText = data.totalInStock + ' of ' + data.totalTracked + ' tracked items in stock right now!';
      } else {
        heroPulse.className = 'w-2 h-2 rounded-full bg-rose-400';
        heroSummary.innerText = 'All tracked items currently out of stock. Monitoring continuously...';
      }

      if (data.lastScanTimestamp) {
        var d = new Date(data.lastScanTimestamp);
        document.getElementById('heroLastCheck').innerText = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';
      } else {
        document.getElementById('heroLastCheck').innerText = 'Just now';
      }

      var uptimes30d = data.products.map(function(p) { return p.uptimePercentage30d || 0; });
      var avgUptime30d = uptimes30d.length > 0 ? (uptimes30d.reduce(function(a, b) { return a + b; }, 0) / uptimes30d.length).toFixed(1) : 100;
      document.getElementById('statUptime30d').innerText = avgUptime30d + '%';

      var container = document.getElementById('publicProductsContainer');
      if (data.products.length === 0) {
        container.innerHTML = '<div class="glass p-8 rounded-2xl text-center text-slate-400">No tracked products found.</div>';
        return;
      }

      var now = Date.now();
      var html = '';

      for (var i = 0; i < data.products.length; i++) {
        var p = data.products[i];
        var inStock = p.available && p.inventoryQuantity > 0;
        var timelineHtml = activeTimelineMode === '30d'
          ? generate30DayTimelineBars(p.history, now, inStock, p.inventoryQuantity)
          : generate24HourTimelineBars(p.history, now, inStock, p.inventoryQuantity);

        var axisLabels = activeTimelineMode === '30d'
          ? '<span>30 days ago</span><span>15 days ago</span><span>Today</span>'
          : '<span>24 hours ago</span><span>12 hours ago</span><span>Now (Latest)</span>';

        var modeTitle = activeTimelineMode === '30d' ? 'Past 30 Days (Daily Availability)' : 'Past 24 Hours (Detailed)';
        var borderClass = inStock ? 'border-emerald-500/40 shadow-xl shadow-emerald-950/20' : 'border-slate-800';
        var stockBadge = inStock
          ? '<span class="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● In Stock</span>'
          : '<span class="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">○ Out of Stock</span>';

        var buyBtn = inStock
          ? '<a href="' + p.url + '" target="_blank" class="flex items-center gap-2 font-semibold text-xs px-4 py-2.5 rounded-xl transition bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20"><span>Buy on Amul</span><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a>'
          : '<a href="' + p.url + '" target="_blank" class="flex items-center gap-2 font-semibold text-xs px-4 py-2.5 rounded-xl transition bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"><span>View on Store</span><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a>';

        var btn30dClass = activeTimelineMode === '30d' ? 'bg-emerald-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white';
        var btn24hClass = activeTimelineMode === '24h' ? 'bg-emerald-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white';

        html += '<div class="glass p-6 sm:p-7 rounded-3xl border ' + borderClass + ' transition hover:border-slate-700 space-y-5">' +
          '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">' +
            '<div>' +
              '<div class="flex items-center gap-2 mb-1.5">' +
                stockBadge +
                '<span class="text-xs text-slate-400 font-medium">' + (p.matchedRuleName || 'Protein') + '</span>' +
              '</div>' +
              '<h4 class="font-bold text-base sm:text-lg text-white leading-snug">' + p.name + '</h4>' +
            '</div>' +
            '<div class="flex items-center gap-3 self-start sm:self-auto">' +
              '<div class="text-right">' +
                '<span class="text-xs text-slate-400 block text-[11px]">Price</span>' +
                '<span class="text-lg font-bold text-white font-mono">₹' + p.price + '</span>' +
              '</div>' +
              buyBtn +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">' +
            '<div class="flex flex-wrap items-center gap-3">' +
              '<span>Units: <b class="font-mono ' + (inStock ? 'text-emerald-400' : 'text-slate-500') + '">' + p.inventoryQuantity + '</b></span>' +
              '<span>•</span>' +
              '<span>30d Uptime: <b class="font-mono text-emerald-400">' + (p.uptimePercentage30d || 0) + '%</b></span>' +
              '<span>•</span>' +
              '<span>7d: <b class="font-mono text-slate-300">' + (p.uptimePercentage7d || 0) + '%</b></span>' +
              '<span>•</span>' +
              '<span>24h: <b class="font-mono text-slate-300">' + (p.uptimePercentage24h || 0) + '%</b></span>' +
            '</div>' +
            '<div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">' +
              '<button type="button" onclick="setTimelineMode(\'30d\')" class="px-2.5 py-0.5 rounded-lg transition ' + btn30dClass + '">30 Days</button>' +
              '<button type="button" onclick="setTimelineMode(\'24h\')" class="px-2.5 py-0.5 rounded-lg transition ' + btn24hClass + '">24 Hours</button>' +
            '</div>' +
          '</div>' +
          '<div class="space-y-1.5">' +
            '<div class="flex items-center justify-between text-[11px] text-slate-400">' +
              '<span>' + modeTitle + '</span>' +
              '<span class="font-mono text-[10px] text-slate-500">' + (activeTimelineMode === '30d' ? '30 daily blocks' : '48 segments (30m each)') + '</span>' +
            '</div>' +
            '<div class="timeline-bar">' +
              timelineHtml +
            '</div>' +
            '<div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">' +
              axisLabels +
            '</div>' +
          '</div>' +
        '</div>';
      }

      container.innerHTML = html;
    }

    function generate30DayTimelineBars(history, now, currentInStock, currentQty) {
      var daysCount = 30;
      var dayMs = 24 * 3600 * 1000;
      var windowStart = now - (daysCount * dayMs);
      var segmentsHtml = '';

      for (var i = 0; i < daysCount; i++) {
        var segStart = windowStart + (i * dayMs);
        var segEnd = Math.min(segStart + dayMs, now);
        var duration = segEnd - segStart;

        var inStockMs = 0;
        var peakQty = 0;

        if (!history || history.length === 0) {
          if (i === daysCount - 1 && currentInStock) {
            inStockMs = duration;
            peakQty = currentQty;
          }
        } else {
          for (var j = 0; j < history.length; j++) {
            var iv = history[j];
            var ivStart = Math.max(iv.from, segStart);
            var ivEnd = Math.min(iv.to || now, segEnd);
            if (ivEnd > ivStart) {
              if (iv.available) {
                inStockMs += (ivEnd - ivStart);
                if (iv.quantity > peakQty) peakQty = iv.quantity;
              }
            }
          }
        }

        var uptimePct = duration > 0 ? Math.round((inStockMs / duration) * 100) : 0;
        var dateObj = new Date(segStart);
        var dateStr = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

        var colorClass = 'bg-slate-800/90 hover:bg-slate-700';
        var statusDesc = 'Out of Stock (0%)';

        if (uptimePct >= 90) {
          colorClass = 'bg-emerald-500';
          statusDesc = 'In Stock (100% of day' + (peakQty ? ', ' + peakQty + ' units' : '') + ')';
        } else if (uptimePct > 0) {
          colorClass = 'bg-amber-400';
          var hours = Math.round((inStockMs / (3600 * 1000)) * 10) / 10;
          statusDesc = 'Partial Stock (' + hours + 'h available, ' + uptimePct + '%' + (peakQty ? ', ' + peakQty + ' units' : '') + ')';
        }

        var isToday = (i === daysCount - 1);
        var tooltipText = dateStr + (isToday ? ' (Today)' : '') + ' — ' + statusDesc;

        segmentsHtml += '<div class="timeline-segment ' + colorClass + '" ' +
          'onmouseenter="showTooltip(event, \'' + tooltipText.replace(/'/g, "\\'") + '\')" ' +
          'onmouseleave="hideTooltip()">' +
        '</div>';
      }

      return segmentsHtml;
    }

    function generate24HourTimelineBars(history, now, currentInStock, currentQty) {
      var segmentsCount = 48;
      var stepMs = (24 * 3600 * 1000) / segmentsCount;
      var windowStart = now - (24 * 3600 * 1000);
      var segmentsHtml = '';

      for (var i = 0; i < segmentsCount; i++) {
        var segStart = windowStart + (i * stepMs);
        var segEnd = segStart + stepMs;

        var wasInStock = false;
        var lastQty = 0;

        if (!history || history.length === 0) {
          wasInStock = (i === segmentsCount - 1) ? currentInStock : false;
          lastQty = currentQty || 0;
        } else {
          for (var j = 0; j < history.length; j++) {
            var iv = history[j];
            var ivStart = iv.from;
            var ivEnd = iv.to || now;
            if (ivStart < segEnd && ivEnd > segStart) {
              if (iv.available) {
                wasInStock = true;
                lastQty = iv.quantity;
                break;
              }
            }
          }
        }

        var dateObj = new Date(segStart);
        var timeLabel = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        var tooltipText = timeLabel + ' — ' + (wasInStock ? 'In Stock (' + lastQty + ' units)' : 'Out of Stock');
        var colorClass = wasInStock ? 'bg-emerald-500' : 'bg-slate-800/90 hover:bg-slate-700';

        segmentsHtml += '<div class="timeline-segment ' + colorClass + '" ' +
          'onmouseenter="showTooltip(event, \'' + tooltipText.replace(/'/g, "\\'") + '\')" ' +
          'onmouseleave="hideTooltip()">' +
        '</div>';
      }

      return segmentsHtml;
    }

    function showTooltip(e, text) {
      var tooltip = document.getElementById('timelineTooltip');
      if (!tooltip) return;
      tooltip.innerText = text;
      tooltip.classList.remove('hidden');
      var rect = e.target.getBoundingClientRect();
      tooltip.style.left = (rect.left + window.scrollX - 40) + 'px';
      tooltip.style.top = (rect.top + window.scrollY - 36) + 'px';
    }

    function hideTooltip() {
      var tooltip = document.getElementById('timelineTooltip');
      if (tooltip) tooltip.classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', function() {
      loadPublicStatus();
      if (refreshTimer) clearInterval(refreshTimer);
      refreshTimer = setInterval(loadPublicStatus, 120000);
    });
  </script>
</body>
</html>
`;
}
