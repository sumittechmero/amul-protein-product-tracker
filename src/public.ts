/**
 * Serves the modern, high-contrast Public Status Page Single Page Application.
 * Designed with Swiss Typographic Style (International Typographic Style),
 * structured geometric grid layout, high-visibility signal accents,
 * zero admin references, mobile-first responsiveness, live search & filtering,
 * 30-day uptime timeline bars, and product image lightbox.
 */
export function getPublicHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-[#0a0b0e] text-[#f4f4f5]">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amul Protein Stock Radar — Real-Time Availability & 30-Day Uptime</title>
  
  <!-- Swiss & Monospace Typography: Plus Jakarta Sans & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'Menlo', 'monospace']
          },
          colors: {
            swiss: {
              vermilion: '#ff3c00',
              accent: '#ff5018',
              surface: '#12141a',
              card: '#161922',
              border: '#232734',
              muted: '#717686',
              light: '#f4f4f6'
            }
          }
        }
      }
    }
  </script>

  <style>
    [x-cloak] { display: none !important; }
    
    /* Architectural background grid lines */
    body {
      background-color: #0b0c10;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 36px 36px;
    }

    /* Swiss modular card design */
    .swiss-card {
      background: #111319;
      border: 1px solid #232733;
      transition: border-color 0.15s ease, transform 0.15s ease;
    }
    .swiss-card:hover {
      border-color: #383e52;
    }

    /* Timeline Bar styles */
    .timeline-bar {
      display: flex;
      gap: 3px;
      height: 24px;
      align-items: stretch;
    }
    .timeline-segment {
      flex: 1;
      border-radius: 2px;
      transition: transform 0.15s ease, opacity 0.15s ease;
      cursor: pointer;
    }
    .timeline-segment:hover {
      transform: scaleY(1.35);
      z-index: 20;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0b0c10;
    }
    ::-webkit-scrollbar-thumb {
      background: #232733;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #383e52;
    }
  </style>
