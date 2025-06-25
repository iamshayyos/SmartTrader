document.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    alert("עליך להתחבר תחילה.");
    window.location.href = "index.html";
    return;
  }

  const key = `portfolio_${user}`;
  const portfolio = JSON.parse(localStorage.getItem(key) || "[]");

  const table = document.getElementById("portfolioTable");

  if (portfolio.length === 0) {
    table.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-500">אין פעולות בתיק.</td></tr>`;
    return;
  }

  portfolio.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-2">${entry.asset}</td>
      <td class="border p-2">${entry.action}</td>
      <td class="border p-2">${new Date(entry.timestamp).toLocaleString("he-IL")}</td>
    `;
    table.appendChild(row);
  });
});
