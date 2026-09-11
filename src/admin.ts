/**
 * Serves the responsive, modern Admin Panel Single Page Application.
 */
export function getAdminHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amul Stock Tracker — Admin Panel</title>
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
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  </style>
</head>
<body class="h-full flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">

  <!-- TOP NAVBAR -->
  <header class="glass sticky top-0 z-50 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <i class="fa-solid fa-bottle-droplet text-white text-lg"></i>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-bold text-lg text-white leading-tight">Amul Stock Tracker</h1>
          <span class="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">Cloudflare Worker</span>
        </div>
        <p class="text-xs text-slate-400">Continuous Store Monitor & Telegram Alert Bot</p>
      </div>
    </div>

    <!-- Quick Action Controls -->
    <div class="flex items-center gap-3">
      <!-- Public Status Page Link -->
      <a href="/" target="_blank" title="View Public Status Page" class="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs sm:text-sm px-3 py-2 rounded-lg transition">
        <i class="fa-solid fa-arrow-up-right-from-square text-xs text-emerald-400"></i>
        <span class="hidden sm:inline">Public Page</span>
      </a>

      <!-- Live Cron Scanner Status Indicator -->
      <div id="scannerStatusBadge" class="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span id="scannerStatusText" class="text-slate-300">Scanner Active</span>
      </div>

      <!-- Scan Now Button -->
      <button onclick="triggerScan()" id="btnScanNow" class="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg shadow-md shadow-emerald-600/20 transition active:scale-95">
        <i id="btnScanIcon" class="fa-solid fa-rotate"></i>
        <span>Scan Now</span>
      </button>

      <!-- Lock / Password Modal Toggle -->
      <button onclick="openAuthModal()" title="Security & Password" class="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition">
        <i class="fa-solid fa-lock text-sm"></i>
      </button>
    </div>
  </header>

  <!-- MAIN CONTAINER WITH TABS -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">

    <!-- ALERT BANNER -->
    <div id="alertBanner" class="hidden rounded-xl p-4 text-sm flex items-start gap-3 transition"></div>

    <!-- NAVIGATION TABS -->
    <nav class="flex border-b border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto pb-px text-sm font-medium">
      <button type="button" onclick="switchTab('dashboard')" id="tabBtn-dashboard" class="tab-btn active px-4 py-2.5 rounded-t-lg border-b-2 font-semibold text-emerald-400 border-emerald-400 bg-slate-900/60 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-solid fa-gauge-high"></i> Dashboard
      </button>
      <button type="button" onclick="switchTab('rules')" id="tabBtn-rules" class="tab-btn px-4 py-2.5 rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-solid fa-list-check"></i> Tracked Products <span id="badgeRulesCount" class="bg-slate-800 text-[11px] px-1.5 py-0.5 rounded-full text-slate-300">3</span>
      </button>
      <button type="button" onclick="switchTab('summary')" id="tabBtn-summary" class="tab-btn px-4 py-2.5 rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-solid fa-calendar-day text-amber-400"></i> Daily Summary
      </button>
      <button type="button" onclick="switchTab('telegram')" id="tabBtn-telegram" class="tab-btn px-4 py-2.5 rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-brands fa-telegram"></i> Telegram Settings
      </button>
      <button type="button" onclick="switchTab('ntfy')" id="tabBtn-ntfy" class="tab-btn px-4 py-2.5 rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-solid fa-bell text-sky-400"></i> ntfy Push Alerts
      </button>
      <button type="button" onclick="switchTab('apprise')" id="tabBtn-apprise" class="tab-btn px-4 py-2.5 rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-solid fa-satellite-dish text-purple-400"></i> Apprise Gateway
      </button>
      <button type="button" onclick="switchTab('amul')" id="tabBtn-amul" class="tab-btn px-4 py-2.5 rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-solid fa-store"></i> Amul Store API
      </button>
      <button type="button" onclick="switchTab('logs')" id="tabBtn-logs" class="tab-btn px-4 py-2.5 rounded-t-lg border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 whitespace-nowrap">
        <i class="fa-solid fa-clock-rotate-left"></i> Activity Logs
      </button>
    </nav>

    <!-- TAB 1: DASHBOARD -->
    <section id="tab-dashboard" class="space-y-6">
      <!-- METRIC CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass p-5 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs uppercase font-semibold">Tracked Products</span>
            <i class="fa-solid fa-bullseye text-emerald-400"></i>
          </div>
          <div id="statTrackedCount" class="text-2xl font-bold text-white">3</div>
          <p class="text-xs text-slate-500 mt-1">Active tracking rules</p>
        </div>

        <div class="glass p-5 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs uppercase font-semibold">In Stock Now</span>
            <i class="fa-solid fa-circle-check text-emerald-400"></i>
          </div>
          <div id="statInStockCount" class="text-2xl font-bold text-emerald-400">0</div>
          <p class="text-xs text-slate-500 mt-1">Ready for purchase</p>
        </div>

        <div class="glass p-5 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs uppercase font-semibold">Telegram Alerts</span>
            <i class="fa-brands fa-telegram text-sky-400"></i>
          </div>
          <div id="statTelegramStatus" class="text-lg font-bold text-slate-300">Checking...</div>
          <p id="statTelegramSub" class="text-xs text-slate-500 mt-1">Bot integration</p>
        </div>

        <div class="glass p-5 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs uppercase font-semibold">Last Checked</span>
            <i class="fa-regular fa-clock text-indigo-400"></i>
          </div>
          <div id="statLastScan" class="text-lg font-bold text-slate-200">Never</div>
          <p id="statLastScanSub" class="text-xs text-slate-500 mt-1">Cron runs every 10 minutes</p>
        </div>
      </div>

      <!-- TRACKED PRODUCTS INVENTORY CARDS -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-bold text-white">Target Products Inventory</h2>
            <p class="text-xs text-slate-400">Live status for your prioritized protein products</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="loadDashboardData()" class="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5 transition">
              <i class="fa-solid fa-arrows-rotate"></i> Refresh
            </button>
          </div>
        </div>

        <!-- Target Products Grid -->
        <div id="trackedCardsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="glass p-8 rounded-2xl border border-slate-800 col-span-full text-center text-slate-400">
            <i class="fa-solid fa-spinner fa-spin text-2xl text-emerald-400 mb-2"></i>
            <p>Loading real-time product inventory...</p>
          </div>
        </div>
      </div>

      <!-- COMPLETE AMUL PROTEIN INVENTORY (QUICK TRACK / UNTRACK) -->
      <div class="glass p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-base sm:text-lg">Amul Protein Store Inventory</h3>
              <span id="catalogBadgeTotal" class="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">Loading items...</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">Click any product to add or remove it from real-time restock alerts. Products with photos and prices.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="loadDashboardData()" class="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5 transition">
              <i class="fa-solid fa-arrows-rotate"></i> Refresh Catalog
            </button>
          </div>
        </div>

        <!-- SEARCH AND FILTER CONTROLS -->
        <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <!-- Live Search Bar -->
          <div class="relative flex-1 max-w-md">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input type="text" id="catalogSearchInput" oninput="handleCatalogSearch(event)" placeholder="Search protein items... (e.g. Whey, Lassi, Paneer, Shake, Milk)" class="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition">
            <button id="btnCatalogClearSearch" onclick="clearCatalogSearch()" class="hidden absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs shrink-0">
            <button type="button" data-filter="all" onclick="setCatalogFilter(this)" id="catFilter-all" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition bg-slate-800 text-white border border-slate-700">
              All (<span id="catCountAll" class="catCountAll">0</span>)
            </button>
            <button type="button" data-filter="tracked" onclick="setCatalogFilter(this)" id="catFilter-tracked" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              Tracked (<span id="catCountTracked" class="catCountTracked">0</span>)
            </button>
            <button type="button" data-filter="untracked" onclick="setCatalogFilter(this)" id="catFilter-untracked" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              Untracked (<span id="catCountUntracked" class="catCountUntracked">0</span>)
            </button>
            <button type="button" data-filter="in_stock" onclick="setCatalogFilter(this)" id="catFilter-in_stock" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              In Stock (<span id="catCountInStock" class="catCountInStock">0</span>)
            </button>
            <button type="button" data-filter="oos" onclick="setCatalogFilter(this)" id="catFilter-oos" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              Out of Stock (<span id="catCountOOS" class="catCountOOS">0</span>)
            </button>
          </div>
        </div>

        <!-- PRODUCT CARDS GRID -->
        <div id="catalogCardsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-2">
          <div class="p-8 col-span-full text-center text-slate-500">
            <i class="fa-solid fa-spinner fa-spin text-xl text-emerald-400 mb-2"></i>
            <p class="text-xs">Loading store catalog items...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: TRACKED PRODUCTS MANAGER -->
    <section id="tab-rules" class="hidden space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold text-white">Tracked Products & Inventory</h2>
          <p class="text-xs text-slate-400">Manage monitored products, add new items from the Amul catalog, or add custom keyword rules.</p>
        </div>
        <button onclick="openAddRuleModal()" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition self-start">
          <i class="fa-solid fa-plus"></i> Add Product Keyword
        </button>
      </div>

      <!-- COMPLETE AMUL PROTEIN INVENTORY FOR 1-CLICK TRACKING -->
      <div class="glass p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-base sm:text-lg">Amul Protein Store Catalog</h3>
              <span id="rulesCatalogBadgeTotal" class="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">Loading items...</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">Toggle tracking on any product with 1 click. Monitored items send real-time restock alerts.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="loadDashboardData()" class="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5 transition">
              <i class="fa-solid fa-arrows-rotate"></i> Refresh Catalog
            </button>
          </div>
        </div>

        <!-- SEARCH AND FILTER CONTROLS -->
        <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div class="relative flex-1 max-w-md">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input type="text" id="rulesCatalogSearchInput" oninput="handleCatalogSearch(event)" placeholder="Search protein items... (e.g. Whey, Lassi, Paneer, Shake)" class="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition">
            <button id="btnRulesCatalogClearSearch" onclick="clearCatalogSearch()" class="hidden absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs shrink-0">
            <button type="button" data-filter="all" onclick="setCatalogFilter(this)" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition bg-slate-800 text-white border border-slate-700">
              All (<span class="catCountAll">0</span>)
            </button>
            <button type="button" data-filter="tracked" onclick="setCatalogFilter(this)" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              Tracked (<span class="catCountTracked">0</span>)
            </button>
            <button type="button" data-filter="untracked" onclick="setCatalogFilter(this)" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              Untracked (<span class="catCountUntracked">0</span>)
            </button>
            <button type="button" data-filter="in_stock" onclick="setCatalogFilter(this)" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              In Stock (<span class="catCountInStock">0</span>)
            </button>
            <button type="button" data-filter="oos" onclick="setCatalogFilter(this)" class="cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent">
              Out of Stock (<span class="catCountOOS">0</span>)
            </button>
          </div>
        </div>

        <!-- PRODUCT CARDS GRID -->
        <div id="rulesCatalogCardsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-2">
          <div class="p-8 col-span-full text-center text-slate-500">
            <i class="fa-solid fa-spinner fa-spin text-xl text-emerald-400 mb-2"></i>
            <p class="text-xs">Loading store catalog items...</p>
          </div>
        </div>
      </div>

      <!-- ACTIVE RULES LIST -->
      <div class="glass rounded-2xl border border-slate-800 overflow-hidden space-y-2">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-white text-sm">Active Tracking Rules & Custom Keywords</h3>
            <p class="text-xs text-slate-400">Rules matched against incoming scans</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th class="px-4 py-3 w-16 text-center">Image</th>
                <th class="px-5 py-3">Product / Rule Name</th>
                <th class="px-5 py-3">Search Keyword / Slug</th>
                <th class="px-5 py-3 text-center">Status</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="rulesTableBody" class="divide-y divide-slate-800 font-normal">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- QUICK ADD BY AMUL URL -->
      <div class="glass p-5 rounded-2xl border border-slate-800 space-y-3">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-link text-emerald-400 text-sm"></i>
          <h3 class="font-bold text-white text-sm">Add Custom Product by Direct Amul URL or Slug</h3>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <input type="text" id="inputAmulUrl" placeholder="https://shop.amul.com/en/product/amul-high-protein-rose-lassi-200-ml or product slug" onkeydown="if(event.key==='Enter') trackByAmulUrl()" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono">
          <button onclick="trackByAmulUrl()" id="btnTrackByUrl" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition shrink-0">
            <i class="fa-solid fa-plus"></i> Track Product
          </button>
        </div>
        <p class="text-[11px] text-slate-400">Paste any product URL from <a href="https://shop.amul.com/en/browse/protein" target="_blank" class="text-emerald-400 hover:underline">shop.amul.com</a> to automatically track inventory and send photo restock alerts.</p>
      </div>

      <!-- Info Box on Defaults -->
      <div class="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-xl text-xs text-emerald-300 flex items-start gap-3">
        <i class="fa-solid fa-info-circle text-emerald-400 text-base mt-0.5"></i>
        <div>
          <p class="font-semibold mb-1">Pre-configured Monitoring</p>
          <p class="text-emerald-400/90 leading-relaxed">
            By default, <b>Protein Lassi</b> (matches Plain & Rose Lassi), <b>Protein Buttermilk</b>, and <b>Blueberry Protein Shake</b> are actively tracked. You can add more products by URL or keyword, or toggle any rule above.
          </p>
        </div>
      </div>
    </section>

    <!-- TAB: DAILY STOCK SUMMARY -->
    <section id="tab-summary" class="hidden space-y-6">
      <div class="max-w-2xl glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-calendar-day text-amber-400"></i> Daily Stock Summary
            </h2>
            <span class="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-semibold uppercase">Daily Digest</span>
          </div>
          <p class="text-xs text-slate-400">
            Sends an exhaustive morning digest of all currently available products (with images, prices, units, and direct buy links) and continuously out-of-stock items. Dispatches once per day at your chosen time.
          </p>
        </div>

        <form id="summaryForm" onsubmit="saveSummarySettings(event)" class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div>
              <p class="text-xs font-semibold text-slate-200">Enable Daily Stock Summary</p>
              <p class="text-[11px] text-slate-500">Scheduled daily digest sent automatically via cron</p>
            </div>
            <input type="checkbox" id="summaryEnabled" class="w-4 h-4 accent-amber-500 rounded cursor-pointer" checked>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Scheduled Time (IST - Indian Standard Time)</label>
            <input type="time" id="summaryTimeIst" value="09:00" class="w-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono">
            <p class="text-[11px] text-slate-500 mt-1">Default: <b>09:00 AM IST</b>. Checked on every 10-minute cron run (zero duplicate alerts).</p>
          </div>

          <div class="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 text-xs">
            <p class="font-semibold text-slate-300">Target Notification Channels</p>
            <div class="flex flex-wrap gap-2 text-[11px]" id="summaryChannelsList">
              <span id="chanTgBadge" class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700"><i class="fa-brands fa-telegram text-sky-400 mr-1"></i> Telegram</span>
              <span id="chanNtfyBadge" class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700"><i class="fa-solid fa-bell text-sky-400 mr-1"></i> ntfy Push</span>
              <span id="chanAppriseBadge" class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700"><i class="fa-solid fa-satellite-dish text-purple-400 mr-1"></i> Apprise</span>
            </div>
            <p class="text-[10px] text-slate-500 mt-1">Summary is dispatched to all active channels configured in their respective tabs.</p>
          </div>

          <div class="border-t border-slate-800 pt-5 flex flex-wrap items-center gap-3">
            <button type="submit" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition">
              Save Summary Settings
            </button>
            <button type="button" onclick="testDailySummary()" id="btnTestSummary" class="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition">
              <i class="fa-solid fa-paper-plane"></i> Send Test Summary Now
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- TAB 3: TELEGRAM CONFIGURATION -->
    <section id="tab-telegram" class="hidden space-y-6">
      <div class="max-w-2xl glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-brands fa-telegram text-sky-400"></i> Telegram Alert Credentials
          </h2>
          <p class="text-xs text-slate-400 mt-1">Configure your Telegram Bot Token and Chat ID to receive instant alerts.</p>
        </div>

        <form id="telegramForm" onsubmit="saveTelegramSettings(event)" class="space-y-4">
          <!-- Bot Token -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Telegram Bot Token</label>
            <div class="relative">
              <input type="password" id="tgBotToken" placeholder="e.g. 7123456789:AAFxz_SAMPLE_TOKEN..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
              <button type="button" onclick="togglePasswordVisibility('tgBotToken')" class="absolute right-3 top-3 text-slate-400 hover:text-white text-xs">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Create a bot via <a href="https://t.me/BotFather" target="_blank" class="text-emerald-400 hover:underline">@BotFather</a> on Telegram to obtain your token.</p>
          </div>

          <!-- Chat ID -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Telegram Chat ID</label>
            <input type="text" id="tgChatId" placeholder="e.g. 123456789 or -1001234567890" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
            <p class="text-[11px] text-slate-500 mt-1">Your user or group ID. Send a message to <a href="https://t.me/userinfobot" target="_blank" class="text-emerald-400 hover:underline">@userinfobot</a> to see your ID.</p>
          </div>

          <!-- Notification Toggles -->
          <div class="border-t border-slate-800 pt-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Alert on Restock</p>
                <p class="text-[11px] text-slate-500">Send message when out-of-stock product is available</p>
              </div>
              <input type="checkbox" id="tgNotifyRestock" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer" checked>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Alert on Out-of-Stock</p>
                <p class="text-[11px] text-slate-500">Send message when product runs out of stock</p>
              </div>
              <input type="checkbox" id="tgNotifyOOS" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Repeat Alert Cooldown (Hours)</label>
              <input type="number" id="tgCooldownHours" min="1" max="48" value="4" class="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
              <p class="text-[11px] text-slate-500 mt-1">Prevents alert spam if a product stays continuously in stock.</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="border-t border-slate-800 pt-5 flex flex-wrap items-center gap-3">
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition">
              Save Telegram Settings
            </button>
            <button type="button" onclick="testTelegramAlert()" id="btnTestTg" class="bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition">
              <i class="fa-solid fa-paper-plane"></i> Send Test Notification
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- TAB: NTFY PUSH ALERTS -->
    <section id="tab-ntfy" class="hidden space-y-6">
      <div class="max-w-2xl glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-bell text-sky-400"></i> ntfy Push Notification Settings
            </h2>
            <span class="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-semibold uppercase">Self-Hostable on Render</span>
          </div>
          <p class="text-xs text-slate-400">Receive instant push notifications on your phone (Android/iOS) or web browser via ntfy.</p>
        </div>

        <form id="ntfyForm" onsubmit="saveNtfySettings(event)" class="space-y-4">
          <!-- Server URL -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">ntfy Server URL</label>
            <input type="url" id="ntfyServerUrl" placeholder="e.g. https://amul-ntfy.onrender.com or https://ntfy.sh" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
            <p class="text-[11px] text-slate-500 mt-1">Use your Render self-hosted URL or public <code>https://ntfy.sh</code>.</p>
          </div>

          <!-- Topic Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Topic Name</label>
            <input type="text" id="ntfyTopic" placeholder="e.g. amul-protein-alerts" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
            <p class="text-[11px] text-slate-500 mt-1">Subscribe to this topic in the ntfy app on your phone or web browser.</p>
          </div>

          <!-- Optional Auth Token -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Access Token (Optional)</label>
            <input type="password" id="ntfyToken" placeholder="Optional token if authentication is enabled" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
          </div>

          <!-- Toggles -->
          <div class="border-t border-slate-800 pt-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Enable ntfy Push Alerts</p>
                <p class="text-[11px] text-slate-500">Dispatch alerts to this ntfy server on restocks</p>
              </div>
              <input type="checkbox" id="ntfyEnabled" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer">
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Alert on Restock</p>
                <p class="text-[11px] text-slate-500">Send push notification when item is available</p>
              </div>
              <input type="checkbox" id="ntfyNotifyRestock" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer" checked>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Alert on Out-of-Stock</p>
                <p class="text-[11px] text-slate-500">Send push notification when item runs out of stock</p>
              </div>
              <input type="checkbox" id="ntfyNotifyOOS" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer">
            </div>
          </div>


          <!-- Action Buttons -->
          <div class="border-t border-slate-800 pt-5 flex flex-wrap items-center gap-3">
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition">
              Save ntfy Settings
            </button>
            <button type="button" onclick="testNtfyAlert()" id="btnTestNtfy" class="bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition">
              <i class="fa-solid fa-paper-plane"></i> Send Test Notification
            </button>
            <a id="linkOpenNtfy" href="https://ntfy.sh" target="_blank" class="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition">
              <span>Open Web Feed</span> <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          </div>
        </form>
      </div>

      <!-- Quick Setup Guide for Mobile & Render -->
      <div class="max-w-2xl bg-sky-950/20 border border-sky-800/40 p-5 rounded-2xl text-xs text-sky-300 space-y-2">
        <p class="font-bold text-sm text-sky-200 flex items-center gap-2"><i class="fa-solid fa-mobile-screen"></i> How to receive push notifications on your phone</p>
        <ol class="list-decimal list-inside space-y-1 text-sky-300/90 leading-relaxed">
          <li>Install <b>ntfy</b> from Google Play Store (Android) or Apple App Store (iOS).</li>
          <li>Tap <b>+</b> (Subscribe to topic).</li>
          <li>Enter your topic name (and your Render server URL if self-hosting).</li>
          <li>You will receive push notifications with sound whenever Amul restocks!</li>
        </ol>
      </div>
    </section>

    <!-- TAB: APPRISE NOTIFICATIONS -->
    <section id="tab-apprise" class="hidden space-y-6">
      <div class="max-w-2xl glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-satellite-dish text-purple-400"></i> Apprise Notification Gateway
            </h2>
            <span class="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-semibold uppercase">80+ Services</span>
          </div>
          <p class="text-xs text-slate-400">Send instant restock notifications through your Apprise API server to Telegram, Discord, Slack, Gotify, Email, and 80+ providers.</p>
        </div>

        <form id="appriseForm" onsubmit="saveAppriseSettings(event)" class="space-y-4">
          <!-- Server URL -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Apprise Server URL</label>
            <input type="url" id="appriseServerUrl" placeholder="e.g. https://apprise.yourdomain.com" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono">
            <p class="text-[11px] text-slate-500 mt-1">URL of your Apprise API microservice instance.</p>
          </div>

          <!-- Notification Target URLs -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Notification Service URLs (Apprise Schemes)</label>
            <textarea id="appriseUrls" rows="3" placeholder="tgram://bot_token/chat_id, discord://webhook_id/webhook_token" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"></textarea>
            <p class="text-[11px] text-slate-500 mt-1">Comma-separated Apprise URLs (e.g. <code>tgram://...</code>, <code>discord://...</code>, <code>slack://...</code>, <code>pover://...</code>).</p>
          </div>

          <!-- Config Key (Optional) -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Config Key (Optional)</label>
            <input type="text" id="appriseConfigKey" placeholder="Optional persistent configuration key on Apprise server" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono">
          </div>

          <!-- Toggles -->
          <div class="border-t border-slate-800 pt-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Enable Apprise Gateway</p>
                <p class="text-[11px] text-slate-500">Dispatch restock alerts through Apprise</p>
              </div>
              <input type="checkbox" id="appriseEnabled" class="w-4 h-4 accent-purple-500 rounded cursor-pointer">
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Alert on Restock</p>
                <p class="text-[11px] text-slate-500">Trigger Apprise notifications when item is back in stock</p>
              </div>
              <input type="checkbox" id="appriseNotifyRestock" class="w-4 h-4 accent-purple-500 rounded cursor-pointer" checked>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-200">Alert on Out-of-Stock</p>
                <p class="text-[11px] text-slate-500">Trigger Apprise notifications when item runs out of stock</p>
              </div>
              <input type="checkbox" id="appriseNotifyOOS" class="w-4 h-4 accent-purple-500 rounded cursor-pointer">
            </div>
          </div>


          <!-- Action Buttons -->
          <div class="border-t border-slate-800 pt-5 flex flex-wrap items-center gap-3">
            <button type="submit" class="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition">
              Save Apprise Settings
            </button>
            <button type="button" onclick="testAppriseAlert()" id="btnTestApprise" class="bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition">
              <i class="fa-solid fa-paper-plane"></i> Send Test Notification
            </button>
          </div>
        </form>
      </div>

      <!-- Apprise Service Cheat Sheet -->
      <div class="max-w-2xl bg-purple-950/20 border border-purple-800/40 p-5 rounded-2xl text-xs text-purple-300 space-y-3">
        <p class="font-bold text-sm text-purple-200 flex items-center gap-2"><i class="fa-solid fa-book"></i> Popular Apprise URL Examples</p>
        <ul class="space-y-1.5 font-mono text-[11px] text-purple-300/90">
          <li><span class="text-purple-400 font-semibold font-sans">Telegram:</span> <code>tgram://bot_token/chat_id</code></li>
          <li><span class="text-purple-400 font-semibold font-sans">Discord:</span> <code>discord://webhook_id/webhook_token</code></li>
          <li><span class="text-purple-400 font-semibold font-sans">Slack:</span> <code>slack://tokenA/tokenB/tokenC</code></li>
          <li><span class="text-purple-400 font-semibold font-sans">Pushover:</span> <code>pover://user_key@app_token</code></li>
          <li><span class="text-purple-400 font-semibold font-sans">Gotify:</span> <code>gotify://hostname/app_token</code></li>
        </ul>
      </div>
    </section>

    <!-- TAB 4: AMUL STORE API CONFIG -->
    <section id="tab-amul" class="hidden space-y-6">
      <div class="max-w-2xl glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-sliders text-emerald-400"></i> Amul Store API Parameters
          </h2>
          <p class="text-xs text-slate-400 mt-1">Configure target warehouse location (substore) and session cookies.</p>
        </div>

        <form id="amulForm" onsubmit="saveAmulSettings(event)" class="space-y-4">
          <!-- Substore ID -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Substore ID (Warehouse Region)</label>
            <input type="text" id="amulSubstoreId" value="66505ff06510ee3d5903fd42" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
            <p class="text-[11px] text-slate-500 mt-1">Default: <code>66505ff06510ee3d5903fd42</code> (Gujarat region from your sample request).</p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Category Alias</label>
            <input type="text" id="amulCategory" value="protein" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
            <p class="text-[11px] text-slate-500 mt-1">Default category: <code>protein</code></p>
          </div>

          <!-- Session Cookies / jsessionid -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Session Cookie (<code>jsessionid</code> or full cookie header)</label>
            <textarea id="amulCookies" rows="3" placeholder="jsessionid=s%3A..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"></textarea>
            <p class="text-[11px] text-slate-500 mt-1">Pre-filled with working session cookie. If Amul returns 401 Unauthorized in future, copy your updated cookie from browser DevTools here.</p>
          </div>

          <!-- Automated Scanner Active Switch -->
          <div class="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-slate-200">Continuous Automated Scanning</p>
              <p class="text-[11px] text-slate-500">Enable Cloudflare Worker cron triggers to scan continuously</p>
            </div>
            <input type="checkbox" id="scannerActiveToggle" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer" checked>
          </div>

          <!-- Action Buttons -->
          <div class="border-t border-slate-800 pt-5 flex flex-wrap items-center gap-3">
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition">
              Save Store Settings
            </button>
            <button type="button" onclick="testAmulConnection()" id="btnTestAmul" class="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition">
              <i class="fa-solid fa-plug-circle-check"></i> Test Amul Connection
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- TAB 5: SCAN & ALERT LOGS -->
    <section id="tab-logs" class="hidden space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-white">Activity & Alert Logs</h2>
          <p class="text-xs text-slate-400">Chronological history of background cron scans and alerts dispatched.</p>
        </div>
        <button onclick="loadLogs()" class="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5 transition">
          <i class="fa-solid fa-arrows-rotate"></i> Refresh Logs
        </button>
      </div>

      <div class="glass rounded-2xl border border-slate-800 overflow-hidden">
        <div class="overflow-x-auto max-h-[500px]">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900 text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th class="px-4 py-3">Time (IST)</th>
                <th class="px-4 py-3">Trigger</th>
                <th class="px-4 py-3">Catalog Total</th>
                <th class="px-4 py-3">Tracked Matches</th>
                <th class="px-4 py-3">In Stock</th>
                <th class="px-4 py-3">Alerts Dispatched</th>
                <th class="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody id="logsTableBody" class="divide-y divide-slate-800 font-mono">
              <tr><td colspan="7" class="p-6 text-center text-slate-500 font-sans">Loading activity logs...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <!-- MODAL: ADD TRACKING RULE -->
  <div id="modalAddRule" class="hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="glass max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-white text-base">Add Product Tracking Keyword</h3>
        <button onclick="closeAddRuleModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <form id="addRuleForm" onsubmit="submitNewRule(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Friendly Display Name</label>
          <input type="text" id="newRuleName" required placeholder="e.g. Chocolate Whey Protein" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Search Keyword / Pattern</label>
          <input type="text" id="newRuleKeyword" required placeholder="e.g. chocolate whey" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
          <p class="text-[11px] text-slate-500 mt-1">Case-insensitive match against product name and alias.</p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeAddRuleModal()" class="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-900">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Save Rule</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: SECURITY & PASSWORD -->
  <div id="modalAuth" class="hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="glass max-w-sm w-full p-6 rounded-2xl border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-white text-base flex items-center gap-2"><i class="fa-solid fa-shield-halved text-emerald-400"></i> Admin Security</h3>
        <button onclick="closeAuthModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Session Access Password</label>
          <input type="password" id="inputAdminPassword" placeholder="••••••••" onkeydown="if(event.key==='Enter') saveAdminAuthToken()" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono">
          <p class="text-[11px] text-slate-500 mt-1">Enter your admin password to authenticate this session</p>
        </div>
        <button onclick="saveAdminAuthToken()" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition">Authenticate Session</button>

        <div class="border-t border-slate-800 pt-3 space-y-2">
          <label class="block font-semibold text-slate-300 mb-1">Change Cloudflare Worker Password</label>
          <div class="flex gap-2">
            <input type="password" id="inputChangePassword" placeholder="New password" onkeydown="if(event.key==='Enter') updateServerPassword()" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono">
            <button onclick="updateServerPassword()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition">Update</button>
          </div>
          <p class="text-[10px] text-slate-500">Persists the new admin password in KV storage.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: IMAGE LIGHTBOX -->
  <div id="lightboxModal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onclick="closeLightbox()">
    <div class="relative max-w-lg w-full glass p-4 rounded-3xl border border-slate-700 text-center space-y-3" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between px-2">
        <h4 id="lightboxTitle" class="text-sm font-bold text-white truncate max-w-[85%] text-left"></h4>
        <button onclick="closeLightbox()" class="text-slate-400 hover:text-white text-base"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="bg-slate-900/90 rounded-2xl p-4 flex items-center justify-center max-h-[70vh] border border-slate-800">
        <img id="lightboxImg" src="" alt="Product" class="max-h-[60vh] max-w-full object-contain rounded-xl" />
      </div>
    </div>
  </div>

  <!-- CLIENT SCRIPTS -->
  <script>
    let appConfig = null;
    let cachedCatalog = [];

    // Helper: get stored admin token
    function getAuthHeader() {
      const pass = localStorage.getItem('amul_admin_pass') || '';
      return { 'x-admin-password': pass };
    }

    // Tab switcher
    function switchTab(tabId) {
      document.querySelectorAll('main > section').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-emerald-400', 'border-emerald-400', 'bg-slate-900/60');
        btn.classList.add('border-transparent', 'text-slate-400');
      });

      const activeSection = document.getElementById('tab-' + tabId);
      const activeBtn = document.getElementById('tabBtn-' + tabId);
      if (activeSection) activeSection.classList.remove('hidden');
      if (activeBtn) {
        activeBtn.classList.add('active', 'text-emerald-400', 'border-emerald-400', 'bg-slate-900/60');
        activeBtn.classList.remove('border-transparent', 'text-slate-400');
      }

      if (tabId === 'rules') {
        renderRulesTable();
        if (cachedCatalog && cachedCatalog.length > 0) {
          renderCatalogExplorer(cachedCatalog);
        } else {
          loadDashboardData();
        }
      }
      if (tabId === 'logs') loadLogs();
      if (tabId === 'dashboard' && (!cachedCatalog || cachedCatalog.length === 0)) loadDashboardData();
    }

    function switchTabFromEl(el) {
      var tab = el ? el.getAttribute('data-tab') : '';
      if (tab) switchTab(tab);
    }

    function hideAlert() {
      var el = document.getElementById('alertBanner');
      if (el) el.classList.add('hidden');
    }

    // Notification banner
    function showAlert(type, message) {
      const el = document.getElementById('alertBanner');
      el.className = 'rounded-xl p-4 text-sm flex items-start gap-3 transition ' + 
        (type === 'success' ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300' :
         type === 'error' ? 'bg-rose-950/50 border border-rose-800 text-rose-300' :
         'bg-slate-900 border border-slate-800 text-slate-300');
      
      const icon = type === 'success' ? 'fa-circle-check text-emerald-400' :
                   type === 'error' ? 'fa-triangle-exclamation text-rose-400' : 'fa-info-circle text-sky-400';
      
      el.innerHTML = '<i class="fa-solid ' + icon + ' mt-0.5 text-base"></i><div class="flex-1">' + message + '</div><button onclick="hideAlert()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>';
      el.classList.remove('hidden');

      setTimeout(() => {
        el.classList.add('hidden');
      }, 8000);
    }

    // Fetch configuration and initial data
    async function init() {
      // Allow passing password via query param on first visit: e.g. /admin?password=...
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('password')) {
        const p = urlParams.get('password');
        if (p) {
          localStorage.setItem('amul_admin_pass', p);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      try {
        const res = await fetch('/api/config', { headers: getAuthHeader() });
        if (res.status === 401) {
          showAlert('error', 'Authentication required. Please authenticate with your admin password.');
          openAuthModal();
          return;
        }
        if (!res.ok) throw new Error('Failed to load configuration (HTTP ' + res.status + ')');
        appConfig = await res.json();
        populateSettings();
        await loadDashboardData();
      } catch (err) {
        console.error(err);
        showAlert('error', 'Error connecting to Cloudflare Worker API: ' + err.message);
      }
    }

    function populateSettings() {
      if (!appConfig) return;
      
      // Tracked count badge
      document.getElementById('badgeRulesCount').innerText = appConfig.rules.length;
      document.getElementById('statTrackedCount').innerText = appConfig.rules.length;

      // Telegram
      document.getElementById('tgBotToken').value = appConfig.telegram.botToken || '';
      document.getElementById('tgChatId').value = appConfig.telegram.chatId || '';
      document.getElementById('tgNotifyRestock').checked = appConfig.telegram.notifyOnRestock ?? true;
      document.getElementById('tgNotifyOOS').checked = appConfig.telegram.notifyOnOutOfStock ?? false;
      document.getElementById('tgCooldownHours').value = appConfig.telegram.cooldownHours || 4;

      if (appConfig.telegram.botToken && appConfig.telegram.chatId) {
        document.getElementById('statTelegramStatus').innerHTML = '<span class="text-emerald-400">Configured</span>';
        document.getElementById('statTelegramSub').innerText = 'Ready to send alerts';
      } else {
        document.getElementById('statTelegramStatus').innerHTML = '<span class="text-amber-400">Missing Token/Chat</span>';
        document.getElementById('statTelegramSub').innerText = 'Set in Telegram tab';
      }

      // ntfy
      if (appConfig.ntfy) {
        document.getElementById('ntfyServerUrl').value = appConfig.ntfy.serverUrl || 'https://ntfy.sh';
        document.getElementById('ntfyTopic').value = appConfig.ntfy.topic || '';
        document.getElementById('ntfyToken').value = appConfig.ntfy.token || '';
        document.getElementById('ntfyEnabled').checked = Boolean(appConfig.ntfy.enabled);
        document.getElementById('ntfyNotifyRestock').checked = appConfig.ntfy.notifyOnRestock ?? true;
        document.getElementById('ntfyNotifyOOS').checked = appConfig.ntfy.notifyOnOutOfStock ?? false;
        
        const openLink = document.getElementById('linkOpenNtfy');
        if (openLink && appConfig.ntfy.topic) {
          const sUrl = (appConfig.ntfy.serverUrl || 'https://ntfy.sh').trim();
          const base = sUrl.endsWith('/') ? sUrl.slice(0, -1) : sUrl;
          openLink.href = base + '/' + encodeURIComponent(appConfig.ntfy.topic);
        }
      }

      // Apprise
      if (appConfig.apprise) {
        document.getElementById('appriseServerUrl').value = appConfig.apprise.serverUrl || '';
        document.getElementById('appriseUrls').value = appConfig.apprise.urls || '';
        document.getElementById('appriseConfigKey').value = appConfig.apprise.configKey || '';
        document.getElementById('appriseEnabled').checked = Boolean(appConfig.apprise.enabled);
        document.getElementById('appriseNotifyRestock').checked = appConfig.apprise.notifyOnRestock ?? true;
        document.getElementById('appriseNotifyOOS').checked = appConfig.apprise.notifyOnOutOfStock ?? false;
      }

      // Daily Summary
      if (appConfig.summary) {
        document.getElementById('summaryEnabled').checked = appConfig.summary.enabled ?? true;
        document.getElementById('summaryTimeIst').value = appConfig.summary.timeIst || '09:00';
      }

      var tgActive = Boolean(appConfig.telegram && appConfig.telegram.botToken && appConfig.telegram.chatId);
      var ntfyActive = Boolean(appConfig.ntfy && appConfig.ntfy.enabled && appConfig.ntfy.topic);
      var appriseActive = Boolean(appConfig.apprise && appConfig.apprise.enabled && appConfig.apprise.serverUrl);

      var chanTg = document.getElementById('chanTgBadge');
      if (chanTg) chanTg.className = 'px-2.5 py-1 rounded-lg border ' + (tgActive ? 'bg-sky-950/60 text-sky-400 border-sky-800' : 'bg-slate-900 text-slate-500 border-slate-800');
      var chanNtfy = document.getElementById('chanNtfyBadge');
      if (chanNtfy) chanNtfy.className = 'px-2.5 py-1 rounded-lg border ' + (ntfyActive ? 'bg-sky-950/60 text-sky-400 border-sky-800' : 'bg-slate-900 text-slate-500 border-slate-800');
      var chanApp = document.getElementById('chanAppriseBadge');
      if (chanApp) chanApp.className = 'px-2.5 py-1 rounded-lg border ' + (appriseActive ? 'bg-purple-950/60 text-purple-400 border-purple-800' : 'bg-slate-900 text-slate-500 border-slate-800');

      // Amul
      document.getElementById('amulSubstoreId').value = appConfig.amul.substoreId || '';
      document.getElementById('amulCategory').value = appConfig.amul.category || 'protein';
      document.getElementById('amulCookies').value = appConfig.amul.cookies || '';
      document.getElementById('scannerActiveToggle').checked = appConfig.isScanningActive ?? true;

      // Scanner Status
      const scannerStatusText = document.getElementById('scannerStatusText');
      if (appConfig.isScanningActive) {
        scannerStatusText.innerText = 'Scanner Active';
        scannerStatusText.className = 'text-emerald-400';
      } else {
        scannerStatusText.innerText = 'Scanner Paused';
        scannerStatusText.className = 'text-amber-400';
      }

      renderRulesTable();
    }

    // Render Rules table in Tracked Products tab
    function renderRulesTable() {
      const tbody = document.getElementById('rulesTableBody');
      if (!tbody) return;
      if (!appConfig || !appConfig.rules || appConfig.rules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-500">No tracking rules yet. Add a product by URL or keyword above.</td></tr>';
        return;
      }

      tbody.innerHTML = appConfig.rules.map(function(rule) {
        var imgSafeUrl = rule.imageUrl || '';
        var imgSafeName = (rule.name || '').replace(/"/g, '&quot;');
        var imgHtml = rule.imageUrl
          ? '<div class="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 shadow-sm mx-auto" data-img="' + imgSafeUrl + '" data-name="' + imgSafeName + '" onclick="handleImageClick(this)">' +
              '<img src="' + rule.imageUrl + '" alt="" class="w-full h-full object-contain rounded-lg" loading="lazy" onerror="handleImgError(this)" />' +
            '</div>'
          : '<div class="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0 mx-auto"><i class="fa-solid fa-bottle-droplet text-sm"></i></div>';

        var priceBadge = rule.price ? ' <span class="text-xs text-emerald-400 font-mono font-semibold ml-2">₹' + rule.price + '</span>' : '';
        var statusBtn = '<button data-id="' + rule.id + '" onclick="toggleRule(this)" class="px-2.5 py-1 rounded-full text-xs font-semibold ' + (rule.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700') + '">' + (rule.enabled ? 'Active' : 'Disabled') + '</button>';

        return '<tr class="hover:bg-slate-900/50 transition">' +
          '<td class="px-4 py-3 text-center">' + imgHtml + '</td>' +
          '<td class="px-5 py-3.5 font-medium text-white">' +
            '<div class="flex items-center gap-1.5">' +
              '<span class="font-semibold">' + rule.name + '</span>' +
              priceBadge +
            '</div>' +
          '</td>' +
          '<td class="px-5 py-3.5 font-mono text-xs text-slate-400">' +
            '<span class="bg-slate-900 border border-slate-800 px-2 py-1 rounded">' + (rule.alias || rule.keyword) + '</span>' +
          '</td>' +
          '<td class="px-5 py-3.5 text-center">' + statusBtn + '</td>' +
          '<td class="px-5 py-3.5 text-right">' +
            '<button data-id="' + rule.id + '" onclick="deleteRule(this)" class="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-950/40 transition" title="Delete Rule">' +
              '<i class="fa-solid fa-trash-can"></i>' +
            '</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    // Load live dashboard inventory
    async function loadDashboardData() {
      const container = document.getElementById('trackedCardsGrid');
      try {
        const res = await fetch('/api/dashboard', { headers: getAuthHeader() });
        if (res.status === 401) {
          container.innerHTML = '<div class="glass p-8 rounded-2xl border border-amber-800/60 col-span-full text-center text-amber-300"><i class="fa-solid fa-shield-halved text-2xl text-amber-400 mb-2"></i><p class="font-bold">Authentication Required</p><p class="text-xs text-amber-400/80 mt-1">Please authenticate with your admin password to view and manage products.</p><button onclick="openAuthModal()" class="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold">Authenticate Session</button></div>';
          return;
        }
        if (!res.ok) throw new Error('Failed to load dashboard data (HTTP ' + res.status + ')');
        const data = await res.json();

        cachedCatalog = data.allProducts || [];
        renderCatalogExplorer(cachedCatalog);

        const matched = data.matchedProducts || [];
        const inStockCount = matched.filter(function(p) { return p.available && p.inventoryQuantity > 0; }).length;
        document.getElementById('statInStockCount').innerText = inStockCount;

        if (data.lastScanTimestamp) {
          const d = new Date(data.lastScanTimestamp);
          document.getElementById('statLastScan').innerText = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          document.getElementById('statLastScanSub').innerText = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }

        if (matched.length === 0) {
          container.innerHTML = '<div class="glass p-8 rounded-2xl border border-slate-800 col-span-full text-center text-slate-400"><i class="fa-solid fa-magnifying-glass text-2xl text-slate-600 mb-2"></i><p>No products currently matched your tracking rules.</p><button data-tab="rules" onclick="switchTabFromEl(this)" class="mt-3 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg">Check Tracking Rules</button></div>';
          return;
        }

        container.innerHTML = matched.map(function(p) {
          var inStock = p.available && p.inventoryQuantity > 0;
          var imgSafeUrl = p.imageUrl || '';
          var imgSafeName = (p.name || '').replace(/"/g, '&quot;');
          var imgHtml = p.imageUrl
            ? '<div class="relative w-16 h-16 min-w-[64px] rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden group cursor-pointer shrink-0 shadow" data-img="' + imgSafeUrl + '" data-name="' + imgSafeName + '" onclick="handleImageClick(this)">' +
                '<img src="' + p.imageUrl + '" alt="" class="w-full h-full object-contain rounded-lg transition duration-200 group-hover:scale-105" loading="lazy" onerror="handleImgError(this)" />' +
                '<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs rounded-lg"><i class="fa-solid fa-magnifying-glass-plus"></i></div>' +
              '</div>'
            : '<div class="w-16 h-16 min-w-[64px] rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center text-emerald-400 shrink-0"><i class="fa-solid fa-bottle-droplet text-xl"></i></div>';

          var borderClass = inStock ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20' : 'border-slate-800';
          var stockBadge = inStock
            ? '<span class="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● In Stock</span>'
            : '<span class="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">○ Out of Stock</span>';

          return '<div class="glass p-5 rounded-2xl border ' + borderClass + ' flex flex-col justify-between space-y-4 hover:border-slate-700 transition">' +
            '<div>' +
              '<div class="flex items-center justify-between gap-2 mb-3">' +
                stockBadge +
                '<span class="text-xs font-bold text-white font-mono">₹' + p.price + '</span>' +
              '</div>' +
              '<div class="flex items-center gap-3.5">' +
                imgHtml +
                '<div class="min-w-0 flex-1">' +
                  '<h3 class="font-bold text-sm text-slate-100 line-clamp-2 leading-snug">' + p.name + '</h3>' +
                  '<p class="text-[11px] text-slate-400 mt-1">Rule: <span class="text-emerald-400 font-medium">' + (p.matchedRuleName || 'Custom') + '</span></p>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">' +
              '<div>' +
                '<span class="text-slate-400 text-[11px]">Units: </span>' +
                '<span class="font-bold font-mono ' + (inStock ? 'text-emerald-400' : 'text-slate-500') + '">' + p.inventoryQuantity + '</span>' +
              '</div>' +
              '<div class="flex items-center gap-2">' +
                '<button data-id="' + (p.matchedRuleId || p.id) + '" onclick="untrackProduct(this)" class="text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition" title="Untrack Product"><i class="fa-solid fa-trash-can text-xs"></i></button>' +
                '<a href="' + p.url + '" target="_blank" class="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition">' +
                  '<span>View Product</span> <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>' +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');

      } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="p-6 text-rose-400 col-span-full text-center">Failed to load live status: ' + err.message + '</div>';
      }
    }

    // Catalog State: Filtering & Searching
    let catalogFilter = 'all'; // 'all' | 'tracked' | 'untracked' | 'in_stock' | 'oos'
    let catalogSearchQuery = '';

    function getMatchingRule(p) {
      if (!appConfig || !appConfig.rules || !p) return null;
      var pid = (p.id || '').trim();
      var alias = (p.alias || '').trim().toLowerCase();
      var name = (p.name || '').trim().toLowerCase();
      return appConfig.rules.find(function(r) {
        if (!r.enabled) return false;
        if (r.productId && pid && r.productId === pid) return true;
        if (r.alias && alias && r.alias.toLowerCase() === alias) return true;
        var kw = (r.keyword || '').trim().toLowerCase();
        if (kw && (name.includes(kw) || kw.includes(name) || (alias && alias.includes(kw)))) return true;
        return false;
      }) || null;
    }

    function isProductTracked(p) {
      return Boolean(getMatchingRule(p));
    }

    function handleCatalogSearch(e) {
      catalogSearchQuery = (e && e.target ? e.target.value : '').trim().toLowerCase();
      var c1 = document.getElementById('btnCatalogClearSearch');
      if (c1) {
        if (catalogSearchQuery) c1.classList.remove('hidden');
        else c1.classList.add('hidden');
      }
      var c2 = document.getElementById('btnRulesCatalogClearSearch');
      if (c2) {
        if (catalogSearchQuery) c2.classList.remove('hidden');
        else c2.classList.add('hidden');
      }
      var i1 = document.getElementById('catalogSearchInput');
      var i2 = document.getElementById('rulesCatalogSearchInput');
      if (i1 && e && e.target !== i1) i1.value = catalogSearchQuery;
      if (i2 && e && e.target !== i2) i2.value = catalogSearchQuery;
      renderCatalogExplorer(cachedCatalog);
    }

    function clearCatalogSearch() {
      catalogSearchQuery = '';
      var i1 = document.getElementById('catalogSearchInput');
      var i2 = document.getElementById('rulesCatalogSearchInput');
      if (i1) i1.value = '';
      if (i2) i2.value = '';
      var c1 = document.getElementById('btnCatalogClearSearch');
      if (c1) c1.classList.add('hidden');
      var c2 = document.getElementById('btnRulesCatalogClearSearch');
      if (c2) c2.classList.add('hidden');
      renderCatalogExplorer(cachedCatalog);
    }

    function setCatalogFilter(el) {
      if (!el) return;
      var f = el.getAttribute('data-filter') || 'all';
      catalogFilter = f;
      document.querySelectorAll('.cat-filter-btn').forEach(function(btn) {
        if (btn.getAttribute('data-filter') === f) {
          btn.className = 'cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition bg-slate-800 text-white border border-slate-700';
        } else {
          btn.className = 'cat-filter-btn px-2.5 py-1 rounded-lg font-medium transition text-slate-400 hover:text-white border border-transparent';
        }
      });
      renderCatalogExplorer(cachedCatalog);
    }

    function resetCatalogFilters() {
      clearCatalogSearch();
      var btn = document.getElementById('catFilter-all');
      if (btn) setCatalogFilter(btn);
    }

    function renderCatalogExplorer(products) {
      var grid1 = document.getElementById('catalogCardsGrid');
      var grid2 = document.getElementById('rulesCatalogCardsGrid');
      if (!grid1 && !grid2) return;

      if (!products || products.length === 0) {
        var emptyHtml = '<div class="p-8 col-span-full text-center text-slate-500 font-sans"><i class="fa-solid fa-box-open text-2xl text-slate-600 mb-2"></i><p class="text-xs">No products returned from Amul store API.</p><button onclick="loadDashboardData()" class="mt-2 text-xs text-emerald-400 hover:underline">Retry Loading</button></div>';
        if (grid1) grid1.innerHTML = emptyHtml;
        if (grid2) grid2.innerHTML = emptyHtml;
        return;
      }

      var totalCount = products.length;
      var trackedCount = 0;
      var inStockCount = 0;

      products.forEach(function(p) {
        if (isProductTracked(p)) trackedCount++;
        if (p.available && p.inventoryQuantity > 0) inStockCount++;
      });
      var untrackedCount = totalCount - trackedCount;
      var oosCount = totalCount - inStockCount;

      // Update badges
      var b1 = document.getElementById('catalogBadgeTotal');
      if (b1) b1.innerText = totalCount + ' products';
      var b2 = document.getElementById('rulesCatalogBadgeTotal');
      if (b2) b2.innerText = totalCount + ' products';

      // Update count spans
      document.querySelectorAll('.catCountAll').forEach(function(el) { el.innerText = totalCount; });
      document.querySelectorAll('.catCountTracked').forEach(function(el) { el.innerText = trackedCount; });
      document.querySelectorAll('.catCountUntracked').forEach(function(el) { el.innerText = untrackedCount; });
      document.querySelectorAll('.catCountInStock').forEach(function(el) { el.innerText = inStockCount; });
      document.querySelectorAll('.catCountOOS').forEach(function(el) { el.innerText = oosCount; });

      // Filter products
      var filtered = products.filter(function(p) {
        var isTrk = isProductTracked(p);
        var isStk = p.available && p.inventoryQuantity > 0;

        if (catalogFilter === 'tracked' && !isTrk) return false;
        if (catalogFilter === 'untracked' && isTrk) return false;
        if (catalogFilter === 'in_stock' && !isStk) return false;
        if (catalogFilter === 'oos' && isStk) return false;

        if (catalogSearchQuery) {
          var q = catalogSearchQuery;
          var nm = (p.name || '').toLowerCase();
          var al = (p.alias || '').toLowerCase();
          if (!nm.includes(q) && !al.includes(q)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        var noMatchHtml = '<div class="p-8 col-span-full text-center text-slate-500 font-sans"><i class="fa-solid fa-filter-circle-xmark text-2xl text-slate-600 mb-2"></i><p class="text-xs">No products match the selected filter or search query.</p><button onclick="resetCatalogFilters()" class="mt-2 text-xs text-emerald-400 hover:underline">Reset Filters</button></div>';
        if (grid1) grid1.innerHTML = noMatchHtml;
        if (grid2) grid2.innerHTML = noMatchHtml;
        return;
      }

      var cardsHtml = filtered.map(function(p) {
        var inStock = p.available && p.inventoryQuantity > 0;
        var rule = getMatchingRule(p);
        var isTracked = Boolean(rule);
        var imgSafeUrl = p.imageUrl || '';
        var imgSafeName = (p.name || '').replace(/"/g, '&quot;');

        var imgHtml = p.imageUrl
          ? '<div class="relative w-16 h-16 min-w-[64px] rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden group cursor-pointer shrink-0 shadow" data-img="' + imgSafeUrl + '" data-name="' + imgSafeName + '" onclick="handleImageClick(this)">' +
              '<img src="' + p.imageUrl + '" alt="" class="w-full h-full object-contain rounded-lg transition duration-200 group-hover:scale-105" loading="lazy" onerror="handleImgError(this)" />' +
              '<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs rounded-lg"><i class="fa-solid fa-magnifying-glass-plus"></i></div>' +
            '</div>'
          : '<div class="w-16 h-16 min-w-[64px] rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center text-emerald-400 shrink-0 mx-auto"><i class="fa-solid fa-bottle-droplet text-xl"></i></div>';

        var borderClass = inStock ? 'border-emerald-500/30 shadow-sm' : 'border-slate-800';
        var stockBadge = inStock
          ? '<span class="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● In Stock (' + p.inventoryQuantity + ')</span>'
          : '<span class="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">○ Out of Stock</span>';

        var targetRemoveId = rule ? rule.id : (p.id || p.alias);
        var actionSection = isTracked
          ? '<div class="border-t border-slate-800/80 pt-2.5 flex items-center gap-2">' +
              '<span class="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1.5">' +
                '<i class="fa-solid fa-circle-check"></i> Tracked' +
              '</span>' +
              '<button data-id="' + targetRemoveId + '" onclick="untrackProduct(this)" class="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/25 text-rose-400 text-[11px] font-semibold transition flex items-center gap-1" title="Stop tracking this product">' +
                '<i class="fa-solid fa-trash-can"></i> Remove' +
              '</button>' +
              '<a href="' + (p.url || ('https://shop.amul.com/en/product/' + p.alias)) + '" target="_blank" class="p-1.5 text-slate-500 hover:text-slate-300 transition" title="Open Amul Store">' +
                '<i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>' +
              '</a>' +
            '</div>'
          : '<div class="border-t border-slate-800/80 pt-2.5 flex items-center gap-2">' +
              '<button data-id="' + (p.id || p.alias) + '" onclick="trackCatalogProduct(this)" class="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition flex items-center justify-center gap-1.5 shadow-sm">' +
                '<i class="fa-solid fa-plus"></i> Track Product' +
              '</button>' +
              '<a href="' + (p.url || ('https://shop.amul.com/en/product/' + p.alias)) + '" target="_blank" class="p-1.5 text-slate-500 hover:text-slate-300 transition" title="Open Amul Store">' +
                '<i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>' +
              '</a>' +
            '</div>';

        return '<div class="glass p-4 rounded-2xl border ' + borderClass + ' flex flex-col justify-between space-y-3 hover:border-slate-700 transition">' +
          '<div>' +
            '<div class="flex items-center justify-between gap-2 mb-2.5">' +
              stockBadge +
              '<span class="text-xs font-bold text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">₹' + p.price + '</span>' +
            '</div>' +
            '<div class="flex items-start gap-3">' +
              imgHtml +
              '<div class="min-w-0 flex-1">' +
                '<h4 class="font-semibold text-xs text-white line-clamp-2 leading-snug" title="' + imgSafeName + '">' + p.name + '</h4>' +
                (p.alias ? '<p class="text-[10px] text-slate-400 font-mono truncate mt-1">' + p.alias + '</p>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
          actionSection +
        '</div>';
      }).join('');

      if (grid1) grid1.innerHTML = cardsHtml;
      if (grid2) grid2.innerHTML = cardsHtml;
    }

    // Direct Catalog Product Tracking
    async function trackCatalogProduct(target) {
      var btn = (typeof target === 'object' && target !== null && target.getAttribute) ? target : null;
      var productId = btn ? btn.getAttribute('data-id') : (typeof target === 'string' ? target : '');
      if (!productId) return;
      var p = cachedCatalog.find(function(x) { return x.id === productId || x.alias === productId; });
      if (!p) return;

      var origHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';
      }

      try {
        var res = await fetch('/api/products/track', {
          method: 'POST',
          headers: Object.assign({}, getAuthHeader(), { 'content-type': 'application/json' }),
          body: JSON.stringify({
            productId: p.id,
            name: p.name,
            alias: p.alias,
            imageUrl: p.imageUrl,
            price: p.price,
            available: p.available,
            inventoryQuantity: p.inventoryQuantity
          })
        });
        var data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to track product');
        appConfig.rules = data.rules;
        populateSettings();
        renderCatalogExplorer(cachedCatalog);
        renderRulesTable();
        showAlert('success', 'Now tracking: ' + p.name);
        await loadDashboardData();
      } catch (err) {
        showAlert('error', 'Failed to track product: ' + err.message);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origHtml;
        }
      }
    }

    // Direct Product Untracking
    async function untrackProduct(target) {
      var btn = (typeof target === 'object' && target !== null && target.getAttribute) ? target : null;
      var targetId = btn ? btn.getAttribute('data-id') : (typeof target === 'string' ? target : '');
      if (!targetId) return;

      var origHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Removing...';
      }

      try {
        var res = await fetch('/api/products/untrack', {
          method: 'POST',
          headers: Object.assign({}, getAuthHeader(), { 'content-type': 'application/json' }),
          body: JSON.stringify({ productId: targetId })
        });
        var data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to untrack product');
        appConfig.rules = data.rules;
        populateSettings();
        renderCatalogExplorer(cachedCatalog);
        renderRulesTable();
        showAlert('success', 'Product removed from tracking.');
        await loadDashboardData();
      } catch (err) {
        showAlert('error', 'Failed to untrack product: ' + err.message);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origHtml;
        }
      }
    }

    // Track by Amul URL or Slug
    async function trackByAmulUrl() {
      var input = document.getElementById('inputAmulUrl');
      var val = (input.value || '').trim();
      if (!val) return showAlert('error', 'Please enter an Amul product URL or slug.');

      var slug = val;
      if (slug.includes('://')) {
        try {
          var parsed = new URL(slug);
          var parts = parsed.pathname.split('/').filter(Boolean);
          slug = parts[parts.length - 1] || slug;
        } catch (e) {}
      }
      if (slug.startsWith('product/')) {
        slug = slug.substring(8);
      }
      slug = slug.split('?')[0].split('#')[0];
      while (slug.startsWith('/')) slug = slug.substring(1);
      while (slug.endsWith('/')) slug = slug.substring(0, slug.length - 1);

      var matchInCatalog = cachedCatalog.find(function(p) {
        return (p.alias && p.alias.toLowerCase() === slug.toLowerCase()) ||
               (p.name && p.name.toLowerCase().includes(slug.toLowerCase()));
      });

      var payload = {
        alias: slug,
        name: matchInCatalog ? matchInCatalog.name : slug.replace(/-/g, ' ').replace(/\b\w/g, function(l){ return l.toUpperCase(); }),
        productId: matchInCatalog ? matchInCatalog.id : undefined,
        imageUrl: matchInCatalog ? matchInCatalog.imageUrl : undefined,
        price: matchInCatalog ? matchInCatalog.price : undefined,
        available: matchInCatalog ? matchInCatalog.available : undefined,
        inventoryQuantity: matchInCatalog ? matchInCatalog.inventoryQuantity : undefined
      };

      var btn = document.getElementById('btnTrackByUrl');
      btn.disabled = true;
      try {
        var res = await fetch('/api/products/track', {
          method: 'POST',
          headers: Object.assign({}, getAuthHeader(), { 'content-type': 'application/json' }),
          body: JSON.stringify(payload)
        });
        var data = await res.json();
        if (!data.success) throw new Error(data.error);
        appConfig.rules = data.rules;
        populateSettings();
        renderCatalogExplorer(cachedCatalog);
        renderRulesTable();
        input.value = '';
        showAlert('success', 'Successfully added tracking for: ' + payload.name);
        await loadDashboardData();
      } catch (err) {
        showAlert('error', 'Failed to track URL: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    }

    // Save Daily Summary Settings
    async function saveSummarySettings(e) {
      e.preventDefault();
      try {
        var payload = {
          enabled: document.getElementById('summaryEnabled').checked,
          timeIst: document.getElementById('summaryTimeIst').value.trim() || '09:00'
        };
        var res = await fetch('/api/config/summary', {
          method: 'POST',
          headers: Object.assign({}, getAuthHeader(), { 'content-type': 'application/json' }),
          body: JSON.stringify(payload)
        });
        var data = await res.json();
        if (!data.success) throw new Error(data.error);
        appConfig.summary = data.summary;
        populateSettings();
        showAlert('success', 'Daily Summary settings saved successfully!');
      } catch (err) {
        showAlert('error', 'Failed to save summary settings: ' + err.message);
      }
    }

    // Test Daily Summary Alert
    async function testDailySummary() {
      var btn = document.getElementById('btnTestSummary');
      var origText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatching test summary...';
      try {
        var res = await fetch('/api/summary/test', {
          method: 'POST',
          headers: getAuthHeader()
        });
        var data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to dispatch summary');
        var countInStock = data.inStockCount || 0;
        var countOos = data.oosCount || 0;
        showAlert('success', '✅ Daily Summary test delivered! (' + countInStock + ' in stock, ' + countOos + ' out of stock)');
      } catch (err) {
        showAlert('error', '❌ Daily Summary test failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }

    // Lightbox Controls
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

    function handleImageClick(el) {
      var url = el.getAttribute('data-img');
      var name = el.getAttribute('data-name');
      openLightbox(url, name);
    }

    function handleImgError(el) {
      el.onerror = null;
      if (el.parentElement) {
        el.parentElement.innerHTML = '<i class="fa-solid fa-bottle-droplet text-emerald-400 text-sm"></i>';
      }
    }

    // Trigger Manual Scan
    async function triggerScan() {
      const btn = document.getElementById('btnScanNow');
      const icon = document.getElementById('btnScanIcon');
      btn.disabled = true;
      icon.classList.add('fa-spin');

      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Scan failed');

        let msg = 'Scan completed! Checked ' + data.totalFound + ' products. ' + data.matchedCount + ' tracked items (' + data.inStockCount + ' in stock).';
        if (data.alertsSent && data.alertsSent.length > 0) {
          msg += '<br><b>Alerts sent:</b> ' + data.alertsSent.join(', ');
        }
        showAlert('success', msg);
        await loadDashboardData();
      } catch (err) {
        showAlert('error', 'Manual scan failed: ' + err.message);
      } finally {
        btn.disabled = false;
        icon.classList.remove('fa-spin');
      }
    }

    // Save Telegram Settings
    async function saveTelegramSettings(e) {
      e.preventDefault();
      try {
        const payload = {
          botToken: document.getElementById('tgBotToken').value.trim(),
          chatId: document.getElementById('tgChatId').value.trim(),
          notifyOnRestock: document.getElementById('tgNotifyRestock').checked,
          notifyOnOutOfStock: document.getElementById('tgNotifyOOS').checked,
          cooldownHours: parseInt(document.getElementById('tgCooldownHours').value, 10) || 4
        };

        const res = await fetch('/api/config/telegram', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        appConfig.telegram = payload;
        populateSettings();
        showAlert('success', 'Telegram settings saved successfully!');
      } catch (err) {
        showAlert('error', 'Failed to save Telegram settings: ' + err.message);
      }
    }

    // Test Telegram Alert
    async function testTelegramAlert() {
      const btn = document.getElementById('btnTestTg');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending test...';

      try {
        const res = await fetch('/api/test-telegram', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify({
            botToken: document.getElementById('tgBotToken').value.trim(),
            chatId: document.getElementById('tgChatId').value.trim()
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        showAlert('success', '✅ Test message sent successfully to your Telegram chat!');
      } catch (err) {
        showAlert('error', '❌ Telegram test failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    // Save ntfy Settings
    async function saveNtfySettings(e) {
      e.preventDefault();
      try {
        const payload = {
          serverUrl: document.getElementById('ntfyServerUrl').value.trim(),
          topic: document.getElementById('ntfyTopic').value.trim(),
          token: document.getElementById('ntfyToken').value.trim(),
          enabled: document.getElementById('ntfyEnabled').checked,
          notifyOnRestock: document.getElementById('ntfyNotifyRestock').checked,
          notifyOnOutOfStock: document.getElementById('ntfyNotifyOOS').checked
        };

        const res = await fetch('/api/config/ntfy', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        appConfig.ntfy = data.ntfy;
        populateSettings();
        showAlert('success', 'ntfy push notification settings saved successfully!');
      } catch (err) {
        showAlert('error', 'Failed to save ntfy settings: ' + err.message);
      }
    }

    // Test ntfy Alert
    async function testNtfyAlert() {
      const btn = document.getElementById('btnTestNtfy');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending ping...';

      try {
        const res = await fetch('/api/test-ntfy', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify({
            serverUrl: document.getElementById('ntfyServerUrl').value.trim(),
            topic: document.getElementById('ntfyTopic').value.trim(),
            token: document.getElementById('ntfyToken').value.trim()
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        showAlert('success', '✅ Test push notification published to ntfy! Check your device or web feed.');
      } catch (err) {
        showAlert('error', '❌ ntfy test failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    // Save Apprise Settings
    async function saveAppriseSettings(e) {
      e.preventDefault();
      try {
        const payload = {
          serverUrl: document.getElementById('appriseServerUrl').value.trim(),
          urls: document.getElementById('appriseUrls').value.trim(),
          configKey: document.getElementById('appriseConfigKey').value.trim(),
          enabled: document.getElementById('appriseEnabled').checked,
          notifyOnRestock: document.getElementById('appriseNotifyRestock').checked,
          notifyOnOutOfStock: document.getElementById('appriseNotifyOOS').checked
        };

        const res = await fetch('/api/config/apprise', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        appConfig.apprise = data.apprise;
        populateSettings();
        showAlert('success', 'Apprise settings saved successfully!');
      } catch (err) {
        showAlert('error', 'Failed to save Apprise settings: ' + err.message);
      }
    }

    // Test Apprise Alert
    async function testAppriseAlert() {
      const btn = document.getElementById('btnTestApprise');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatching...';

      try {
        const res = await fetch('/api/test-apprise', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify({
            serverUrl: document.getElementById('appriseServerUrl').value.trim(),
            urls: document.getElementById('appriseUrls').value.trim(),
            configKey: document.getElementById('appriseConfigKey').value.trim()
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        showAlert('success', '✅ Test notification sent through Apprise successfully!');
      } catch (err) {
        showAlert('error', '❌ Apprise test failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    // Save Amul Settings
    async function saveAmulSettings(e) {
      e.preventDefault();
      try {
        const payload = {
          substoreId: document.getElementById('amulSubstoreId').value.trim(),
          category: document.getElementById('amulCategory').value.trim(),
          cookies: document.getElementById('amulCookies').value.trim(),
          isScanningActive: document.getElementById('scannerActiveToggle').checked
        };

        const res = await fetch('/api/config/amul', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        appConfig.amul.substoreId = payload.substoreId;
        appConfig.amul.category = payload.category;
        appConfig.amul.cookies = payload.cookies;
        appConfig.isScanningActive = payload.isScanningActive;
        populateSettings();
        showAlert('success', 'Amul store settings updated successfully!');
      } catch (err) {
        showAlert('error', 'Failed to save Amul settings: ' + err.message);
      }
    }

    // Test Amul Connection
    async function testAmulConnection() {
      const btn = document.getElementById('btnTestAmul');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

      try {
        const res = await fetch('/api/test-amul', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify({
            substoreId: document.getElementById('amulSubstoreId').value.trim(),
            category: document.getElementById('amulCategory').value.trim(),
            cookies: document.getElementById('amulCookies').value.trim()
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        showAlert('success', '✅ Successfully connected to Amul API! Found ' + data.totalFound + ' products in "' + data.category + '" category.');
      } catch (err) {
        showAlert('error', '❌ Amul API connection failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    // Rule Management
    function openAddRuleModal() {
      document.getElementById('modalAddRule').classList.remove('hidden');
    }
    function closeAddRuleModal() {
      document.getElementById('modalAddRule').classList.add('hidden');
    }

    async function submitNewRule(e) {
      e.preventDefault();
      const name = document.getElementById('newRuleName').value.trim();
      const keyword = document.getElementById('newRuleKeyword').value.trim();
      if (!name || !keyword) return;

      try {
        const res = await fetch('/api/rules', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify({ name, keyword })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        appConfig.rules = data.rules;
        populateSettings();
        renderCatalogExplorer(cachedCatalog);
        renderRulesTable();
        closeAddRuleModal();
        showAlert('success', 'Added tracking rule for: ' + name);
        await loadDashboardData();
      } catch (err) {
        showAlert('error', 'Failed to add rule: ' + err.message);
      }
    }

    function quickAddRule(productName) {
      const keyword = productName.replace(/Amul High Protein|Amul Kool|Pack of.*|[0-9]+[ ]*(mL|g)/gi, '').trim();
      document.getElementById('newRuleName').value = productName.substring(0, 30);
      document.getElementById('newRuleKeyword').value = keyword || productName;
      openAddRuleModal();
    }

    async function toggleRule(target) {
      var ruleId = (typeof target === 'object' && target !== null && target.getAttribute)
        ? target.getAttribute('data-id')
        : target;
      if (!ruleId) return;
      try {
        const res = await fetch('/api/rules/' + ruleId + '/toggle', {
          method: 'POST',
          headers: getAuthHeader()
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        appConfig.rules = data.rules;
        populateSettings();
        renderCatalogExplorer(cachedCatalog);
        renderRulesTable();
        await loadDashboardData();
      } catch (err) {
        showAlert('error', 'Failed to toggle rule: ' + err.message);
      }
    }

    async function deleteRule(target) {
      var ruleId = (typeof target === 'object' && target !== null && target.getAttribute)
        ? target.getAttribute('data-id')
        : target;
      if (!ruleId) return;
      if (!confirm('Are you sure you want to stop tracking this product?')) return;
      try {
        const res = await fetch('/api/rules/' + ruleId, {
          method: 'DELETE',
          headers: getAuthHeader()
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        appConfig.rules = data.rules;
        populateSettings();
        renderCatalogExplorer(cachedCatalog);
        renderRulesTable();
        showAlert('success', 'Tracking rule deleted.');
        await loadDashboardData();
      } catch (err) {
        showAlert('error', 'Failed to delete rule: ' + err.message);
      }
    }

    // Activity Logs
    async function loadLogs() {
      const tbody = document.getElementById('logsTableBody');
      try {
        const res = await fetch('/api/logs', { headers: getAuthHeader() });
        const logs = await res.json();

        if (!logs || logs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-500 font-sans">No scan logs recorded yet. Run a scan to see logs.</td></tr>';
          return;
        }

        tbody.innerHTML = logs.map(function(log) {
          const d = new Date(log.timestamp);
          const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ', ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          const isSuccess = log.status === 'success';
          const alertsCount = log.alertsSent ? log.alertsSent.length : 0;

          return '<tr class="hover:bg-slate-900/50">' +
            '<td class="px-4 py-3 whitespace-nowrap text-slate-300 font-sans">' + timeStr + '</td>' +
            '<td class="px-4 py-3 uppercase text-[10px]">' + log.trigger + '</td>' +
            '<td class="px-4 py-3 text-slate-400">' + log.totalFound + '</td>' +
            '<td class="px-4 py-3 text-slate-300">' + log.matchedCount + '</td>' +
            '<td class="px-4 py-3 font-semibold ' + (log.inStockCount > 0 ? 'text-emerald-400' : 'text-slate-500') + '">' + log.inStockCount + '</td>' +
            '<td class="px-4 py-3 text-sky-400 font-sans">' + (alertsCount > 0 ? alertsCount + ' sent' : 'None') + '</td>' +
            '<td class="px-4 py-3 font-sans">' +
              '<span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + (isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400') + '">' +
                log.status +
              '</span>' +
            '</td>' +
          '</tr>';
        }).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-rose-400 font-sans">Failed to load logs: ' + err.message + '</td></tr>';
      }
    }

    // Password & Auth Modal
    function openAuthModal() {
      document.getElementById('inputAdminPassword').value = localStorage.getItem('amul_admin_pass') || '';
      document.getElementById('modalAuth').classList.remove('hidden');
    }
    function closeAuthModal() {
      document.getElementById('modalAuth').classList.add('hidden');
    }
    function saveAdminAuthToken() {
      const p = document.getElementById('inputAdminPassword').value.trim();
      localStorage.setItem('amul_admin_pass', p);
      closeAuthModal();
      showAlert('success', 'Admin session password saved in browser.');
      init();
    }

    // Update Cloudflare Worker KV password
    async function updateServerPassword() {
      const newPass = document.getElementById('inputChangePassword').value.trim();
      if (!newPass || newPass.length < 4) {
        return showAlert('error', 'Please enter a password with at least 4 characters.');
      }
      try {
        const res = await fetch('/api/config/password', {
          method: 'POST',
          headers: { ...getAuthHeader(), 'content-type': 'application/json' },
          body: JSON.stringify({ password: newPass })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        localStorage.setItem('amul_admin_pass', newPass);
        document.getElementById('inputAdminPassword').value = newPass;
        document.getElementById('inputChangePassword').value = '';
        closeAuthModal();
        showAlert('success', 'Admin password updated successfully in Cloudflare Worker KV!');
      } catch (err) {
        showAlert('error', 'Failed to update password: ' + err.message);
      }
    }

    function togglePasswordVisibility(id) {
      const el = document.getElementById(id);
      el.type = el.type === 'password' ? 'text' : 'password';
    }

    // Startup
    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
`;
}
