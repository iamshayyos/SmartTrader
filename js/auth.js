function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  if (username && password) {
    localStorage.setItem("user_" + username, password);
    alert("נרשמת בהצלחה! אפשר להתחבר עכשיו.");
    window.location.href = "index.html";
  } else {
    alert("נא למלא שם משתמש וסיסמה.");
  }
}

function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const stored = localStorage.getItem("user_" + username);
  if (stored === password) {
    localStorage.setItem("currentUser", username);
    window.location.href = "dashboard.html";
  } else {
    alert("שם משתמש או סיסמה שגויים.");
  }
}
