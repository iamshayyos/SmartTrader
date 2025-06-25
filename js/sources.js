// frontend/js/sources.js

function getWatchedAssets() {
  try {
    return JSON.parse(localStorage.getItem("watchedAssets") || "[]");
  } catch { return []; }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function populateAssetOptions() {
  const sel = document.getElementById("newSourceTags");
  sel.innerHTML = "";
  getWatchedAssets()
    .sort((a,b) => a.localeCompare(b))
    .forEach(asset => {
      const opt = document.createElement("option");
      opt.value = asset;
      opt.textContent = asset;
      sel.appendChild(opt);
    });
}

function renderSources() {
  const user = localStorage.getItem("currentUser");
  if (!user) return logout();
  const key = `custom_sources_${user}`;
  const sources = JSON.parse(localStorage.getItem(key) || "[]");
  const tbody = document.getElementById("sourcesTable");
  tbody.innerHTML = "";

  if (sources.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="3" class="p-4 text-center text-gray-500">
        עדיין לא הוספת מקורות מתויגים.
      </td></tr>`;
    return;
  }

  sources.forEach((src, idx) => {
    tbody.innerHTML += `
      <tr>
        <td class="p-2 text-right break-all">${src.url}</td>
        <td class="p-2 text-right">${src.tagAssets.join(", ")}</td>
        <td class="p-2 text-center">
          <button onclick="removeSource(${idx})" class="text-red-600 hover:text-red-800">✕</button>
        </td>
      </tr>`;
  });
}

function addTaggedSource() {
  const urlInput = document.getElementById("newSourceUrl");
  const selTags = document.getElementById("newSourceTags");
  const url = urlInput.value.trim();
  const tags = Array.from(selTags.selectedOptions).map(o => o.value);

  if (!url) return alert("יש להזין כתובת מקור תקינה.");
  if (tags.length === 0) return alert("בחר לפחות נכס אחד לתג.");

  const user = localStorage.getItem("currentUser");
  const key = `custom_sources_${user}`;
  const sources = JSON.parse(localStorage.getItem(key) || "[]");

  if (sources.some(s => s.url === url)) return alert("המקור כבר קיים ברשימה.");

  let type = "generic";
  if (url.includes("twitter.com/")) type = "twitter";
  if (url.includes("t.me/")) type = "telegram";
  if (url.endsWith(".rss") || url.includes("/feed")) type = "rss";

  sources.push({ url, type, tagAssets: tags });
  localStorage.setItem(key, JSON.stringify(sources));

  urlInput.value = "";
  selTags.selectedIndex = -1;
  renderSources();
}

function removeSource(idx) {
  const user = localStorage.getItem("currentUser");
  const key = `custom_sources_${user}`;
  const sources = JSON.parse(localStorage.getItem(key) || "[]");
  sources.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(sources));
  renderSources();
}

document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("currentUser");
  if (!user) return logout();
  populateAssetOptions();
  renderSources();
});

// הוסף אירוע להאזנה לשינויים
window.addEventListener('storage', (event) => {
  if (event.key === 'watchedAssets') {
    populateAssetOptions();
  }
});
