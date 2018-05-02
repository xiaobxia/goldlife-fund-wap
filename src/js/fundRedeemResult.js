/**
 * Created by xiaobxia on 2018/3/30.
 */
/**
 * 返回，应该去资产-基金资产
 */
function backToLastUrl() {
  window.location = '/page/assets/fund';
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  console.log(queryString)
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  $('#next-btn').on('tap', function () {
    localStorage.setItem('sourceToFundRecords', '/page/assets/fund')
    window.location = '/page/assets/fund/records';
  });
}
