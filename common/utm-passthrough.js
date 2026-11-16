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
