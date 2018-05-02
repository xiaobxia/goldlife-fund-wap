/**
 * Created by xiaobxia on 2018/3/30.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToRuifubaoWithdraw = localStorage.getItem('sourceToRuifubaoWithdraw');
  if (sourceToRuifubaoWithdraw) {
    localStorage.removeItem('sourceToRuifubaoWithdraw')
    window.location = sourceToRuifubaoWithdraw;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  console.log(queryString)
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  $('#next-btn').on('tap', function () {
    localStorage.setItem('sourceToRuifubaoRecords', localStorage.getItem('sourceToRuifubaoWithdraw'))
    window.location = '/page/assets/ruifubao/records';
  });
}
