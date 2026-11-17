/* 랜딩 → monday 폼 UTM 전달 (YC AI 오피스 · 2026-11-16 · 식스샵 사이트 공통)
 * 광고가 랜딩으로 보낸 주소의 utm_* 값을 기억했다가, 페이지 안의 monday 폼 링크(forms.monday.com·wkf.ms)에 이어 붙인다.
 * → 폼의 숨은 질문(utm_source·medium·campaign·content·term)이 값을 받아 리드 보드에 저장됨.
 * 식스샵 헤더(또는 GitHub Pages 주입 JS)에 한 번 넣으면 그 사이트 모든 페이지에 적용.
 */
(function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var STORE = "yc_utm";
  var saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(STORE) || "{}"); } catch (e) {}
  var q = new URLSearchParams(location.search);
  var fresh = {};
  KEYS.forEach(function (k) { if (q.get(k)) fresh[k] = q.get(k); });
  if (Object.keys(fresh).length) { saved = fresh; try { sessionStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {} }
  if (!Object.keys(saved).length) return;

  function isForm(href) { return /(^|\/\/)(forms\.monday\.com|wkf\.ms)\//.test(href); }
  function decorate(a) {
    if (!a.href || !isForm(a.href)) return;
    try {
      var u = new URL(a.href);
      KEYS.forEach(function (k) { if (saved[k] && !u.searchParams.get(k)) u.searchParams.set(k, saved[k]); });
      a.href = u.toString();
    } catch (e) {}
  }
  function run() { document.querySelectorAll("a[href]").forEach(decorate); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
  // 버튼이 나중에 그려지는 페이지(식스샵 섹션) 대비: 클릭 직전에 한 번 더
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[href]"); if (a) decorate(a); }, true);
})();
(function () {
  /* [추가 2026-11-17] 넥스트우드 블프 랜딩 한정: 상담 양식 전송이 성공(ok:true)하면 메타 픽셀 Lead 1회.
   * 전송 내용은 읽기만 하고 바꾸지 않는다(접수에 영향 없음). 이 페이지엔 픽셀이 없어 성공 시에만 불러온다.
   * 업무 ads-objective-leads-20261116 4단계①. 되돌리기 = 이 블록 삭제(이전 커밋). */
  if (!/^\/nextwood-blackfriday\/?$/.test(location.pathname)) return;
  var PIXEL = "463092085510658", NAME = "넥스트우드 블프 상담", sent = false;
  function isConsult(url) { return /nextwood-monday-consult[^\/]*\/api\/consult/.test(String(url || "")); }
  function lead() {
    if (sent) return; sent = true;
    try {
      if (!window.fbq) {
        !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      }
      window.fbq("init", PIXEL);
      window.fbq("trackSingle", PIXEL, "Lead", { content_name: NAME });
    } catch (e) {}
  }
  if (window.fetch) {
    var of = window.fetch;
    window.fetch = function (input, init) {
      var p = of.apply(this, arguments);
      try {
        var url = typeof input === "string" ? input : input && input.url;
        if (isConsult(url)) p.then(function (r) { try { r.clone().json().then(function (j) { if (j && j.ok) lead(); }).catch(function () {}); } catch (e) {} }).catch(function () {});
      } catch (e) {}
      return p;
    };
  }
  if (window.XMLHttpRequest) {
    var oo = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, url) {
      try { if (isConsult(url)) this.addEventListener("load", function () { try { var j = JSON.parse(this.responseText); if (j && j.ok) lead(); } catch (e) {} }); } catch (e) {}
      return oo.apply(this, arguments);
    };
  }
})();