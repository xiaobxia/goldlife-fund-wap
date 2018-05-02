/**
 * Created by xiaobxia on 2018/3/27.
 */
/**
 * 返回，应该去首页
 */

function backToLastUrl() {
  window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
}
window.onload = function () {
  mui.init();

  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  $('#to-risk').on('tap', function () {
    localStorage.setItem('sourceToAssessRisk', window.location.pathname+window.location.search);
    window.location = '/page/user/assessRisk?answer_object=1'
  });
  $('#to-result').on('tap', function () {
    localStorage.setItem('sourceToAssessRisk', window.location.pathname+window.location.search);
    window.location = '/page/user/assessResult'
  });
};
