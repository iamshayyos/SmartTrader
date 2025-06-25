const FINNHUB_KEY = "d1c0as1r01qre5ait1agd1c0as1r01qre5ait1b0";
const STORAGE_KEY = "watchedAssets";

window.logout = () => {
  localStorage.removeItem("currentUser");
  location.href = "index.html";
};

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("currentUser")) return;

  const input       = document.getElementById("addAssetInput");
  const suggestions = document.getElementById("suggestions");
  const container   = document.getElementById("assetCards");
  const execBtn     = document.getElementById("executeBtn");

  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    suggestions.innerHTML = "";
    if (!q) {
      suggestions.classList.add("hidden");
      return;
    }
    debounceTimer = setTimeout(async () => {
      try {
        const res  = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${FINNHUB_KEY}`);
        const data = await res.json();
        suggestions.innerHTML = "";
        (data.result || []).slice(0,8).forEach(r => {
          const li = document.createElement("li");
          li.textContent = `${r.symbol} — ${r.description}`;
          li.className = "px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
          li.onclick = () => addAsset(r.symbol);
          suggestions.appendChild(li);
        });
        suggestions.classList.remove("hidden");
      } catch {
        suggestions.classList.add("hidden");
      }
    }, 300);
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.add("hidden");
    }
  });

  // Initial load + live updates
  initWatchlist();
  setInterval(initWatchlist, 5000);  // רענון כל 5 שניות

  execBtn.addEventListener("click", executeAction);

  async function fetchLogo(symbol) {
    try {
      if (symbol.includes(':')) {
        const pair = symbol.split(':')[1];
        const coin = pair.replace(/(USDT|USD|EUR|BTC|ETH)$/i, '');
        return `https://cryptoicons.org/api/icon/${coin.toLowerCase()}/200`;
      } else {
        const res  = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`);
        return (await res.json()).logo;
      }
    } catch {
      return null;
    }
  }

  async function fetchPrice(symbol) {
    try {
      const res  = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
      const data = await res.json();
      const price = data.c;
      const open = data.o;
      const pct  = open ? ((price - open) / open * 100) : 0;
      return {
        price: price?.toFixed(2) ?? "--",
        percent: pct.toFixed(2)
      };
    } catch {
      return { price: "--", percent: "0" };
    }
  }

  async function fetchExtended(symbol) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}` +
        `?interval=1m&range=1d&includePrePost=true`
      );
      const js   = await res.json();
      const meta = js.chart.result?.[0]?.meta;
      return {
        pre:  meta?.preMarketPrice,
        post: meta?.postMarketPrice
      };
    } catch {
      return { pre: null, post: null };
    }
  }

  async function initWatchlist() {
    const watched = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    container.innerHTML = "";

    for (const symbol of watched) {
      const [quote, logo, ext] = await Promise.all([
        fetchPrice(symbol), fetchLogo(symbol), fetchExtended(symbol)
      ]);

      const percentColorClass = parseFloat(quote.percent) >= 0
        ? "text-green-500 dark:text-green-300"
        : "text-red-500 dark:text-red-300";

      const card = document.createElement("div");
      card.setAttribute('data-symbol', symbol);
      card.className = "glass p-8 rounded-3xl shadow-lg hover:shadow-2xl transition relative cursor-pointer";

      card.innerHTML = `
        <button onclick="removeAsset('${symbol}')"
                class="absolute top-3 right-3 text-red-500 hover:text-red-700 text-lg">✕</button>
        <div class="flex items-center mb-4">
          ${logo
            ? `<img src="${logo}" alt="${symbol} logo"
                     class="w-12 h-12 mr-3 object-contain rounded-full bg-white/50 p-1" />`
            : ``}
          <h3 class="font-semibold text-2xl">${symbol}</h3>
        </div>
        <p class="text-lg mb-1">$${quote.price}</p>
        <p class="text-sm mb-1 ${percentColorClass}">${quote.percent}%</p>
        ${ext.pre != null
          ? `<p class="text-sm text-gray-400 dark:text-gray-500">Pre-market: $${ext.pre.toFixed(2)}</p>`
          : ``}
        ${ext.post != null
          ? `<p class="text-sm text-gray-400 dark:text-gray-500">Post-market: $${ext.post.toFixed(2)}</p>`
          : ``}
        <p class="mt-2 text-base text-indigo-600 hover:underline">View Details</p>
      `;

      card.onclick = e => {
        if (e.target.tagName !== "BUTTON") {
          location.href = `asset.html?asset=${symbol}`;
        }
      };

      container.appendChild(card);
    }
  }

  window.removeAsset = symbol => {
    let watched = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    watched = watched.filter(s => s !== symbol);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
    initWatchlist();
  };

  function addAsset(symbol) {
    let watched = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!watched.includes(symbol)) {
      watched.push(symbol);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
      initWatchlist();
    }
    input.value = "";
    suggestions.classList.add("hidden");
  }

  function executeAction() {
    // … your existing logic …
  }
});
