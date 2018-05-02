$(function () {
  initpage()
  initbtn()
})

function initpage() {
  if (mine.wallet.totalAccumIncomeString > 0) {
    $('#wallet').css('color', 'red')
  }
  else if (mine.wallet.totalAccumIncomeString < 0) {
    $('#wallet').css('color', 'green')
  } else {

  }

  if (mine.portfolios.portfolioTodayIncomeString > 0) {
    $('#portfolio').css('color', 'red')
  }
  else if (mine.portfolios.portfolioTodayIncomeString < 0) {
    $('#portfolio').css('color', 'green')
  } else {

  }

  if (mine.wallet.totalAccumIncomeString > 0) {
    $('#fund').css('color', 'red')
  }
  else if (mine.wallet.totalAccumIncomeString < 0) {
    $('#fund').css('color', 'green')
  } else {

  }


  if (mine.wallet.inTransitNum > 0) {
    var string = '有' + mine.wallet.inTransitNum + '笔买入确认中'
    $('#walletmessage').css('color', 'red')
    $('#walletmessage').html(string)
  } else {
    $('#walletmessage').html('支持实时赎回')
  }

  if (mine.portfolios.inTransitNum > 0) {
    var string = '有' + mine.portfolios.inTransitNum + '笔买入确认中'
    $('#walletmessage').css('color', 'red')
    $('#walletmessage').html(string)
  } else if (mine.portfolios.portfolioNum > 0) {
    var string = '持有' + mine.portfolios.portfolioNum + '只基金组合'
    $('#portfoliomessage').html(string)
  } else {
    $('#portfoliomessage').html('你还未购买基金组合')
  }

  if (mine.fund.inTransitNum > 0) {
    var string = '有' + mine.fund.inTransitNum + '笔买入确认中'
    $('#fundmessage').css('color', 'red')
    $('#fundmessage').html(string)
  } else if (mine.fund.fundsCount > 0) {
    var string = '持有' + mine.fund.fundsCount + '只基金'
    $('#fundmessage').html(string)
  } else {
    $('#fundmessage').html('你还未购买基金产品')
  }
}

function initbtn() {

  // 定投管理跳转
  $('.dtgl').on('click',function () {
    window.location='/page/user/castSurely'
  })

  // 风险评测跳转
  $('.fxpc').on('click',function () {
    if(!risk.have_tested ==true){
      window.location='/page/user/assessRisk?answer_object=1&targetUrl='+window.location.pathname+window.location.search
    }else{
      window.location='/page/user/assessResult?targetUrl='+window.location.pathname+window.location.search
    }
  })

  //银行卡管理
  $('.bankCard').on('click',function () {
    window.location='/page/user/bankcardList'
  })

  // 账户设置
  $('.userEdit').on('click',function () {
    window.location='/page/user/userEdit'
  })

}

