document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("result").classList.add("hidden");
  document.getElementById("analyzeBtn").addEventListener("click", analyzeAsset);
  document.getElementById("executeBtn").addEventListener("click", executeAction);
});

async function analyzeAsset() {
  const asset = document.getElementById("assetSelect").value;
  const user  = localStorage.getItem("currentUser");

  let tw = JSON.parse(localStorage.getItem(`twitter_${user}`)  || "[]");
  let tg = JSON.parse(localStorage.getItem(`telegram_${user}`) || "[]");
  if (!tw.length) tw = ["elonmusk"];
  if (!tg.length) tg = ["WatcherGuru"];

  const recEl   = document.getElementById("recommendation");
  const guideEl = document.getElementById("reason");
  const div     = document.getElementById("result");
  recEl.textContent   = "טוען המלצה...";
  guideEl.textContent = "טוען הנחיה...";
  div.classList.remove("hidden");

  // קריאה מקבילית ל-News endpoints
  const [twResp, tgResp] = await Promise.all([
    fetch(`http://127.0.0.1:5000/news/twitter?usernames=${tw.join(",")}`),
    fetch(`http://127.0.0.1:5000/news/telegram?channels=${tg.join(",")}`)
  ]);
  const tweets = twResp.ok ? await twResp.json() : [];
  const msgs   = tgResp.ok ? await tgResp.json() : [];

  // מאחדים ל־allNews
  const allNews = [
    ...tweets.map(n => `${n.source}: ${n.text}`),
    ...msgs  .map(m => `${m.source}: ${m.text}`)
  ];

  // קריאה לפעולת הניתוח
  const res = await fetch("http://127.0.0.1:5000/action_or_free", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asset, news: allNews })
  });
  const data = await res.json();

  // הוצאת שדות עם ברירת מחדל
  const action   = data.action   || "—";
  const guidance = data.guidance || "";

  recEl.textContent   = `המלצה: ${action}`;
  guideEl.textContent = guidance;
  div.dataset.asset          = asset;
  div.dataset.recommendation = action;
}

function executeAction() {
  const user = localStorage.getItem("currentUser");
  const div  = document.getElementById("result");
  const asset = div.dataset.asset;
  const recommendation = div.dataset.recommendation;
  const key  = `portfolio_${user}`;
  const pf   = JSON.parse(localStorage.getItem(key) || "[]");
  pf.push({ asset, action: recommendation, timestamp: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(pf));
  alert("הפעולה נשמרה בתיק.");
}
