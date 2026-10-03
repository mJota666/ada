const chapters = [
  [1, "Cải thiện chăm sóc và thúc đẩy sức khỏe quần thể", true],
  [2, "Chẩn đoán và phân loại đái tháo đường", true],
  [3, "Dự phòng hoặc trì hoãn đái tháo đường và bệnh đồng mắc", false],
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
  const flushParagraph = () => { if (paragraph.length) { html += `<p>${inline(paragraph.join(" "))}</p>`; paragraph = []; } };
  const closeList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { flushParagraph(); closeList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); closeList();
      const level = heading[1].length, text = heading[2], id = slugify(text) || `muc-${i}`;
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
function renderNavigation(active) {
  list.innerHTML = chapters.map(([n,title,available]) => available
    ? `<li><a href="#/chapter/${n}" class="${n===active?'active':''}"><span class="number">${String(n).padStart(2,"0")}</span><span>${title}</span></a></li>`
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
  renderNavigation(n); search.value = ""; searchStatus.textContent = ""; closeMenu();
  if (!n) {
    const count = chapters.filter(c => c[2]).length;
    doc.innerHTML = `<section class="landing"><p class="eyebrow">ADA 2026 · BẢN DỊCH KHÔNG CHÍNH THỨC</p><h1>Tra cứu khuyến cáo đái tháo đường bằng tiếng Việt</h1><p>Thư viện chuyên ngành dành cho bác sĩ nội trú, bác sĩ chuyên khoa và nhân viên y tế. Nội dung được tổ chức theo chương, tối ưu cho đọc trên máy tính, điện thoại và in ấn.</p><div class="landing-grid"><div class="landing-card"><strong>${count}/17</strong>chương hiện có</div><div class="landing-card"><strong>Tìm kiếm</strong>ngay trong chương</div><div class="landing-card"><strong>Responsive</strong>đọc thuận tiện mọi thiết bị</div></div><p><a href="#/chapter/1">Bắt đầu từ Chương 1 →</a></p></section>`;
    currentMarkdown = ""; renderOnPage(); setPager(0); return;
  }
  const chapter = chapters.find(c => c[0] === n);
  if (!chapter || !chapter[2]) { doc.innerHTML = '<div class="error">Chương này chưa có bản dịch để công bố.</div>'; return; }
  doc.innerHTML = '<div class="loading">Đang tải nội dung…</div>';
  try {
    const response = await fetch(`chapters/chapter-${String(n).padStart(2,"0")}.md`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    currentMarkdown = await response.text(); doc.innerHTML = renderMarkdown(currentMarkdown); renderOnPage(); setPager(n); document.title = `Chương ${n} | ADA 2026 tiếng Việt`; window.scrollTo(0,0);
  } catch (error) { doc.innerHTML = `<div class="error"><strong>Không tải được Chương ${n}.</strong><p>${escapeHtml(error.message)}</p></div>`; }
}
function highlightSearch() {
  const query = search.value.trim();
  doc.innerHTML = renderMarkdown(currentMarkdown);
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
window.addEventListener("scroll",()=>{ const max=document.documentElement.scrollHeight-innerHeight; document.getElementById("readingProgress").style.width=`${max>0?scrollY/max*100:0}%`; },{passive:true});
window.addEventListener("hashchange",loadRoute); loadRoute();


