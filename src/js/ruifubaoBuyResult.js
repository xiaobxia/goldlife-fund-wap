/**
 * Created by xiaobxia on 2018/4/3.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToRuifubaoBuy = localStorage.getItem('sourceToRuifubaoBuy');
  if (sourceToRuifubaoBuy) {
    localStorage.removeItem('sourceToRuifubaoBuy')
    window.location = sourceToRuifubaoBuy;
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
    localStorage.setItem('sourceToRuifubaoRecords', localStorage.getItem('sourceToRuifubaoBuy'))
    window.location = '/page/assets/ruifubao/records';
  });
}
