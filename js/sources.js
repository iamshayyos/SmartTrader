const defaultSources = [
  "https://www.ynet.co.il",
  "https://www.calcalist.co.il",
  "https://www.bizportal.co.il",
  "https://twitter.com/bloomberg",
  "https://t.me/YnetNews"
];

function renderSources() {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const customKey = `custom_sources_${user}`;
  const customSources = JSON.parse(localStorage.getItem(customKey) || "[]");

  const defaultList = document.getElementById("defaultSources");
  const customList = document.getElementById("customSources");

  // מקורות ברירת מחדל
  defaultList.innerHTML = "";
  defaultSources.forEach(src => {
    const li = document.createElement("li");
    li.textContent = src;
    defaultList.appendChild(li);
  });

  // מקורות מותאמים אישית
  customList.innerHTML = "";
  customSources.forEach((src, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${src} <button onclick="removeSource(${index})" class="text-red-600 ml-2">[x]</button>`;
    customList.appendChild(li);
  });
}

function addSource() {
  const input = document.getElementById("newSourceInput");
  const url = input.value.trim();
  if (!url) return;

  const user = localStorage.getItem("currentUser");
  const key = `custom_sources_${user}`;
  const current = JSON.parse(localStorage.getItem(key) || "[]");

  current.push(url);
  localStorage.setItem(key, JSON.stringify(current));
  input.value = "";
  renderSources();
}

function removeSource(index) {
  const user = localStorage.getItem("currentUser");
  const key = `custom_sources_${user}`;
  const current = JSON.parse(localStorage.getItem(key) || "[]");

  current.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(current));
  renderSources();
}

document.addEventListener("DOMContentLoaded", renderSources);
