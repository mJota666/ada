const chapters = [
  [1, "Cải thiện chăm sóc và thúc đẩy sức khỏe quần thể", true],
  [2, "Chẩn đoán và phân loại đái tháo đường", true],
  [3, "Dự phòng hoặc trì hoãn đái tháo đường và các bệnh đồng mắc liên quan", true],
  [4, "Đánh giá y khoa toàn diện và đánh giá bệnh đồng mắc", true],
  [5, "Thúc đẩy hành vi sức khỏe tích cực và sức khỏe toàn diện", true],
  [6, "Mục tiêu đường huyết, hạ đường huyết và các cơn tăng đường huyết cấp", true],
  [7, "Công nghệ đái tháo đường", true],
  [8, "Béo phì và quản lý cân nặng trong phòng ngừa và điều trị đái tháo đường", true],
  [9, "Các phương pháp điều trị bằng thuốc đối với đường huyết", true],
  [10, "Bệnh tim mạch và quản lý nguy cơ", true],
  [11, "Bệnh thận mạn và quản lý nguy cơ", true],
  [12, "Bệnh võng mạc, bệnh thần kinh và chăm sóc bàn chân", true],
  [13, "Người cao tuổi", true],
  [14, "Trẻ em và thanh thiếu niên", true],
  [15, "Quản lý đái tháo đường trong thai kỳ", true],
  [16, "Chăm sóc đái tháo đường trong bệnh viện", true],
  [17, "Vận động chính sách về đái tháo đường", true]
];

