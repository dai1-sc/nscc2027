// ホームページのお知らせ表示
// 最新3件を表示し、4件目以降は「もっと見る」を押すと表示する。
// GASのURLが未設定、または読み込みに失敗した場合は、ページに元からあるお知らせをそのまま残す。
(function () {
  'use strict';

  var LIMIT = 3;
  var box = document.getElementById('newsFeed');
  if (!box) return;
  if (typeof NSCC_API === 'undefined' || NSCC_API.indexOf('http') !== 0) return;

  function formatDate(s) {
    return String(s).replace(/-/g, '.');
  }

  function render(items) {
    box.innerHTML = '';

    if (!items.length) {
      var empty = document.createElement('p');
      empty.className = 'nf-empty';
      empty.textContent = '現在、お知らせはありません。';
      box.appendChild(empty);
      return;
    }

    var list = document.createElement('div');
    list.className = 'nf-list';

    items.forEach(function (item, i) {
      var article = document.createElement('article');
      article.className = 'nf-item';
      if (i >= LIMIT) article.hidden = true;

      var meta = document.createElement('p');
      meta.className = 'nf-meta';
      meta.textContent = formatDate(item.date) + '　' + item.department;
      article.appendChild(meta);

      var title = document.createElement('h3');
      title.className = 'nf-title';
      title.textContent = item.title;
      article.appendChild(title);

      var body = document.createElement('p');
      body.className = 'nf-body';
      body.textContent = item.body;
      article.appendChild(body);

      if (item.link) {
        var p = document.createElement('p');
        p.className = 'nf-link';
        var a = document.createElement('a');
        a.href = item.link;
        a.target = '_blank';
        a.rel = 'noopener';
        // 表示名があればそれを、なければURLをそのまま表示する
        a.textContent = item.linkLabel || item.link;
        p.appendChild(a);
        article.appendChild(p);
      }

      list.appendChild(article);
    });

    box.appendChild(list);

    if (items.length > LIMIT) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nf-more';
      btn.textContent = 'もっと見る';
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        var articles = list.querySelectorAll('.nf-item');
        for (var i = LIMIT; i < articles.length; i++) articles[i].hidden = open;
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.textContent = open ? 'もっと見る' : '閉じる';
      });
      box.appendChild(btn);
    }
  }

  fetch(NSCC_API + '?action=list')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data || !data.ok) return;
      render(data.items || []);
      // 取得できたら、元からあるお知らせの一覧は隠す
      var old = document.getElementById('newsList');
      if (old) old.style.display = 'none';
    })
    .catch(function () { /* 失敗時は既存の表示を残す */ });
})();
