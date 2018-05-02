function backToLastUrl() {
  //如果是从banner进来，调用app关闭窗口
  if(queryString.banner === 'true') {
    window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
    return;
  }
  window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
}
$(function () {

  pageinit()

  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);
})



function pageinit() {

      var fundlist = portfolioList
      var fundliststring = ''


      for (var i = 0; i < fundlist.length; i++) {
        var contxt
        if (fundlist[i].annualizedIncome) {
          contxt = "向你推荐一只基金组合,组合净收益率:" + fundlist[i].annualizedIncome + "%"
        } else {
          contxt = "向你推荐一只基金组合"
        }
        if (fundlist[i].accumulatedIncome == 0) {
          fundliststring += "<div class='fundPortfollo' onclick=\"loadURL('"+fundlist[i].combinationCode+"')\" >" +
            "    <div class='fundPortfollo_l'>" +
            "      <ul>" +
            "        <li class='annualizedIncome' style='color:#696969;'>0.00<a href='javascript:void(0)' style='color:#696969;'>%</a></li>" +
            "        <li>累计收益</li>" +
            "      </ul>" +
            "    </div>" +
            "    <div class='fundPortfollo_r'>" +
            "      <ul>" +
            "        <li>" + fundlist[i].combinationName + "</li>" +
            "        <li>" + fundlist[i].briefIntroduction + "</li>" +
            "      </ul>" +
            "    </div>" +
            "  </div>"
        } else if (!fundlist[i].accumulatedIncome) {
          fundliststring += "<div class='fundPortfollo' onclick=\"loadURL('"+fundlist[i].combinationCode+"')\">" +
            "    <div class='fundPortfollo_l'>" +
            "      <ul>" +
            "        <li class='annualizedIncome' style='color:#696969;'>--</li>" +
            "        <li>累计收益</li>" +
            "      </ul>" +
            "    </div>" +
            "    <div class='fundPortfollo_r'>" +
            "      <ul>" +
            "        <li>" + fundlist[i].combinationName + "</li>" +
            "        <li>" + fundlist[i].briefIntroduction + "</li>" +
            "      </ul>" +
            "    </div>" +
            "  </div>"
        } else if (fundlist[i].accumulatedIncome > 0) {
          var annualizedIncome = "+" + fundlist[i].accumulatedIncome
          fundliststring += "<div class='fundPortfollo' onclick=\"loadURL('"+fundlist[i].combinationCode+"')\">" +
            "    <div class='fundPortfollo_l'>" +
            "      <ul>" +
            "        <li class='annualizedIncome'>" + annualizedIncome + "<a href='javascript:void(0)'>%</a></li>" +
            "        <li>累计收益</li>" +
            "      </ul>" +
            "    </div>" +
            "    <div class='fundPortfollo_r'>" +
            "      <ul>" +
            "        <li>" + fundlist[i].combinationName + "</li>" +
            "        <li>" + fundlist[i].briefIntroduction + "</li>" +
            "      </ul>" +
            "    </div>" +
            "  </div>"
        } else if (fundlist[i].accumulatedIncome < 0) {
          var annualizedIncome = fundlist[i].accumulatedIncome
          fundliststring += "<div class='fundPortfollo'  onclick=\"loadURL('"+fundlist[i].combinationCode+"')\">" +
            "    <div class='fundPortfollo_l'>" +
            "      <ul>" +
            "        <li class='annualizedIncome' style='color:green;'>" + annualizedIncome + "<a href='javascript:void(0)' style='color:green;'>%</a></li>" +
            "        <li>累计收益</li>" +
            "      </ul>" +
            "    </div>" +
            "    <div class='fundPortfollo_r'>" +
            "      <ul>" +
            "        <li>" + fundlist[i].combinationName + "</li>" +
            "        <li>" + fundlist[i].briefIntroduction + "</li>" +
            "      </ul>" +
            "    </div>" +
            "  </div>"
        }

      }

      $('.main').html(fundliststring)

}

function loadURL(id) {
  localStorage.setItem('sourceToPortfolioDetail', window.location.pathname + window.location.search)
  window.location = '/page/combination/combinationDetail?combinationCode='+id
}


