/**
 * Created by xiaobxia on 2018/3/28.
 */
function backToLastUrl() {
  window.location = '/page/assets/portfolio';
}
window.onload = function () {
  mui.init();
  var portfolioTrade = portfolioTrades[0];
  console.log(portfolioTrade)
  portfolioTrade.protocolName = protocolName;

  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  $('#redeem-btn').on('tap', function () {
    if ($('#redeem-btn').hasClass('disabled')) {
      return;
    }
    localStorage.setItem('portfolioTrade', JSON.stringify(portfolioTrade));
    localStorage.setItem('sourceToPortfolioRedeem', window.location.pathname+window.location.search);
    window.location = addqueryarg('/page/assets/portfolio/redeem', {
      portfolioTrade: JSON.stringify(portfolioTrade)
    });
  })
  $('#buy-btn').on('tap', function () {
    var portfolioFunds = portfolioTrade.portfolioFunds;
    var fundCodesStr = '';
    var fundNamelist = '';
    var fundCodelist = '';
    var persent = '';
    for (var i = 0; i < portfolioFunds.length; i++) {
      if (fundCodesStr !== '') {
        fundCodesStr += '|';
        fundNamelist += ',';
        fundCodelist += ',';
        persent += ',';
      }
      persent += 100 * portfolioFunds[i].investRate;
      fundCodelist += portfolioFunds[i].fCode;
      fundNamelist += portfolioFunds[i].fundName;
      fundCodesStr += portfolioFunds[i].fCode + '|' + 100 * portfolioFunds[i].investRate
    }
    console.log( {
      fundCodesStr: fundCodesStr,
      portfolioCode: portfolioTrade.portfolioCode,
      combinationName: portfolioTrade.protocolName,
      fundNamelist: fundNamelist,
      fundCodelist: fundCodelist,
      persent: persent
    })
    localStorage.setItem('sourceToPortfolioBuy', window.location.pathname + window.location.search)
    window.location = addqueryarg('/page/combination/combinationBuy', {
      fundCodesStr: fundCodesStr,
      portfolioCode: portfolioTrade.portfolioCode,
      combinationName: portfolioTrade.protocolName,
      fundNamelist: fundNamelist,
      fundCodelist: fundCodelist,
      persent: persent
    })
  // $('#view-records').on('tap', function () {
  //
  });
};
