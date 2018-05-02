/**
 * Created by xiaobxia on 2018/3/12.
 */
/**
 * 返回
 */
function backToLastUrl() {
  window.location = '/page/assets/fund';
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  console.log(queryString)
  var token = getToken();
  $('#warn-fenhong').on('tap', function () {
    mui.alert(`当前基金仅支持${queryString.autoBuy==='0'?'红利再投资':'现金分红'}`)
  })
  $('#no-change').on('tap', function () {
    mui.alert(`组合内的基金不允许修改分红方式`)
  })
  $('#view-info-btn').on('tap', function () {
    mui.alert('根据基金交易规则，该基金未付收益（即还没分配的收益），将在结转日以份额方式自动分配到您的基金账户，并计入该基金持仓收益。', '温馨提示')
  })

  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  /**
   * 去详情
   */
  $('#to-detail').on('tap', function () {
    localStorage.setItem('sourceToFundDetail', window.location.pathname + window.location.search)
    window.location = $(this).attr('data-href');
  });

  /**
   * 去购买
   */
  $('#buy-btn').on('tap', function () {
    localStorage.setItem('sourceToFundBuy', window.location.pathname+window.location.search);
    window.location = addqueryarg("/page/fund/fundBuy",{
      fundCode: queryString.fundCode,
      fundName: queryString.fundName,
      riskLevel: queryString.riskLevel,
      riskLevelString:queryString.riskLevelString
    })
  });


  /**
   * 跳去修改分红
   */
  $('#change-fenhong').on('tap', function () {
    var pageInfo = {
      ...queryString
    };
    localStorage.setItem('sourceToSelectDividend', addqueryarg(window.location.pathname,
      pageInfo));
    window.location = $('#change-fenhong a').attr('data-href')
  });

  /**
   * 赎回
   */
  $('#redeem-btn').on('tap', function () {
    localStorage.setItem('sourceToFundRedeem', window.location.pathname+window.location.search)
    window.location = addqueryarg('/page/assets/fund/redeem', queryString)
  });
}
