const chapters = [
  [1, "Cải thiện chăm sóc và thúc đẩy sức khỏe quần thể", true],
  [2, "Chẩn đoán và phân loại đái tháo đường", true],
  [3, "Dự phòng hoặc trì hoãn đái tháo đường và bệnh đồng mắc", true],
  [4, "Đánh giá y khoa toàn diện và bệnh đồng mắc", true],
  [5, "Hành vi sức khỏe tích cực và sức khỏe tinh thần", true],
  [6, "Mục tiêu đường huyết, hạ đường huyết và cơn tăng đường huyết", true],
  [7, "Công nghệ đái tháo đường", true],
  [8, "Béo phì và quản lý cân nặng", true],
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
let currentChapter = 0;
let highlightToolbar;
function highlightKey() { return `ada-highlights-chapter-${currentChapter}`; }
function saveHighlights() { if (currentChapter) localStorage.setItem(highlightKey(), doc.innerHTML); }
function restoreHighlights() { const saved = currentChapter ? localStorage.getItem(highlightKey()) : null; if (saved) { doc.innerHTML = saved; if (!document.getElementById("completeChapter")) doc.insertAdjacentHTML("afterbegin", chapterTools()); } }
function readingStateKey() { return `ada-reading-chapter-${currentChapter}`; }
function readingState() { try { return JSON.parse(localStorage.getItem(readingStateKey()) || '{"max":0,"complete":false}'); } catch { return {max:0, complete:false}; } }
function saveReadingState(state) { localStorage.setItem(readingStateKey(), JSON.stringify(state)); }
function chapterTools() { return `<div class="chapter-tools"><label><input id="completeChapter" type="checkbox"> <span>Đã hoàn thành chương này</span></label><button id="markReadHere" type="button">Đánh dấu đọc đến đây</button><div class="progress-ring" id="chapterRing" aria-label="Tiến độ đọc"><span>0%</span></div></div>`; }
function updateReadingProgress() { if (!currentChapter) return; const state = readingState(); const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight); const current = Math.min(100, Math.round(scrollY / maxScroll * 100)); if (current > (state.max || 0) && !state.complete) { state.max = current; saveReadingState(state); } const value = state.complete ? 100 : Math.max(state.max || 0, current); const ring = document.getElementById("chapterRing"); if (ring) { ring.style.setProperty("--progress", `${value * 3.6}deg`); ring.querySelector("span").textContent = state.complete ? "✓" : `${value}%`; ring.title = state.complete ? "Đã hoàn thành" : `Đã đọc ${value}%`; } const checkbox = document.getElementById("completeChapter"); if (checkbox) checkbox.checked = !!state.complete; updateChapterBadge(); }
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
function updateChapterBadge() { const badge = document.getElementById(`chapterProgress-${currentChapter}`); if (badge) badge.textContent = `${chapterPercent(currentChapter)}%`; }
function renderNavigation(active) {
  list.innerHTML = chapters.map(([n,title,available]) => available
    ? `<li><a href="#/chapter/${n}" class="${n===active?'active':''}"><span class="number">${String(n).padStart(2,"0")}</span><span>${title}</span><span class="chapter-progress" id="chapterProgress-${n}">${chapterPercent(n)}%</span></a></li>`
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
  renderNavigation(n); search.value = ""; searchStatus.textContent = ""; closeMenu();
  if (!n) {
    const count = chapters.filter(c => c[2]).length;
    doc.innerHTML = `<section class="landing"><p class="eyebrow">ADA 2026 · THƯ VIỆN LÂM SÀNG</p><h1>Tiêu chuẩn chăm sóc đái tháo đường<br><span>Phiên bản tiếng Việt chuyên ngành</span></h1><p class="landing-lead">Nền tảng tra cứu thực hành cho bác sĩ nội trú, bác sĩ chuyên khoa và nhân viên y tế. Nội dung được tổ chức theo chương để hỗ trợ đọc nhanh, học tập và thảo luận lâm sàng.</p><div class="landing-grid"><div class="landing-card"><strong>${count}<small>/17 chương</small></strong><span>Nội dung đã công bố</span></div><div class="landing-card"><strong>17</strong><span>Chủ đề thực hành lâm sàng</span></div><div class="landing-card"><strong>Cá nhân</strong><span>Tô sáng lưu trên thiết bị của bạn</span></div></div><div class="landing-actions"><a class="primary-action" href="#/chapter/1">Bắt đầu đọc Chương 1 <span>→</span></a><a class="secondary-action" href="#/chapter/3">Xem dự phòng đái tháo đường</a></div><div class="landing-disclaimer"><strong>Lưu ý sử dụng</strong><span>Bản dịch không chính thức, phục vụ học tập và tham khảo chuyên môn; không thay thế tài liệu gốc hoặc quyết định lâm sàng.</span></div></section>`;
    currentMarkdown = ""; renderOnPage(); setPager(0); return;
  }
  const chapter = chapters.find(c => c[0] === n);
  if (!chapter || !chapter[2]) { doc.innerHTML = '<div class="error">Chương này chưa có bản dịch để công bố.</div>'; return; }
  doc.innerHTML = '<div class="loading">Đang tải nội dung…</div>';
  try {
    const response = await fetch(`chapters/chapter-${String(n).padStart(2,"0")}.md`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    currentMarkdown = await response.text(); doc.innerHTML = chapterTools() + renderMarkdown(currentMarkdown); restoreHighlights(); bindChapterTools(); renderOnPage(); setPager(n); document.title = `Chương ${n} | ADA 2026 tiếng Việt`; window.scrollTo(0,0);
  } catch (error) { doc.innerHTML = `<div class="error"><strong>Không tải được Chương ${n}.</strong><p>${escapeHtml(error.message)}</p></div>`; }
}
function highlightSearch() {
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
  searchStatus.textContent = `${count} kết quả`; renderOnPage(); doc.querySelector("mark")?.scrollIntoView({behavior:"smooth",block:"center"});
}
function closeMenu(){ sidebar.classList.remove("open"); backdrop.classList.remove("open"); menu.setAttribute("aria-expanded","false"); }
menu.addEventListener("click",()=>{ const open=sidebar.classList.toggle("open"); backdrop.classList.toggle("open",open); menu.setAttribute("aria-expanded",String(open)); });
backdrop.addEventListener("click",closeMenu);
search.addEventListener("input",()=>{ clearTimeout(search.timer); search.timer=setTimeout(highlightSearch,250); });
document.getElementById("themeButton").addEventListener("click",()=>{ const next=document.documentElement.dataset.theme==="dark"?"light":"dark"; document.documentElement.dataset.theme=next; localStorage.setItem("theme",next); });
document.documentElement.dataset.theme = localStorage.getItem("theme") || "light";
window.addEventListener("scroll",()=>{ const max=document.documentElement.scrollHeight-innerHeight; document.getElementById("readingProgress").style.width=`${max>0?scrollY/max*100:0}%`; updateReadingProgress(); },{passive:true});
window.addEventListener("hashchange",()=>{ if (!location.hash || location.hash === "#/" || location.hash.startsWith("#/chapter/")) loadRoute(); }); loadRoute();


