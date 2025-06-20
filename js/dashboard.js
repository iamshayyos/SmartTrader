document.getElementById("analyzeBtn").addEventListener("click", function () {
  const asset = document.getElementById("assetSelect").value;
  const resultDiv = document.getElementById("result");
  const recommendationText = document.getElementById("recommendation");
  const reasonText = document.getElementById("reason");

  const options = ["קנייה", "החזק", "מכירה"];
  const rec = options[Math.floor(Math.random() * options.length)];
  const reasons = {
    "קנייה": "זוהתה מגמת עלייה חיובית על פי מקורות.",
    "החזק": "שוק ניטרלי – אין סיבה לפעול כרגע.",
    "מכירה": "זוהו סימנים של ירידה בשוק."
  };

  recommendationText.textContent = `המלצה: ${rec}`;
  reasonText.textContent = reasons[rec];
  resultDiv.classList.remove("hidden");

  // שומר לצורך ביצוע פעולה
  resultDiv.dataset.asset = asset;
  resultDiv.dataset.recommendation = rec;
});

// שמירה ל"תיק"
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