</head>
<body class="min-h-full flex flex-col font-sans antialiased text-[#f4f4f5] selection:bg-[#ff3c00] selection:text-white">

  <!-- TOP APP BAR -->
  <header class="sticky top-0 z-40 border-b border-[#232733] bg-[#0b0c10]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3.5">
      <!-- Minimalist Swiss Emblem -->
      <div class="w-9 h-9 bg-[#ff3c00] text-white flex items-center justify-center font-black text-sm tracking-tighter rounded-md shrink-0 shadow-sm shadow-[#ff3c00]/30">
        AM
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-base sm:text-lg text-white tracking-tight uppercase">Amul // Protein Radar</span>
          <span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
          </span>
        </div>
        <p class="text-[11px] font-mono text-[#717686] tracking-wider uppercase hidden sm:block">Automated 10m Continuous Warehouse Inventory Tracker</p>
      </div>
    </div>

    <!-- Header Actions (NO ADMIN MENTION) -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Last Sync Timestamp Pill -->
      <div class="hidden md:flex items-center gap-2 bg-[#12141a] border border-[#232733] px-3 py-1.5 rounded-md text-xs font-mono text-[#717686]">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span id="navLastCheck">SYNCING...</span>
      </div>

      <!-- Live Refresh Button -->
      <button type="button" onclick="loadPublicStatus()" id="btnRefresh" title="Refresh Live Data" class="inline-flex items-center gap-2 bg-[#12141a] hover:bg-[#1b1e27] text-white border border-[#232733] hover:border-[#383e52] px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition active:scale-95">
        <i id="refreshIcon" class="fa-solid fa-rotate text-xs text-[#ff3c00]"></i>
        <span class="hidden sm:inline">REFRESH</span>
      </button>

      <!-- Amul Official Shop Link -->
      <a href="https://shop.amul.com/en/browse/protein" target="_blank" class="inline-flex items-center gap-1.5 bg-[#ff3c00] hover:bg-[#e03500] text-white px-3.5 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase transition shadow-sm">
        <span>STORE</span>
        <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
      </a>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8">

    <!-- HERO SECTION (Swiss Typographic Masthead) -->
    <div class="swiss-card p-6 sm:p-8 rounded-xl border border-[#232733] relative overflow-hidden">
      <!-- Corner indexing tag -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#232733] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#717686]">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-[#1b1e27] border border-[#2a2f3f] text-[#a1a7b8] rounded">REG // GUJARAT</span>
          <span class="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE TELEMETRY
          </span>
        </div>
        <div id="heroLastCheck" class="text-white font-bold">UPDATING...</div>
      </div>

      <!-- Large Bold Title -->
      <div class="mt-6 space-y-3">
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
          Amul High Protein<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3c00] via-[#ff7300] to-[#00e676]">Inventory Radar</span>
        </h1>
        <p class="text-sm sm:text-base text-[#a1a7b8] max-w-2xl font-normal leading-relaxed">
          Automated edge tracking for Amul High Protein Lassi, Buttermilk, Blueberry Shake, and Whey. Directly synchronized with official warehouse stock every 10 minutes with complete 30-day uptime records.
        </p>
      </div>

      <!-- 4-MODULAR METRICS STRIP (Swiss Grid) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#232733]">
        <!-- In Stock Products -->
        <div class="bg-[#0e1015] p-4 rounded-lg border border-[#232733]">
          <span class="text-[10px] font-mono uppercase font-bold tracking-widest text-[#717686] block">01 // IN STOCK</span>
          <div class="flex items-baseline gap-1.5 mt-1">
            <span id="statInStock" class="text-2xl sm:text-3xl font-black font-mono text-[#00e676]">--</span>
            <span id="statInStockTotal" class="text-xs font-mono text-[#717686]">/ --</span>
          </div>
          <p class="text-[11px] font-mono text-[#717686] mt-1">Ready for purchase</p>
        </div>

        <!-- Total Units in Warehouse -->
        <div class="bg-[#0e1015] p-4 rounded-lg border border-[#232733]">
          <span class="text-[10px] font-mono uppercase font-bold tracking-widest text-[#717686] block">02 // TOTAL UNITS</span>
          <div id="statTotalUnits" class="text-2xl sm:text-3xl font-black font-mono text-white mt-1">--</div>
          <p class="text-[11px] font-mono text-[#717686] mt-1">Warehouse stock units</p>
        </div>

        <!-- 30-Day Avg Uptime -->
        <div class="bg-[#0e1015] p-4 rounded-lg border border-[#232733]">
          <span class="text-[10px] font-mono uppercase font-bold tracking-widest text-[#717686] block">03 // 30D UPTIME</span>
          <div id="statUptime30d" class="text-2xl sm:text-3xl font-black font-mono text-[#38bdf8] mt-1">--%</div>
          <p class="text-[11px] font-mono text-[#717686] mt-1">1-month availability</p>
        </div>

        <!-- Cycle Frequency -->
        <div class="bg-[#0e1015] p-4 rounded-lg border border-[#232733]">
          <span class="text-[10px] font-mono uppercase font-bold tracking-widest text-[#717686] block">04 // SCAN CYCLE</span>
          <div class="text-2xl sm:text-3xl font-black font-mono text-white mt-1">10 MIN</div>
          <p class="text-[11px] font-mono text-[#717686] mt-1">Cloudflare Edge Cron</p>
        </div>
      </div>
    </div>

    <!-- SWISS CONTROL STRIP: SEARCH & FILTERS -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111319] p-3 rounded-xl border border-[#232733]">
      <!-- Search Input -->
      <div class="relative flex-1">
        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-[#717686] text-xs pointer-events-none"></i>
        <input type="text" id="searchInput" oninput="handleSearch(event)" placeholder="Search products, flavors, packs (e.g. lassi, buttermilk, blueberry)..." class="w-full bg-[#0b0c10] border border-[#232733] rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-[#717686] focus:outline-none focus:border-[#ff3c00] transition font-sans">
        <button type="button" id="btnClearSearch" onclick="clearSearch()" class="hidden absolute right-3 top-2.5 text-[#717686] hover:text-white text-xs">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Status Filter Buttons -->
      <div class="flex items-center gap-1 bg-[#0b0c10] p-1 rounded-lg border border-[#232733] text-xs font-mono font-bold">
        <button type="button" onclick="setStatusFilter('all')" id="filterBtn-all" class="filter-tab-btn active px-3 py-1.5 rounded bg-[#232733] text-white transition">
          ALL (<span id="countFilterAll">0</span>)
        </button>
        <button type="button" onclick="setStatusFilter('in_stock')" id="filterBtn-in_stock" class="filter-tab-btn px-3 py-1.5 rounded text-[#717686] hover:text-white transition">
          IN STOCK (<span id="countFilterInStock">0</span>)
        </button>
        <button type="button" onclick="setStatusFilter('out_of_stock')" id="filterBtn-out_of_stock" class="filter-tab-btn px-3 py-1.5 rounded text-[#717686] hover:text-white transition">
          OUT OF STOCK (<span id="countFilterOOS">0</span>)
        </button>
      </div>

      <!-- Timeline Duration Switcher -->
      <div class="flex items-center gap-1 bg-[#0b0c10] p-1 rounded-lg border border-[#232733] text-xs font-mono font-bold">
        <button type="button" onclick="setTimelineMode('30d')" id="timelineBtn-30d" class="timeline-tab-btn px-3 py-1.5 rounded bg-[#ff3c00] text-white transition">
          30 DAYS
        </button>
        <button type="button" onclick="setTimelineMode('24h')" id="timelineBtn-24h" class="timeline-tab-btn px-3 py-1.5 rounded text-[#717686] hover:text-white transition">
          24 HOURS
        </button>
      </div>
    </div>

    <!-- PRODUCTS AVAILABILITY LIST SECTION -->
    <div class="space-y-4">
      <!-- Section Header -->
      <div class="flex items-center justify-between text-xs font-mono text-[#717686] px-1 uppercase">
        <div class="flex items-center gap-2">
          <span class="font-bold text-white tracking-wider">TRACKED CATALOG ITEMS</span>
          <span id="resultsCountBadge" class="bg-[#1b1e27] border border-[#232733] text-[#a1a7b8] text-[10px] px-2 py-0.5 rounded">0 ITEMS</span>
        </div>
        <!-- Legend Indicator -->
        <div class="hidden sm:flex items-center gap-4 text-[11px]">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-[#00e676]"></span>
            <span>100% In Stock</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-[#ffb703]"></span>
            <span>Partial Stock</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-[#1e222d] border border-[#2f3545]"></span>
            <span>Out of Stock</span>
          </div>
        </div>
      </div>

      <!-- Dynamic Product Cards Container -->
      <div id="publicProductsContainer" class="space-y-4">
        <div class="swiss-card p-12 rounded-xl border border-[#232733] text-center text-[#717686] space-y-3">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-[#ff3c00]"></i>
          <p class="text-xs font-mono uppercase tracking-widest">Connecting to Amul Store API...</p>
        </div>
      </div>
    </div>

    <!-- TIMELINE TOOLTIP POPUP -->
    <div id="timelineTooltip" class="fixed hidden z-50 pointer-events-none bg-[#111319] border border-[#383e52] px-3 py-2 rounded text-xs shadow-2xl text-white font-mono leading-tight"></div>

    <!-- IMAGE LIGHTBOX MODAL -->
    <div id="lightboxModal" class="hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onclick="closeLightbox()">
      <div class="relative max-w-lg w-full bg-[#111319] border border-[#383e52] p-5 rounded-xl text-center space-y-4 shadow-2xl" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between px-1 border-b border-[#232733] pb-3">
          <h4 id="lightboxTitle" class="text-sm font-bold text-white truncate max-w-[85%] text-left font-sans"></h4>
          <button onclick="closeLightbox()" class="text-[#717686] hover:text-white p-1 rounded hover:bg-[#1b1e27] transition"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>
        <div class="bg-[#0b0c10] rounded-lg p-6 flex items-center justify-center max-h-[65vh] border border-[#232733]">
          <img id="lightboxImg" src="" alt="Product" class="max-h-[55vh] max-w-full object-contain rounded drop-shadow-xl" />
        </div>
        <p class="text-[10px] font-mono uppercase tracking-wider text-[#717686]">Press Escape or click outside to dismiss</p>
      </div>
    </div>

  </main>

  <!-- FOOTER (NO ADMIN MENTION) -->
  <footer class="mt-auto border-t border-[#232733] py-8 text-center text-xs text-[#717686] bg-[#0b0c10]">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#00e676]"></span>
        <p class="uppercase tracking-wider text-[11px]">Amul High Protein Stock Radar // 10-Minute Cloud Edge</p>
      </div>
      <div class="flex items-center gap-4 text-white font-semibold">
        <a href="https://shop.amul.com/en/browse/protein" target="_blank" class="hover:text-[#ff3c00] transition flex items-center gap-1.5 uppercase text-[11px]">
          <span>Shop Official Amul Store</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>
    </div>
  </footer>

  <!-- CLIENT SCRIPT -->
  <script>
    var rawProducts = [];
    var publicData = null;
    var refreshTimer = null;
    var activeTimelineMode = '30d';
    var activeStatusFilter = 'all';
    var searchQuery = '';

    function setTimelineMode(mode) {
      activeTimelineMode = mode;
      var btn30 = document.getElementById('timelineBtn-30d');
      var btn24 = document.getElementById('timelineBtn-24h');
      if (mode === '30d') {
        btn30.className = 'timeline-tab-btn px-3 py-1.5 rounded bg-[#ff3c00] text-white transition';
        btn24.className = 'timeline-tab-btn px-3 py-1.5 rounded text-[#717686] hover:text-white transition';
      } else {
        btn24.className = 'timeline-tab-btn px-3 py-1.5 rounded bg-[#ff3c00] text-white transition';
        btn30.className = 'timeline-tab-btn px-3 py-1.5 rounded text-[#717686] hover:text-white transition';
      }
      renderFilteredProducts();
    }

    function setStatusFilter(filter) {
      activeStatusFilter = filter;
      document.querySelectorAll('.filter-tab-btn').forEach(function(btn) {
        btn.className = 'filter-tab-btn px-3 py-1.5 rounded text-[#717686] hover:text-white transition';
      });
      var activeBtn = document.getElementById('filterBtn-' + filter);
      if (activeBtn) {
        activeBtn.className = 'filter-tab-btn active px-3 py-1.5 rounded bg-[#232733] text-white transition';
      }
      renderFilteredProducts();
    }

    function handleSearch(e) {
      searchQuery = (e.target.value || '').trim().toLowerCase();
      var clearBtn = document.getElementById('btnClearSearch');
      if (searchQuery) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
      renderFilteredProducts();
    }

    function clearSearch() {
      var input = document.getElementById('searchInput');
      if (input) input.value = '';
      searchQuery = '';
      document.getElementById('btnClearSearch').classList.add('hidden');
      renderFilteredProducts();
    }

    function resetFilter() {
      clearSearch();
      setStatusFilter('all');
    }

    async function loadPublicStatus() {
      var icon = document.getElementById('refreshIcon');
      if (icon) icon.classList.add('fa-spin');

      try {
        var res = await fetch('/api/public/status?t=' + Date.now());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        publicData = await res.json();
        rawProducts = publicData.products || [];
        updateHeroAndMetrics(publicData);
        renderFilteredProducts();
      } catch (err) {
        console.error('Failed to load public status:', err);
      } finally {
        if (icon) icon.classList.remove('fa-spin');
      }
    }

    function updateHeroAndMetrics(data) {
      if (!data || !data.products) return;

      var totalTracked = data.products.length;
      var inStockCount = data.products.filter(function(p) { return p.available && p.inventoryQuantity > 0; }).length;
      var oosCount = totalTracked - inStockCount;

      var totalUnits = data.products.reduce(function(acc, p) {
        return acc + (p.available ? (p.inventoryQuantity || 0) : 0);
      }, 0);

      document.getElementById('statInStock').innerText = inStockCount;
      document.getElementById('statInStockTotal').innerText = '/ ' + totalTracked;
      document.getElementById('statTotalUnits').innerText = totalUnits.toLocaleString('en-IN');

      // Filter badges count
      document.getElementById('countFilterAll').innerText = totalTracked;
      document.getElementById('countFilterInStock').innerText = inStockCount;
      document.getElementById('countFilterOOS').innerText = oosCount;

      if (data.lastScanTimestamp) {
        var d = new Date(data.lastScanTimestamp);
        var timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';
        document.getElementById('heroLastCheck').innerText = 'SYNCED ' + timeStr;
        document.getElementById('navLastCheck').innerText = timeStr;
      } else {
        document.getElementById('heroLastCheck').innerText = 'SYNCED JUST NOW';
        document.getElementById('navLastCheck').innerText = 'JUST NOW';
      }

      var uptimes30d = data.products.map(function(p) { return p.uptimePercentage30d || 0; });
      var avgUptime30d = uptimes30d.length > 0 ? (uptimes30d.reduce(function(a, b) { return a + b; }, 0) / uptimes30d.length).toFixed(1) : 100;
      document.getElementById('statUptime30d').innerText = avgUptime30d + '%';
    }

    function renderFilteredProducts() {
      var container = document.getElementById('publicProductsContainer');
      var badge = document.getElementById('resultsCountBadge');

      var filtered = rawProducts.filter(function(p) {
        var inStock = p.available && p.inventoryQuantity > 0;
        if (activeStatusFilter === 'in_stock' && !inStock) return false;
        if (activeStatusFilter === 'out_of_stock' && inStock) return false;

        if (searchQuery) {
          var nameMatches = (p.name || '').toLowerCase().indexOf(searchQuery) >= 0;
          var aliasMatches = (p.alias || '').toLowerCase().indexOf(searchQuery) >= 0;
          var ruleMatches = (p.matchedRuleName || '').toLowerCase().indexOf(searchQuery) >= 0;
          if (!nameMatches && !aliasMatches && !ruleMatches) return false;
        }
        return true;
      });

      if (badge) badge.innerText = filtered.length + ' OF ' + rawProducts.length + ' ITEMS';

      if (filtered.length === 0) {
        container.innerHTML = '<div class="swiss-card p-12 rounded-xl border border-[#232733] text-center text-[#717686] space-y-2">' +
          '<p class="text-sm font-bold text-white uppercase font-mono">NO ITEMS MATCH SEARCH CRITERIA</p>' +
          '<p class="text-xs text-[#717686]">Clear the search input or select "ALL" filter tab.</p>' +
          '<button onclick="resetFilter()" class="mt-3 text-xs font-mono font-bold bg-[#1b1e27] hover:bg-[#232733] text-white px-4 py-2 rounded transition">RESET FILTER</button>' +
        '</div>';
        return;
      }

      var now = Date.now();
      var html = '';

      for (var i = 0; i < filtered.length; i++) {
        var p = filtered[i];
        var inStock = p.available && p.inventoryQuantity > 0;
        var indexNum = String(i + 1).padStart(2, '0');

        var timelineHtml = activeTimelineMode === '30d'
          ? generate30DayTimelineBars(p.history, now, inStock, p.inventoryQuantity)
          : generate24HourTimelineBars(p.history, now, inStock, p.inventoryQuantity);

        var axisLabels = activeTimelineMode === '30d'
          ? '<span>30 DAYS AGO</span><span>15 DAYS AGO</span><span>TODAY (LIVE)</span>'
          : '<span>24 HOURS AGO</span><span>12 HOURS AGO</span><span>NOW (LIVE)</span>';

        var modeTitle = activeTimelineMode === '30d' ? '30-DAY DAILY TIMELINE' : '24-HOUR INTRADAY TIMELINE';
        var borderClass = inStock
          ? 'border-[#00e676]/40 shadow-sm'
          : 'border-[#232733]';

        var stockBadge = inStock
          ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-emerald-950/60 text-[#00e676] border border-[#00e676]/50">' +
              '<span class="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse"></span> IN STOCK' +
            '</span>'
          : '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-[#181a22] text-[#717686] border border-[#2a2f3f]">' +
              '<span class="w-1.5 h-1.5 rounded-full bg-[#717686]"></span> OUT OF STOCK' +
            '</span>';

        var buyBtn = inStock
          ? '<a href="' + p.url + '" target="_blank" class="inline-flex items-center justify-center gap-2 font-mono font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded transition bg-[#00e676] hover:bg-[#00c864] text-black shadow-md active:scale-95 shrink-0">' +
              '<span>BUY ON AMUL</span>' +
              '<i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>' +
            '</a>'
          : '<a href="' + p.url + '" target="_blank" class="inline-flex items-center justify-center gap-2 font-mono font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded transition bg-[#1b1e27] hover:bg-[#232733] text-[#a1a7b8] hover:text-white border border-[#232733] shrink-0">' +
              '<span>VIEW STORE</span>' +
              '<i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>' +
            '</a>';

        var imgSafeUrl = p.imageUrl || '';
        var imgSafeName = (p.name || '').replace(/"/g, '&quot;');

        var imgHtml = p.imageUrl
          ? '<div class="relative w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] sm:min-w-[80px] rounded-lg bg-[#0b0c10] border border-[#232733] p-1.5 flex items-center justify-center overflow-hidden group cursor-pointer shrink-0 transition hover:border-[#383e52]" data-img="' + imgSafeUrl + '" data-name="' + imgSafeName + '" onclick="handleImageClick(this)">' +
              '<img src="' + p.imageUrl + '" alt="" class="w-full h-full object-contain rounded transition duration-200 group-hover:scale-105" loading="lazy" onerror="handleImgError(this)" />' +
              '<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs">' +
                '<i class="fa-solid fa-magnifying-glass-plus"></i>' +
              '</div>' +
            '</div>'
          : '<div class="w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] sm:min-w-[80px] rounded-lg bg-[#0b0c10] border border-[#232733] p-1.5 flex items-center justify-center text-[#ff3c00] shrink-0">' +
              '<i class="fa-solid fa-bottle-droplet text-xl"></i>' +
            '</div>';

        html += '<div class="swiss-card p-5 sm:p-6 rounded-xl border ' + borderClass + ' space-y-4">' +
          '<div class="flex items-center justify-between border-b border-[#232733] pb-2 text-[10px] font-mono text-[#717686] uppercase">' +
            '<span>ITEM #' + indexNum + ' // ' + (p.matchedRuleName || 'PROTEIN') + '</span>' +
            '<span class="' + (inStock ? 'text-[#00e676] font-bold' : 'text-[#717686]') + '">' + (inStock ? p.inventoryQuantity + ' UNITS AVAILABLE' : 'CURRENTLY UNAVAILABLE') + '</span>' +
          '</div>' +

          '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">' +
            '<div class="flex items-center gap-4 min-w-0">' +
              imgHtml +
              '<div class="min-w-0 space-y-1">' +
                '<div class="flex items-center gap-2 flex-wrap">' +
                  stockBadge +
                  (p.alias ? '<span class="text-[10px] font-mono text-[#717686] bg-[#0e1015] border border-[#232733] px-2 py-0.5 rounded">' + p.alias + '</span>' : '') +
                '</div>' +
                '<h3 class="font-bold text-base sm:text-lg text-white leading-snug truncate sm:whitespace-normal tracking-tight">' + p.name + '</h3>' +
              '</div>' +
            '</div>' +

            '<div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#232733]">' +
              '<div class="text-left sm:text-right font-mono">' +
                '<span class="text-[10px] text-[#717686] block font-bold uppercase">PRICE</span>' +
                '<span class="text-xl font-black text-white">₹' + (p.price || 0) + '</span>' +
              '</div>' +
              buyBtn +
            '</div>' +
          '</div>' +

          '<div class="bg-[#0b0c10] p-3 rounded-lg border border-[#232733] space-y-2">' +
            '<div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#717686]">' +
              '<div class="flex items-center gap-2 text-white font-semibold">' +
                '<span>' + modeTitle + '</span>' +
              '</div>' +
              '<div class="flex items-center gap-3">' +
                '<span>30D: <b class="text-[#00e676]">' + (p.uptimePercentage30d || 0) + '%</b></span>' +
                '<span>•</span>' +
                '<span>7D: <b class="text-white">' + (p.uptimePercentage7d || 0) + '%</b></span>' +
                '<span>•</span>' +
                '<span>24H: <b class="text-white">' + (p.uptimePercentage24h || 0) + '%</b></span>' +
              '</div>' +
            '</div>' +

            '<div class="timeline-bar">' +
              timelineHtml +
            '</div>' +

            '<div class="flex items-center justify-between text-[10px] text-[#717686] font-mono pt-0.5">' +
              axisLabels +
            '</div>' +
          '</div>' +
        '</div>';
      }

      container.innerHTML = html;
    }

    function handleImageClick(el) {
      var url = el.getAttribute('data-img');
      var name = el.getAttribute('data-name');
      openLightbox(url, name);
    }

    function handleImgError(el) {
      el.onerror = null;
      if (el.parentElement) {
        el.parentElement.innerHTML = '<i class="fa-solid fa-bottle-droplet text-[#ff3c00] text-xl"></i>';
      }
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

        var colorClass = 'bg-[#1a1d26] hover:bg-[#252936]';
        var statusDesc = 'Out of Stock (0%)';

        if (uptimePct >= 90) {
          colorClass = 'bg-[#00e676] hover:bg-[#10ff8b]';
          statusDesc = 'In Stock (100% of day' + (peakQty ? ', ' + peakQty + ' units' : '') + ')';
        } else if (uptimePct > 0) {
          colorClass = 'bg-[#ffb703] hover:bg-[#ffc633]';
          var hours = Math.round((inStockMs / (3600 * 1000)) * 10) / 10;
          statusDesc = 'Partial Stock (' + hours + 'h, ' + uptimePct + '%' + (peakQty ? ', ' + peakQty + ' units' : '') + ')';
        }

        var isToday = (i === daysCount - 1);
        var tooltipText = dateStr + (isToday ? ' (Today)' : '') + ' — ' + statusDesc;
        var safeTip = tooltipText.replace(/"/g, '&quot;');

        segmentsHtml += '<div class="timeline-segment ' + colorClass + '" ' +
          'data-tip="' + safeTip + '" ' +
          'onmouseenter="showTooltipFromEl(event, this)" ' +
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
        var safeTip = tooltipText.replace(/"/g, '&quot;');
        var colorClass = wasInStock ? 'bg-[#00e676] hover:bg-[#10ff8b]' : 'bg-[#1a1d26] hover:bg-[#252936]';

        segmentsHtml += '<div class="timeline-segment ' + colorClass + '" ' +
          'data-tip="' + safeTip + '" ' +
          'onmouseenter="showTooltipFromEl(event, this)" ' +
          'onmouseleave="hideTooltip()">' +
        '</div>';
      }

      return segmentsHtml;
    }

    function showTooltipFromEl(e, el) {
      var text = el.getAttribute('data-tip') || '';
      showTooltip(e, text);
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

    function openLightbox(url, title) {
      if (!url) return;
      var modal = document.getElementById('lightboxModal');
      var img = document.getElementById('lightboxImg');
      var caption = document.getElementById('lightboxTitle');
      if (modal && img) {
        img.src = url;
        if (caption) caption.innerText = title || 'Product Image';
        modal.classList.remove('hidden');
      }
    }

    function closeLightbox() {
      var modal = document.getElementById('lightboxModal');
      if (modal) modal.classList.add('hidden');
    }

    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });

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
