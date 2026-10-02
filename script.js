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
  {date:'2026.12.01', tag:'お知らせ', text:'全国生徒会大会2027 特設サイトを公開しました。'},
  {date:'準備中', tag:'開催概要', text:'開催日程・会場は決まり次第、随時お知らせいたします。'},
  {date:'準備中', tag:'募集', text:'参加校の募集開始時期は近日公開予定です。'},
];
 
function renderDropdown(){
  const el = document.getElementById('committeeMenu');
  if(!el) return;
  el.innerHTML = committees.map(c =>
    `<a href="committee-${c.slug}.html">${c.badge}</a>`
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
 
function closeMenus(){
  document.getElementById('committeeDropdown').classList.remove('open');
  document.getElementById('mainNav').classList.remove('open');
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
 
  document.getElementById('committeeToggle').addEventListener('click', (e)=>{
    e.stopPropagation();
    document.getElementById('committeeDropdown').classList.toggle('open');
  });
  document.getElementById('menuToggle').addEventListener('click', ()=>{
    positionMobileNav();
    document.getElementById('mainNav').classList.toggle('open');
  });
  document.addEventListener('click', (e)=>{
    if(!document.getElementById('committeeDropdown').contains(e.target)){
      document.getElementById('committeeDropdown').classList.remove('open');
    }
  });
  window.addEventListener('resize', positionMobileNav);
});
 