const doc = document.getElementById("document");
const list = document.getElementById("chapterList");
const search = document.getElementById("searchInput");
const searchStatus = document.getElementById("searchStatus");
const menu = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");
let currentMarkdown = "";
const chapterTextCache = {};
let currentChapter = 0;
let highlightToolbar;
function highlightKey() { return `ada-highlights-chapter-${currentChapter}`; }
function saveHighlights() { if (currentChapter) localStorage.setItem(highlightKey(), doc.innerHTML); }
function restoreHighlights() { const saved = currentChapter ? localStorage.getItem(highlightKey()) : null; if (saved) { doc.innerHTML = saved; if (!document.getElementById("completeChapter")) doc.insertAdjacentHTML("afterbegin", chapterTools()); } }
function readingStateKey() { return `ada-reading-chapter-${currentChapter}`; }
function readingState() { try { return JSON.parse(localStorage.getItem(readingStateKey()) || '{"max":0,"complete":false}'); } catch { return {max:0, complete:false}; } }
function saveReadingState(state) { localStorage.setItem(readingStateKey(), JSON.stringify(state)); }
function chapterTools() { return `<div class="chapter-tools"><a class="home-link" href="#/" aria-label="Về trang chủ">⌂ <span>Trang chủ</span></a><label><input id="completeChapter" type="checkbox"> <span>Đã hoàn thành chương này</span></label><button id="markReadHere" type="button">Đánh dấu đọc đến đây</button><div class="progress-ring" id="chapterRing" aria-label="Tiến độ đọc"><span>0%</span></div></div>`; }
function updateReadingProgress() { if (!currentChapter) return; const state = readingState(); const value = state.complete ? 100 : (state.max || 0); const ring = document.getElementById("chapterRing"); if (ring) { ring.style.setProperty("--progress", `${value * 3.6}deg`); ring.querySelector("span").textContent = state.complete ? "✓" : `${value}%`; ring.title = state.complete ? "Đã hoàn thành" : `Đã đánh dấu ${value}%`; } const checkbox = document.getElementById("completeChapter"); if (checkbox) checkbox.checked = !!state.complete; updateChapterBadge(); }
function bindChapterTools() { const checkbox = document.getElementById("completeChapter"), marker = document.getElementById("markReadHere"); if (!checkbox || !marker) return; const state = readingState(); checkbox.checked = !!state.complete; checkbox.addEventListener("change", () => { const next = readingState(); next.complete = checkbox.checked; if (next.complete) next.max = 100; saveReadingState(next); updateReadingProgress(); }); marker.addEventListener("click", () => { const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight); const next = readingState(); next.max = Math.max(next.max || 0, Math.round(scrollY / maxScroll * 100)); saveReadingState(next); updateReadingProgress(); marker.textContent = "Đã lưu vị trí đọc"; setTimeout(() => marker.textContent = "Đánh dấu đọc đến đây", 1600); }); updateReadingProgress(); }
function hideHighlightToolbar() { if (highlightToolbar) highlightToolbar.hidden = true; }
function showHighlightToolbar() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.toString().trim() || !doc.contains(selection.anchorNode)) { hideHighlightToolbar(); return; }
  if (!highlightToolbar) {
    highlightToolbar = document.createElement("button"); highlightToolbar.className = "highlight-toolbar"; highlightToolbar.type = "button"; highlightToolbar.textContent = "Tô sáng";
    highlightToolbar.addEventListener("mousedown", event => event.preventDefault());
    highlightToolbar.addEventListener("click", () => { const range = window.getSelection()?.getRangeAt(0); if (!range || range.collapsed || !doc.contains(range.commonAncestorContainer)) return; const mark = document.createElement("mark"); mark.className = "user-highlight"; try { range.surroundContents(mark); } catch { mark.appendChild(range.extractContents()); range.insertNode(mark); } saveHighlights(); window.getSelection().removeAllRanges(); hideHighlightToolbar(); });
    document.body.appendChild(highlightToolbar);
  }
  const rect = selection.getRangeAt(0).getBoundingClientRect(); highlightToolbar.style.left = `${Math.max(8, rect.left + scrollX)}px`; highlightToolbar.style.top = `${Math.max(8, rect.top + scrollY - 42)}px`; highlightToolbar.hidden = false;
}
document.addEventListener("mouseup", () => setTimeout(showHighlightToolbar, 0)); document.addEventListener("mousedown", event => { if (!event.target.closest?.(".highlight-toolbar")) hideHighlightToolbar(); });

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  let html = "", paragraph = [], listType = null;
  const flushParagraph = () => { if (paragraph.length) { const value = paragraph.join(" "); html += `<p${/^\*\*\d+\.\d+/.test(value) ? ' class="recommendation"' : ""}>${inline(value)}</p>`; paragraph = []; } };
  const closeList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { flushParagraph(); closeList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); closeList();
      const level = heading[1].length, rawText = heading[2];
      const text = level === 1 ? rawText.replace(/^(\d+)\./, "Chương $1.") : rawText;
      const id = slugify(text) || `muc-${i}`;
      html += `<h${level} id="${id}">${inline(text)}</h${level}>`; continue;
    }
    if (line.startsWith("|")) {
      flushParagraph(); closeList(); const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++].trim());
      i--; const parsed = rows.map(row => row.slice(1,-1).split("|").map(c => c.trim())).filter(row => !row.every(c => /^:?-+:?$/.test(c)));
      if (parsed.length) {
        html += '<div class="table-wrap"><table><thead><tr>' + parsed[0].map(c => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>";
        html += parsed.slice(1).map(row => "<tr>" + row.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") + "</tbody></table></div>";
      } continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/), numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph(); const desired = bullet ? "ul" : "ol";
      if (listType !== desired) { closeList(); listType = desired; html += `<${desired}>`; }
      html += `<li>${inline((bullet || numbered)[1])}</li>`; continue;
    }
    if (line.startsWith(">")) { flushParagraph(); closeList(); html += `<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`; continue; }
    paragraph.push(line);
  }
  flushParagraph(); closeList(); return html;
}
function chapterPercent(n) { try { const state = JSON.parse(localStorage.getItem(`ada-reading-chapter-${n}`) || '{"max":0,"complete":false}'); return state.complete ? 100 : Math.max(0, Math.min(100, state.max || 0)); } catch { return 0; } }
function updateChapterBadge() { const badge = document.getElementById(`chapterProgress-${currentChapter}`); if (badge) { const value = chapterPercent(currentChapter); badge.style.setProperty("--chapter-progress", `${value * 3.6}deg`); badge.querySelector("span").textContent = value; } }
function renderNavigation(active) {
  list.innerHTML = chapters.map(([n,title,available]) => available
    ? `<li><a href="#/chapter/${n}?resume=1" class="${n===active?'active':''}"><span class="number">${String(n).padStart(2,"0")}</span><span>${title}</span><span class="chapter-progress" id="chapterProgress-${n}" style="--chapter-progress:${chapterPercent(n)*3.6}deg"><span>${chapterPercent(n)}</span></span></a></li>`
    : `<li><span class="unavailable" title="Chưa có bản dịch"><span class="number">${String(n).padStart(2,"0")}</span> ${title}</span></li>`).join("");
}
function renderOnPage() {
  const headings = [...doc.querySelectorAll("h2, h3")];
  document.getElementById("onPageNav").innerHTML = headings.map(h => `<a href="#${h.id}" style="padding-left:${h.tagName==='H3'?'1.25rem':'.7rem'}">${h.textContent}</a>`).join("");
}
function setPager(n) {
  const available = chapters.filter(c => c[2]).map(c => c[0]), idx = available.indexOf(n);
  const prev = document.getElementById("previousChapter"), next = document.getElementById("nextChapter");
  prev.textContent = idx > 0 ? `← Chương ${available[idx-1]}` : ""; prev.href = idx > 0 ? `#/chapter/${available[idx-1]}` : "#";
  next.textContent = idx < available.length-1 ? `Chương ${available[idx+1]} →` : ""; next.href = idx < available.length-1 ? `#/chapter/${available[idx+1]}` : "#";
}
async function loadRoute() {
  const match = location.hash.match(/^#\/chapter\/(\d+)/); const n = match ? Number(match[1]) : 0;
  currentChapter = n;
  if (n) localStorage.setItem("ada-last-chapter", String(n));
  renderNavigation(n); search.value = ""; searchStatus.textContent = ""; document.getElementById("globalResults")?.remove(); closeMenu();
  if (!n) {
    const count = chapters.filter(c => c[2]).length;
    const last = Number(localStorage.getItem("ada-last-chapter") || 0); const lastTitle = chapters.find(c => c[0] === last)?.[1]; doc.innerHTML = `<section class="landing"><p class="eyebrow">ADA 2026 · THƯ VIỆN LÂM SÀNG</p><h1>Tiêu chuẩn chăm sóc đái tháo đường<br><span>Phiên bản tiếng Việt chuyên ngành</span></h1><p class="landing-lead">Nền tảng tra cứu thực hành cho bác sĩ nội trú, bác sĩ chuyên khoa và nhân viên y tế. Nội dung được tổ chức theo chương để hỗ trợ đọc nhanh, học tập và thảo luận lâm sàng.</p>${lastTitle ? `<div class="current-location"><span>Đang đọc</span><strong>Chương ${last}: ${lastTitle}</strong><a href="#/chapter/${last}?resume=1">Tiếp tục đọc →</a></div>` : ""}<div class="landing-actions"><a class="primary-action" href="#/chapter/${last || 1}?resume=1">${last ? `Tiếp tục Chương ${last}` : "Bắt đầu đọc Chương 1"} <span>→</span></a><a class="secondary-action" href="#/chapter/3">Xem dự phòng đái tháo đường</a></div><div class="landing-disclaimer"><strong>Lưu ý sử dụng</strong><span>Bản dịch không chính thức, phục vụ học tập và tham khảo chuyên môn; không thay thế tài liệu gốc hoặc quyết định lâm sàng.</span></div></section>`;
    currentMarkdown = ""; renderOnPage(); setPager(0); return;
  }
  const chapter = chapters.find(c => c[0] === n);
  if (!chapter || !chapter[2]) { doc.innerHTML = '<div class="error">Chương này chưa có bản dịch để công bố.</div>'; return; }
  doc.innerHTML = '<div class="loading">Đang tải nội dung…</div>';
  try {
    const response = await fetch(`chapters/chapter-${String(n).padStart(2,"0")}.md`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    currentMarkdown = await response.text(); doc.innerHTML = chapterTools() + renderMarkdown(currentMarkdown); restoreHighlights(); bindChapterTools(); renderOnPage(); setPager(n); document.title = `Chương ${n} | ADA 2026 tiếng Việt`; window.scrollTo(0,0); const routeQuery = location.hash.match(/[?&]search=([^&]+)/); if (routeQuery) { search.value = decodeURIComponent(routeQuery[1]); setTimeout(() => highlightSearch(true), 80); } else if (location.hash.includes("resume=1")) { const state = readingState(); if (state.max) setTimeout(() => { const max = Math.max(1, document.documentElement.scrollHeight - innerHeight); window.scrollTo({top: max * state.max / 100, behavior: "smooth"}); }, 120); }
  } catch (error) { doc.innerHTML = `<div class="error"><strong>Không tải được Chương ${n}.</strong><p>${escapeHtml(error.message)}</p></div>`; }
}
function highlightSearch(shouldScroll = false) {
  const query = search.value.trim();
  doc.innerHTML = chapterTools() + renderMarkdown(currentMarkdown); bindChapterTools();
  if (!query) { searchStatus.textContent = ""; renderOnPage(); return; }
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT); const nodes = []; let node, count = 0;
  while ((node = walker.nextNode())) if (!['SCRIPT','STYLE'].includes(node.parentElement.tagName)) nodes.push(node);
  nodes.forEach(textNode => {
    const value = textNode.nodeValue, re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    if (!re.test(value)) return; re.lastIndex = 0; const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = re.exec(value))) { frag.append(value.slice(last,m.index)); const mark=document.createElement("mark"); mark.textContent=m[0]; frag.append(mark); last=m.index+m[0].length; count++; }
    frag.append(value.slice(last)); textNode.replaceWith(frag);
  });
  searchStatus.textContent = `${count} kết quả`; renderOnPage(); if (shouldScroll) doc.querySelector("mark")?.scrollIntoView({behavior:"smooth",block:"center"});
}
async function searchAllChapters(query) {
  const results = []; const available = chapters.filter(c => c[2]);
  await Promise.all(available.map(async ([n, title]) => { try { chapterTextCache[n] ||= await fetch(`chapters/chapter-${String(n).padStart(2,"0")}.md`).then(r => r.text()); } catch { return; } const lines = chapterTextCache[n].split(/\r?\n/); lines.forEach((line, i) => { if (line.toLowerCase().includes(query.toLowerCase()) && results.length < 60) results.push({n, title, line: line.replace(/[#*|`]/g, "").trim().slice(0, 180), i}); }); }));
  results.sort((a,b) => a.n-b.n || a.i-b.i); let box = document.getElementById("globalResults"); if (!box) { box = document.createElement("div"); box.id = "globalResults"; box.className = "global-results"; searchStatus.after(box); } box.innerHTML = results.length ? results.map(r => `<a href="#/chapter/${r.n}?search=${encodeURIComponent(query)}"><strong>Chương ${r.n}</strong><span>${escapeHtml(r.line)}</span></a>`).join("") : `<p>Không tìm thấy trong các chương đã công bố.</p>`; searchStatus.textContent = `${results.length}${results.length === 60 ? "+" : ""} kết quả trên toàn bộ chương`;
}
function closeMenu(){ sidebar.classList.remove("open"); backdrop.classList.remove("open"); menu.setAttribute("aria-expanded","false"); }
menu.addEventListener("click",()=>{ const open=sidebar.classList.toggle("open"); backdrop.classList.toggle("open",open); menu.setAttribute("aria-expanded",String(open)); });
backdrop.addEventListener("click",closeMenu);
search.addEventListener("input",()=>{ clearTimeout(search.timer); search.timer=setTimeout(()=>{ const q=search.value.trim(); if (q) { highlightSearch(); searchAllChapters(q); } else { const box=document.getElementById("globalResults"); if (box) box.remove(); highlightSearch(); } },250); });
document.getElementById("themeButton").addEventListener("click",()=>{ const next=document.documentElement.dataset.theme==="dark"?"light":"dark"; document.documentElement.dataset.theme=next; localStorage.setItem("theme",next); });
document.documentElement.dataset.theme = localStorage.getItem("theme") || "light";
window.addEventListener("scroll",()=>{ const max=document.documentElement.scrollHeight-innerHeight; document.getElementById("readingProgress").style.width=`${max>0?scrollY/max*100:0}%`; updateReadingProgress(); },{passive:true});
window.addEventListener("hashchange",()=>{ if (!location.hash || location.hash === "#/" || location.hash.startsWith("#/chapter/")) loadRoute(); }); loadRoute();




