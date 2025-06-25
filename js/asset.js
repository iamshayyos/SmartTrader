// js/asset.js

window.logout = () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
};

document.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("currentUser")) return;

  const FINNHUB_KEY = "d1c0as1r01qre5ait1agd1c0as1r01qre5ait1b0";
  const params      = new URLSearchParams(window.location.search);
  const symbol      = params.get("asset");
  if (!symbol) return location.href = "dashboard.html";

  // Elements
  const logoEl     = document.getElementById("assetLogo");
  const titleEl    = document.getElementById("assetTitle");
  const priceEl    = document.getElementById("assetPrice");
  const breadEl    = document.getElementById("breadcrumbSymbol");
  const analyzeBtn = document.getElementById("analyzeBtn");

  // Set title & breadcrumb
  titleEl.textContent = symbol;
  breadEl.textContent  = symbol;

  // Fetch logo
  async function fetchLogo() {
    try {
      let url;
      if (symbol.includes(":")) {
        const coin = symbol.split(":")[1].replace(/(USDT|USD|EUR|BTC|ETH)$/i, "");
        url = `https://cryptoicons.org/api/icon/${coin.toLowerCase()}/200`;
      } else {
        const res = await fetch(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`
        );
        url = (await res.json()).logo;
      }
      if (url) logoEl.src = url;
    } catch {}
  }

  // Fetch price
  async function fetchPrice() {
    try {
      const res  = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
      );
      const data = await res.json();
      priceEl.textContent = `$${Number(data.c).toFixed(2)}`;
    } catch {
      priceEl.textContent = "N/A";
    }
  }

  // Init TradingView with date-range selector
  function initTV() {
    const tvSymbol = symbol.includes(":") ? symbol : `NASDAQ:${symbol}`;
    new TradingView.widget({
      autosize:            true,
      symbol:              tvSymbol,
      interval:            "60",
      timezone:            "Etc/UTC",
      theme:               "light",
      style:               "1",
      toolbar_bg:          "#f1f3f6",
      withdateranges:      true,
      hide_side_toolbar:   false,
      allow_symbol_change: false,
      container_id:        "tv_chart_container"
    });
  }

  // Run initial
  await fetchLogo();
  await fetchPrice();
  initTV();
  setInterval(fetchPrice, 10000);

  // Analyze (your logic)
  analyzeBtn.addEventListener("click", () => {
    // analyzeAsset(symbol);
  });
});
