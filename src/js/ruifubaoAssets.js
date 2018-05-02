/**
 * Created by xiaobxia on 2018/3/9.
 */
/**
 * 返回，应该去资产
 */
function backToLastUrl() {
  //如果是从banner进来，调用app关闭窗口
  if(queryString.banner === 'true') {
    window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
    return;
  }
  window.location = '/page/assets';
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  /**
   * 去记录
   */
  $('#to-records').on('tap', function () {
    localStorage.setItem('sourceToRuifubaoRecords', window.location.pathname+window.location.search)
    window.location = '/page/assets/ruifubao/records';
  });
  $('#list').on('tap', '.mui-table-view-cell', function (e) {
    localStorage.setItem('sourceToMonetaryDetail',window.location.pathname+window.location.search);
    window.location = $(this).attr('data-href')
  });
};
