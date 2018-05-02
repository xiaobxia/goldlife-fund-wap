var token = getToken()
$(function () {
  console.log(monetaryDetail)
  chart()
  cansell()
  canbuy()

  $('#to-records').on('click',function () {
    localStorage.setItem('sourceToRuifubaoRecords',window.location.pathname+window.location.search)
    window.href='/page/assets/ruifubao/records?targetUrl=/page/ruifu/monetaryDetail='+monetaryDetail.fundCode
  })
})

function chart() {
  var latestWeeklyYieldList = monetaryDetail.latestWeeklyYieldList
  var xdata = []
  var ydata = []
  for (var i = 0; i < latestWeeklyYieldList.length; i++) {
    xdata[i] = latestWeeklyYieldList[i].tradingDay.substring(5)
    ydata[i] = latestWeeklyYieldList[i].rate
  }
  var myChart = echarts.init(document.getElementById('charts'));
  console.log(myChart)
  var option = {
    title: {
      text: '七日年化收益率(%)',
      textStyle: {
        color: "#947970",
        fontSize: 29
      },
      left: 40
    },
    xAxis: {
      type: 'category',
      data: xdata,
      boundaryGap: false,
      axisLabel: {
        fontSize: 18,
        margin: 10
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: ydata,
      type: 'line'
    }]
  };
  myChart.setOption(option);

}

function cansell() {
  if (monetaryDetail.canSell) {
    $('#buy_withdraw').css({
      "color": "#fff",
      "background": "#FFAA01",
      "border-right": "2px solid white"
    })
    $('#buy_withdraw').on('click', function () {
      // 提现跳转
      localStorage.setItem('sourceToRuifubaoWithdraw', window.location.pathname+window.location.search)
      window.location = '/page/ruifu/withdraw?fundCode=' + monetaryDetail.fundCode + '&fundName=' + monetaryDetail.fundName
    })
  } else {
    $('#buy_withdraw').unbind()
    $('#buy_withdraw').css({
      "color": "#fff",
      "background": "#BEBEBE"
    })
  }
}

function queryOpen() {
  $.ajax({
    url: '/codi-api/h5/ruifubao/goBuy',
    data: {
      fundCode: monetaryDetail.fundCode
    },
    dataType: 'json',
    type: 'get',
    headers: token,
    error: function () {
      mui.toast('网络出问题')
    },
    success: function (data) {
      if (data.status == 1) {
        //未开户
        var btnArray = ['取消', '去开户'];
        mui.confirm('请先进行开户', '', btnArray, function (e) {
          if (e.index == 1) {
            localStorage.setItem('sourceToOpenAccount', window.location.pathname + window.location.search);
            window.location = '/page/public/openAccount'
          } else {

          }
        })
      }
    }
  })
}

queryOpen();

function canbuy() {

  // 买入按钮
  if (monetaryDetail.canBuy) {
    $('#buy_btn').on('click', function () {
      $.ajax({
        url: '/codi-api/h5/ruifubao/goBuy',
        data: {
          fundCode: monetaryDetail.fundCode
        },
        dataType: 'json',
        type: 'get',
        headers: token,
        error: function () {
          mui.toast('网络出问题')
        },
        success: function (data) {
          if (data.status == 0) {
            localStorage.setItem('sourceToRuifubaoBuy', window.location.pathname+window.location.search)
            window.location = '/page/ruifu/ruifuBuy?fundCode=' + monetaryDetail.fundCode + '&fundName=' + monetaryDetail.fundName
          } else if (data.status == 1) {
            //未开户
            var btnArray = ['取消', '去开户'];
            mui.confirm('请先进行开户', '', btnArray, function (e) {
              if (e.index == 1) {
                localStorage.setItem('sourceToOpenAccount', window.location.pathname + window.location.search);
                window.location = '/page/public/openAccount'
              } else {

              }
            })
          } else if (data.status == 2) {
            //未做风险评测
            var btnArray = ['默认保守型', '风险评测'];
            mui.confirm('基金、私募及资管产品风险较高，应《证券期货投资者适当性管理办法》的要求，请先完成风险评测', '', btnArray, function (e) {
              if (e.index == 1) {
                localStorage.setItem('sourceToAssessRisk', window.location.pathname + window.location.search)
                window.location = '/page/user/assessRisk?answer_object=1&targetUrl=' + window.location.pathname + window.location.search
              } else {

              }
            })
          } else if (data.status == 3) {
            //风险评测过期
            var btnArray = ['取消', '风险评测'];
            mui.confirm('您的风险评测已过期，请重新测评后再进行操作', '', btnArray, function (e) {
              if (e.index == 1) {
                localStorage.setItem('sourceToAssessRisk', window.location.pathname + window.location.search)
                window.location = '/page/user/assessRisk?answer_object=1&targetUrl=' + window.location.pathname + window.location.search
              } else {

              }
            })
          }
        }
      });
    })
  } else {
    $('#buy_btn').unbind()
    $('#buy_btn').css({
      "color": "#fff",
      "background": "#BEBEBE"
    })
  }


  // 提现按钮

}

/**
 * 返回，首页
 */
function backToLastUrl() {
  var sourceToMonetaryDetail = localStorage.getItem('sourceToMonetaryDetail');
  if (sourceToMonetaryDetail) {
    localStorage.removeItem('sourceToMonetaryDetail')
    window.location = sourceToMonetaryDetail;
  } else {
    window.history.go(-1);
  }
}
$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl);

$('#to-records').on('tap', function () {
  localStorage.setItem('sourceToRuifubaoRecords', window.location.pathname+window.location.search)
  window.location = '/page/assets/ruifubao/records';
});

