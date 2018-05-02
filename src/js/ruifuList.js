/**
 * 返回
 */
function backToLastUrl() {
  window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
}
$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl);
