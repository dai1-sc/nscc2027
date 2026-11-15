// 実行委員ページ：ログイン、お知らせの投稿・編集・削除
(function () {
  'use strict';

  var TOKEN_KEY = 'nscc_staff_token';
  var $ = function (id) { return document.getElementById(id); };

  var token = null;
  var member = null;
  var editingId = null;

  /* ---------- 通信 ---------- */

  function api(action, data) {
    var payload = { action: action };
    for (var k in data) payload[k] = data[k];
    return fetch(NSCC_API, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (res) { return res.json(); })
      .catch(function () {
        return { ok: false, error: '通信に失敗しました。ネットワークを確認して、もう一度お試しください。' };
      });
  }

  /* ---------- 表示まわり ---------- */

  function setMsg(id, text, isError) {
    var el = $(id);
    el.textContent = text || '';
    el.className = 'st-msg' + (isError ? ' st-err' : '');
  }

  function showView(name) {
    $('loginView').hidden = name !== 'login';
    $('mainView').hidden = name !== 'main';
    $('initMsg').textContent = '';
  }

  function todayString() {
    var d = new Date();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function goLogin(message, isError) {
    token = null;
    member = null;
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* 無視 */ }
    $('emailForm').hidden = false;
    $('codeForm').hidden = true;
    $('code').value = '';
    showView('login');
    setMsg('loginMsg', message || '', isError);
  }

  // 認証切れのときはログイン画面に戻す。戻した場合は true
  function handleAuthFail(res) {
    if (res && res.auth) {
      goLogin(res.error, true);
      return true;
    }
    return false;
  }

  /* ---------- ログイン ---------- */

  $('emailForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('sendCodeBtn');
    btn.disabled = true;
    setMsg('loginMsg', '送信しています…');
    api('requestCode', { email: $('email').value }).then(function (res) {
      btn.disabled = false;
      if (!res.ok) {
        setMsg('loginMsg', res.error, true);
        return;
      }
      $('emailForm').hidden = true;
      $('codeForm').hidden = false;
      $('code').focus();
      setMsg('loginMsg', res.message + ' メールが届かない場合は、迷惑メールフォルダもご確認ください。');
    });
  });

  $('codeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('loginBtn');
    btn.disabled = true;
    setMsg('loginMsg', '確認しています…');
    api('verifyCode', { email: $('email').value, code: $('code').value }).then(function (res) {
      btn.disabled = false;
      if (!res.ok) {
        setMsg('loginMsg', res.error, true);
        return;
      }
      token = res.token;
      member = res.member;
      try { sessionStorage.setItem(TOKEN_KEY, token); } catch (err) { /* 無視 */ }
      enterMain();
    });
  });

  $('backBtn').addEventListener('click', function () {
    $('emailForm').hidden = false;
    $('codeForm').hidden = true;
    $('code').value = '';
    setMsg('loginMsg', '');
  });

  $('logoutBtn').addEventListener('click', function () {
    var t = token;
    goLogin('ログアウトしました。');
    if (t) api('logout', { token: t });
  });

  /* ---------- ログイン後の画面 ---------- */

  function enterMain() {
    showView('main');
    $('whoami').textContent = member.name + ' さん（' + member.department + '）としてログイン中';
    $('deptLabel').textContent = member.department;
    resetForm();
    loadList();
  }

  function resetForm() {
    editingId = null;
    $('newsForm').reset();
    $('newsDate').value = todayString();
    $('formTitle').textContent = 'お知らせを投稿する';
    $('saveBtn').textContent = '投稿する';
    $('cancelBtn').hidden = true;
    $('deptLabel').textContent = member ? member.department : '';
    setMsg('formMsg', '');
  }

  $('cancelBtn').addEventListener('click', resetForm);

  $('newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('saveBtn');
    btn.disabled = true;
    setMsg('formMsg', '送信しています…');
    api('save', {
      token: token,
      id: editingId,
      date: $('newsDate').value,
      title: $('newsTitle').value,
      body: $('newsBody').value,
      link: $('newsLink').value
    }).then(function (res) {
      btn.disabled = false;
      if (handleAuthFail(res)) return;
      if (!res.ok) {
        setMsg('formMsg', res.error, true);
        return;
      }
      var wasEdit = !!editingId;
      resetForm();
      setMsg('formMsg', wasEdit ? '更新しました。' : '投稿しました。ホームページに反映されます。');
      loadList();
    });
  });

  /* ---------- 一覧 ---------- */

  function loadList() {
    setMsg('listMsg', '読み込んでいます…');
    api('listStaff', { token: token }).then(function (res) {
      if (handleAuthFail(res)) return;
      if (!res.ok) {
        setMsg('listMsg', res.error, true);
        return;
      }
      setMsg('listMsg', '');
      renderList(res.items || []);
    });
  }

  function renderList(items) {
    var box = $('staffList');
    box.innerHTML = '';

    if (!items.length) {
      var empty = document.createElement('p');
      empty.className = 'st-empty';
      empty.textContent = 'まだお知らせはありません。';
      box.appendChild(empty);
      return;
    }

    items.forEach(function (item) {
      var wrap = document.createElement('div');
      wrap.className = 'st-item';

      var meta = document.createElement('p');
      meta.className = 'st-item-meta';
      meta.textContent = item.date.replace(/-/g, '.') + '　' + item.department + '　投稿者：' + item.author;
      wrap.appendChild(meta);

      var title = document.createElement('p');
      title.className = 'st-item-title';
      title.textContent = item.title;
      wrap.appendChild(title);

      var body = document.createElement('p');
      body.className = 'st-item-body';
      body.textContent = item.body;
      wrap.appendChild(body);

      if (item.canEdit) {
        var actions = document.createElement('div');
        actions.className = 'st-item-actions';

        var edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'st-btn small';
        edit.textContent = '編集';
        edit.addEventListener('click', function () { startEdit(item); });
        actions.appendChild(edit);

        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'st-btn small';
        del.textContent = '削除';
        del.addEventListener('click', function () { removeItem(item, del); });
        actions.appendChild(del);

        wrap.appendChild(actions);
      }

      box.appendChild(wrap);
    });
  }

  function startEdit(item) {
    editingId = item.id;
    $('newsDate').value = item.date;
    $('newsTitle').value = item.title;
    $('newsBody').value = item.body;
    $('newsLink').value = item.link || '';
    $('deptLabel').textContent = item.department;
    $('formTitle').textContent = 'お知らせを編集する';
    $('saveBtn').textContent = '更新する';
    $('cancelBtn').hidden = false;
    setMsg('formMsg', '');
    $('formTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function removeItem(item, btn) {
    if (!window.confirm('「' + item.title + '」を削除します。ホームページからも消えます。よろしいですか？')) return;
    btn.disabled = true;
    api('remove', { token: token, id: item.id }).then(function (res) {
      if (handleAuthFail(res)) return;
      if (!res.ok) {
        btn.disabled = false;
        setMsg('listMsg', res.error, true);
        return;
      }
      if (editingId === item.id) resetForm();
      setMsg('listMsg', '削除しました。');
      loadList();
    });
  }

  /* ---------- 起動 ---------- */

  function init() {
    if (typeof NSCC_API === 'undefined' || NSCC_API.indexOf('http') !== 0) {
      setMsg('initMsg', 'config.js にGASのURLが設定されていません。', true);
      return;
    }

    var saved = null;
    try { saved = sessionStorage.getItem(TOKEN_KEY); } catch (e) { /* 無視 */ }
    if (!saved) {
      goLogin('');
      return;
    }

    setMsg('initMsg', '確認しています…');
    api('me', { token: saved }).then(function (res) {
      if (res.ok) {
        token = saved;
        member = res.member;
        enterMain();
      } else {
        goLogin('');
      }
    });
  }

  init();
})();
