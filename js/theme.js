/* --------  Dark / Light helper (v2)  -------- */
(function () {
  const Theme = {
    isDark: false,
    init() {
      /* קרא מ-localStorage (ישן - dark, חדש - theme) */
      const stored = localStorage.getItem('theme')
                 ?? (localStorage.getItem('dark') === 'true' ? 'dark' : 'light');
      this.isDark = stored === 'dark';
      this.apply();
    },
    toggle() {
      this.isDark = !this.isDark;
      this.apply();
    },
    apply() {
      /* הוסף/הסר class="dark" על <html> */
      document.documentElement.classList.toggle('dark', this.isDark);
      /* סנכרון לשני המפתחות בשביל Alpine הישן + דפים חדשים */
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      localStorage.setItem('dark',  this.isDark);           // Alpine צופה בזה
      /* עדכן Alpine אם נטען */
      if (document.documentElement.__x) {
        try { document.documentElement.__x.$data.dark = this.isDark; } catch {}
      }
      /* אייקונים בכפתור (אם קיימים) */
      const li = document.getElementById('light-icon');
      const di = document.getElementById('dark-icon');
      if (li && di) {
        li.classList.toggle('hidden',  this.isDark);
        di.classList.toggle('hidden', !this.isDark);
      }
    }
  };

  window.Theme = Theme;
  document.addEventListener('DOMContentLoaded', () => Theme.init());
})();
