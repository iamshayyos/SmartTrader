// js/auth.js

function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  if (username && password) {
    localStorage.setItem("user_" + username, password);
    alert("Registered successfully! You can now login.");
    window.location.href = "index.html";
  } else {
    alert("Please enter both username and password.");
  }
}

function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const stored  = localStorage.getItem("user_" + username);
  if (stored === password) {
    localStorage.setItem("currentUser", username);
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid username or password.");
  }
}

window.logout = function() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
};
