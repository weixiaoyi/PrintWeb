(function (window) {
  var t1;
  var t2;
  var t3;
  var t4;

  function supportsWhereSelector() {
    // 浏览器是否支持：where 选择器
    try {
      document.querySelector(":where(a, b)");
      return true;
    } catch (error) {
      function check() {
        if (window.location.pathname.indexOf("/html/other.html") === -1) {
          window.location.href = "html/other.html";
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
        }
      }

      check();
      t1 = setTimeout(check, 1000);
      t2 = setTimeout(check, 2000);
      t3 = setTimeout(check, 3000);
      t4 = setTimeout(check, 5000);
      return false;
    }
  }

  if (window.navigate) {
    // 判断是IE
    window.navigate("/html/ie.html");
  } else {
    supportsWhereSelector();
  }
})(window);
