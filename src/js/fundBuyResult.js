/**
 * Created by xiaobxia on 2018/4/4.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToFundBuy = localStorage.getItem('sourceToFundBuy');
  if (sourceToFundBuy) {
    localStorage.removeItem('sourceToFundBuy')
    window.location = sourceToFundBuy;
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
    localStorage.setItem('sourceToFundRecords', localStorage.getItem('sourceToFundBuy'))
    window.location = '/page/assets/fund/records';
  });
}
