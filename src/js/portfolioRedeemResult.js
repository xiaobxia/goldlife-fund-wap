/**
 * Created by xiaobxia on 2018/3/30.
 */
/**
 * 返回，应该去资产-组合资产
 */
function backToLastUrl() {
  window.location = '/page/assets/portfolio';
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var data = JSON.parse(queryString.portfolioTrade);
  data.redeemRate = queryString.redeemRate;
  console.log(data)
  var shares = 0;
  for(var i=0;i<data.portfolioFunds.length;i++) {
    var portfolioFund = data.portfolioFunds[i];
    shares += parseInt(data.redeemRate)*portfolioFund.enableShares
  }
  $('#shares').text((parseInt(shares)/100)+'份');
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  $('#next-btn').on('tap', function () {
    localStorage.setItem('sourceToPortfolioRecords', '/page/assets/portfolio')
    window.location = '/page/assets/portfolio/records';
  });
}
