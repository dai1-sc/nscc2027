const committees = [
  {slug:'chairperson', badge:'実行委員長', desc:'大会全体を統括し、各部門の活動をとりまとめる責任者です。大会の方針を定め、実行委員会全体をリードします。'},
  {slug:'vice-chairperson', badge:'副実行委員長', desc:'実行委員長を補佐し、大会運営が円滑に進むよう各部門との調整を担います。実行委員長不在時は代理を務めます。'},
  {slug:'general-affairs', badge:'総務部', desc:'会場の手配や当日の運営進行、備品管理など、大会運営の土台となる業務を幅広く担当します。'},
  {slug:'operations', badge:'事業部', desc:'外部との連携を通じて、参加校にとって実りある時間になるよう準備を進めます。'},
  {slug:'public-relations', badge:'広報部', desc:'パンフレットの作成やSNSでの発信を通じて、大会の魅力や最新情報を全国の生徒会に届けます。'},
  {slug:'planning', badge:'企画部', desc:'大会のテーマやプログラム内容を企画立案し、参加者が主体的に関われる大会づくりを進めます。'},
  {slug:'accounting', badge:'会計部', desc:'大会運営に必要な予算の編成や管理を担当し、健全な大会運営を財務面から支えます。'},
  {slug:'ict', badge:'ICT部', desc:'本サイトの制作や業務効率化など、ICTを活用した大会運営を担当します。'},
];

const news = [
  {date:'10.28', tag:'お知らせ', text:'開催日：2027年3月24日〜26日に決定！'},
  {date:'10.07', tag:'お知らせ', text:'全国生徒会大会2027 特設サイトを公開しました。'},
];
 
function renderDropdown(){
  const el = document.getElementById('committeeMenu');
  if(!el) return;
  // --i は CSS 側で「1項目ずつ順番に出す」ための番号
  el.innerHTML = committees.map((c, i) =>
    `<a href="committee-${c.slug}.html" style="--i:${i}">${c.badge}</a>`
  ).join('');
}
 
function renderNews(){
  const el = document.getElementById('newsList');
  if(!el) return;
  el.innerHTML = news.map(n => `
    <li>
      <span class="news-date">${n.date}</span>
      <span class="news-tag">${n.tag}</span>
      <span>${n.text}</span>
    </li>`).join('');
}

function setDropdownOpen(open){
  const dd = document.getElementById('committeeDropdown');
  const toggle = document.getElementById('committeeToggle');
  dd.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
}

function setNavOpen(open){
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('menuToggle');
  if(open) positionMobileNav();
  nav.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニュー');
  document.body.classList.toggle('menu-open', open);
  // メニューを閉じるときは、中の実行委員紹介も畳んでおく
  if(!open) setDropdownOpen(false);
}
 
function closeMenus(){
  setDropdownOpen(false);
  setNavOpen(false);
}
 
function positionMobileNav(){
  const header = document.querySelector('header');
  document.getElementById('mainNav').style.top = header.offsetHeight + 'px';
}
 
function setActiveNav(){
  const file = location.pathname.split('/').pop() || 'index.html';
  let page = 'home';
  if(file === 'contact.html') page = 'contact';
  else if(file === 'overview.html') page = 'overview';
  else if(file === 'program.html') page = 'program';
  else if(file.startsWith('committee-')) page = 'committee';
  document.querySelectorAll('.navlink').forEach(el=>{
    el.classList.toggle('active', el.dataset.page === page);
  });
}
 
document.addEventListener('DOMContentLoaded', () => {
  renderDropdown();
  renderNews();
  setActiveNav();

  const dropdown = document.getElementById('committeeDropdown');
  const committeeToggle = document.getElementById('committeeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  // ハンバーガーボタンを「3本線 → ×」に変形できる形にする（HTML側の変更は不要）
  menuToggle.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>';
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', 'mainNav');

  // 実行委員紹介：キーボードでも開閉できるように
  committeeToggle.setAttribute('role', 'button');
  committeeToggle.setAttribute('tabindex', '0');
  committeeToggle.setAttribute('aria-haspopup', 'true');
  committeeToggle.setAttribute('aria-expanded', 'false');

  committeeToggle.addEventListener('click', (e)=>{
    e.stopPropagation();
    setDropdownOpen(!dropdown.classList.contains('open'));
  });
  committeeToggle.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      setDropdownOpen(!dropdown.classList.contains('open'));
    }
  });

  menuToggle.addEventListener('click', ()=>{
    setNavOpen(!mainNav.classList.contains('open'));
  });

  // メニュー内のリンクを押したら閉じる（同じページ内リンクでも開きっぱなしにならない）
  mainNav.addEventListener('click', (e)=>{
    if(e.target.closest('a')) closeMenus();
  });

  // メニューの外側をクリックしたらプルダウンを閉じる
  document.addEventListener('click', (e)=>{
    if(!dropdown.contains(e.target)) setDropdownOpen(false);
  });

  // Esc キーで閉じる
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeMenus();
  });

  window.addEventListener('resize', ()=>{
    // PC幅に広げたらスマホ用メニューは閉じる
    if(window.innerWidth > 720 && mainNav.classList.contains('open')) setNavOpen(false);
    positionMobileNav();
  });
});
