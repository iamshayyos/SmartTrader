function getCustomSources(user) {
  const key = `custom_sources_${user}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function getAllSources(user) {
  const defaultSources = [
    "https://www.ynet.co.il",
    "https://www.calcalist.co.il",
    "https://www.bizportal.co.il",
    "https://twitter.com/bloomberg",
    "https://t.me/YnetNews"
  ];
  const customSources = getCustomSources(user);
  return [...defaultSources, ...customSources];
}

document.getElementById("analyzeBtn").addEventListener("click", function () {
  const asset = document.getElementById("assetSelect").value;
  const resultDiv = document.getElementById("result");
  const recommendationText = document.getElementById("recommendation");
  const reasonText = document.getElementById("reason");

  const user = localStorage.getItem("currentUser");
  const allSources = getAllSources(user);

  // סימולציה של בחירת מקור אקראי ומסקנה דמיונית
  const sampleSource = allSources[Math.floor(Math.random() * allSources.length)];
  const options = ["קנייה", "החזק", "מכירה"];
  const rec = options[Math.floor(Math.random() * options.length)];
  const reasons = {
    "קנייה": `זוהתה מגמת עלייה ב-${sampleSource}`,
    "החזק": `לא נמצאה המלצה ברורה ב-${sampleSource}`,
    "מכירה": `מגמת ירידה נצפתה ב-${sampleSource}`
  };

  recommendationText.textContent = `המלצה: ${rec}`;
  reasonText.textContent = reasons[rec];
  resultDiv.classList.remove("hidden");

  resultDiv.dataset.asset = asset;
  resultDiv.dataset.recommendation = rec;
});

document.getElementById("executeBtn").addEventListener("click", function () {
  const user = localStorage.getItem("currentUser");
  const asset = document.getElementById("result").dataset.asset;
  const recommendation = document.getElementById("result").dataset.recommendation;

  const key = `portfolio_${user}`;
  const portfolio = JSON.parse(localStorage.getItem(key) || "[]");

  portfolio.push({
    asset,
    action: recommendation,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem(key, JSON.stringify(portfolio));
  alert("הפעולה נשמרה בתיק.");
});
