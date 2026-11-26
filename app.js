// Общая логика сайта. Данные хранятся в localStorage браузера.
const EMOJIS = ["😀", "😎", "🤓", "🦊", "🐱", "🐼", "🚀", "🎧", "⚽", "📚", "🎮", "🌟"];
const COLORS = ["#1f4fd8", "#d6336c", "#2f9e44", "#f08c00", "#7048e8", "#0c8599", "#495057"];

const POSTS = [
  { id: 1, title: "Расписание на неделю", text: "Расписание звонков и пар обновлено. Проверьте свою группу." },
  { id: 2, title: "День открытых дверей", text: "В пятницу в 15:00 в актовом зале. Приходите с друзьями!" },
  { id: 3, title: "Хакатон колледжа", text: "Соберите команду из 3–4 человек и сделайте сайт за 24 часа." },
  { id: 4, title: "Библиотека", text: "Новые учебники по программированию уже в читальном зале." }
];

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
};

const getUsers = () => store.get("users", {});
const saveUsers = (u) => store.set("users", u);
const currentName = () => store.get("session", null);
const currentUser = () => { const n = currentName(); return n ? { name: n, ...getUsers()[n] } : null; };

// Защита страниц: без входа отправляем на index.html
function requireLogin() {
  const u = currentUser();
  if (!u || !u.pass) { location.href = "index.html"; return null; }
  return u;
}

function logout() { store.set("session", null); location.href = "index.html"; }

function avatarHTML(user, big) {
  const u = user || {};
  return `<span class="ava ${big ? "big" : ""}" style="background:${u.color || "#999"}">${u.emoji || "🙂"}</span>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Верхняя панель с навигацией
function renderBar(active) {
  const u = currentUser();
  document.getElementById("bar").innerHTML = `
    <div class="wrap">
      <b>🎓 Наш колледж</b>
      <a href="feed.html" class="${active === "feed" ? "on" : ""}">Лента</a>
      <a href="comments.html" class="${active === "comments" ? "on" : ""}">Комментарии</a>
      ${avatarHTML(u)}
      <a href="#" onclick="logout();return false">Выйти</a>
    </div>`;
}

// Лайки: { postId: [имена] }
const getLikes = () => store.get("likes", {});
function toggleLike(postId, name) {
  const likes = getLikes();
  const list = likes[postId] || [];
  likes[postId] = list.includes(name) ? list.filter(n => n !== name) : [...list, name];
  store.set("likes", likes);
}

// Комментарии: [{id, postId, user, text, time}]
const getComments = () => store.get("comments", []);
const saveComments = (c) => store.set("comments", c);
