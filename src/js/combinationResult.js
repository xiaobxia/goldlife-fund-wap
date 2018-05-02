var querystring = getQueryStringArgs()
$(function () {
  initpage()
  initclick()
})



function initclick() {
  $(".openbtn").click(function () {
    console.log($(this).next())
    if ($(this).children().hasClass("rotate")) { //点击箭头旋转180度
      console.log(1)
      $(this).children().removeClass("rotate");
      $(this).children().addClass("rotate1");
      $('.fund_pay_main').slideToggle()
    } else {
      console.log(2)
      $(this).children().removeClass("rotate1"); //再次点击箭头回来
      $(this).children().addClass("rotate");
      $('.fund_pay_main').slideToggle()
    }
  })



}

/**
 * 返回
 */
function backToLastUrl() {
  var sourceToPortfolioBuy = localStorage.getItem('sourceToPortfolioBuy');
  if (sourceToPortfolioBuy) {
    localStorage.removeItem('sourceToPortfolioBuy')
    window.location = sourceToPortfolioBuy;
  } else {
    window.history.go(-1);
  }
}
$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl);

$('.btn').on('click',function () {
  localStorage.setItem('sourceToPortfolioRecords', localStorage.getItem('sourceToPortfolioBuy'))
  window.location = '/page/assets/portfolio/records'
})

function initpage() {
  var querystring = getQueryStringArgs()
  console.log(querystring)
  $('.fundname div:nth-child(2)').html(querystring.combinationName)
  $('.buynum div:nth-child(2)').html(parseFloat(querystring.value).toFixed(2)+'元')
  $('.paytype div:nth-child(2)').html(querystring.bankName + '(' + querystring.bankNo.substring(querystring.bankNo.length - 4) + ')')
  $('.time div:nth-child(1)').html(querystring.orderDate)
  $('.time div:nth-child(2)').html(querystring.orderTime)
  var Namelist = querystring.fundNamelist.split(',')
  var persentlist = querystring.persent.split(',')
  var value = querystring.value
  var htmlstring = ''
  var numList = []
  for (var j = 0; j < persentlist.length; j++) {
    numList[j] = parseFloat(persentlist[j] * value / 100).toFixed(2)
  }
  for (var i = 0; i < Namelist.length; i++) {
    htmlstring += '<div>' +
      '  <div class="fund_pay_main_top">' +
      '    <div class="fontclolr">' + Namelist[i] + '</div>' +
      '    <div class="fontclolr">扣款成功</div>' +
      '  </div>' +
      '  <div class="fund_pay_main_bot">' +
      '    <div>金额:'+numList[i]+'元</div>' +
      '    <div>确认份额:--份</div>' +
      '  </div>' +
      '</div>'
  }

  $('.fund_pay_main').html(htmlstring)
}
