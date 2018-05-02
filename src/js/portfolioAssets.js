/**
 * Created by xiaobxia on 2018/3/27.
 */
/**
 * 返回，应该去资产
 */
function backToLastUrl() {
  window.location = '/page/assets';
}
window.onload = function () {
  mui.init();
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  /**
   * 去记录
   */
  $('#to-records').on('tap', function () {
    localStorage.setItem('sourceToPortfolioRecords', window.location.pathname+window.location.search)
    window.location = '/page/assets/portfolio/records';
  });
  // /**
  //  * 详情跳转
  //  */
  // $('#list').on('tap','.mui-table-view-cell', function () {
  //   console.log($(this).index())
  //   window.location = addqueryarg()
  // })
};
