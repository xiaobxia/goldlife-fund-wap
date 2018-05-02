/**
 * Created by xiaobxia on 2018/4/4.
 */
var queryString = getQueryStringArgs();
function backToLastUrl() {
  window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
}
$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl);
if (window.location.pathname === '/page/user/manageIndex') {
  if (queryString.redirectType === 'index') {
    $('.mui-icon-left-nav').css({
      display: 'none'
    })
  }
}
