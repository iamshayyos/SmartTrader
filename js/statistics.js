document.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    alert("יש להתחבר קודם.");
    window.location.href = "index.html";
    return;
  }

  const key = `portfolio_${user}`;
  const portfolio = JSON.parse(localStorage.getItem(key) || "[]");

  const counts = { "קנייה": 0, "מכירה": 0, "החזק": 0 };

  portfolio.forEach(entry => {
    if (counts[entry.action] !== undefined) {
      counts[entry.action]++;
    }
  });

  const ctx = document.getElementById("recommendationChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["קנייה", "מכירה", "החזק"],
      datasets: [{
        data: [counts["קנייה"], counts["מכירה"], counts["החזק"]],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
});
