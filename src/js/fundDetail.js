// 是否为货币基金
var ifCurrency
// x轴的数据
// var xdata = []
// x轴展示数据
var xshowdata = []
// y轴数据
// var ydata = []
// 标记数据
var markdata = []

var fontdata

var ydata_max

var ydata_min

var ydata_interval

var fundDetail

var fundDetailModel = {
  "applyDiscount": "-.--",
  "fareRatio": "-.--",
  "fareRatioAfterDiscount": "-.--",
  "fundCode": "",
  "fundManager": "",
  "fundManagers": [],
  "fundName": "",
  "fundNameAbbr": "",
  "fundStarRank": 0,
  "fundType": "",
  "fundTypeCode": 0,
  "investAdvisor": "",
  "investAdvisorCode": 0,
  "nvDailyGrowthRate": "-.--",
  "originFundType": "",
  "originFundTypeCode": 0,
  "rRInSingleMonth": "-.--",
  "rRInSingleWeek": "-.--",
  "rRInSingleYear": "-.--",
  "rRInSixMonth": "-.--",
  "rRInThreeMonth": "-.--",
  "rRSinceStart": "-.--",
  "rRSinceThisYear": "-.--",
  "riskLevel": 0,
  "riskLevelString": "0",
  "tradingDay": "--",
  "unitNV": "-.--"
}

var token = getToken()
$(function () {
  $.ajax({
    url: '/codi-api/h5/fund/detail',
    data: {
      fundCode: getUrlParam('fundCode')
    },
    dataType: 'json',
    type: 'get',
    headers: token,
    async: false,
    success: function (data) {
      console.log(data)
      // fundDetail = $.extend(true, data, fundDetailModel);
      fundDetail = data
      getUserFundInfo();
    }
  });

  setFontSize()

  loadFundDetailData()

  showdownload()

  btninit()

})

function setFontSize() {
  var html = document.getElementsByTagName('html')[0];

  var w = document.documentElement.clientWidth || document.body.clientWidth;

  var size = w / 7.5
  //size = size < 100 ? 100 : size
  fontdata = size
  console.log(html.style.fontSize)
};

// 下载栏显示
function showdownload() {
  var share = getUrlParam('share')
  if (share == 'true') {
    console.log(1)
    $('.download').show()
    $('.download div').show()
    $('.download_icon').show()
    $('.download_link').show()
    $('.download_close').show()
    $('.download_link').on('click', function () {
      window.location.href = 'appDownload.html'
    })
    $('.download_close').on('click', function () {
      $('.download').hide()
      $('.download div').hide()
      $('.download_icon').hide()
      $('.download_link').hide()
      $('.download_close').hide()
    })
  } else {
    console.log(2)
    $('.download').hide()
    $('.download div').hide()
    $('.download_icon').hide()
    $('.download_link').hide()
    $('.download_close').hide()
  }


}

function initEvent() {
  $(".J_doc").click(function () {
    removeSelectAndHide($(this).parent().find("div"));
    $("#oneweek").show();
    selectTab(this);
  });
  $(".J_notice").click(function () {
    removeSelectAndHide($(this).parent().find("div"));
    $("#history").show();
    selectTab(this);
  });

  $('.chart_btn ul li').on('click', function () {
    console.log(this)
    console.log(this.innerText)
    // 初始化数据
    // xdata = []
    xshowdata = []
    // ydata = []
    markdata = []
    if (this.innerText == '月') {
      console.log('月')
      $('.chart_btn ul li:nth-child(3)').css('border-right', '0.01rem solid #929091')
      $('.chart_btn ul li:nth-child(2)').css('border-right', '0.01rem solid #929091')
      getchartdata('one')
    } else if (this.innerText == '季') {
      console.log('季')
      $('.chart_btn ul li:nth-child(1)').css('border-right', '0.01rem solid #FFAC12')
      $('.chart_btn ul li:nth-child(3)').css('border-right', '0.01rem solid #929091')
      getchartdata('three')
    } else if (this.innerText == '半年') {
      console.log('半年')
      $('.chart_btn ul li:nth-child(2)').css('border-right', '0.01rem solid #FFAC12')
      $('.chart_btn ul li:nth-child(1)').css('border-right', '0.01rem solid #929091')
      getchartdata('six')
    } else if (this.innerText == '年') {
      console.log('年')
      $('.chart_btn ul li:nth-child(1)').css('border-right', '0.01rem solid #929091')
      $('.chart_btn ul li:nth-child(2)').css('border-right', '0.01rem solid #929091')
      $('.chart_btn ul li:nth-child(3)').css('border-right', '0.01rem solid #FFAC12')
      getchartdata('net')
    }
    $(this).addClass('btn_active')
    $(this).siblings().removeClass('btn_active')
  })
}

function selectTab(target) {
  $(target).addClass("selected")
}

function removeSelectAndHide(target) {
  $("#oneweek").hide();
  $("#history").hide();
  for (var i = 0; i <= target.length - 1; i++) {
    $(target[i]).removeClass("selected")
  }
}

//渲染页面数据
function loadFundDetailData() {
  // 历史跳转链接定义
  var fundHistory_url
  var data = fundDetail
  // 货币基金渲染
  console.log(data)

  $('#title div:nth-child(1)').html(fundDetail.fundNameAbbr)
  $('#title div:nth-child(2)').html(fundDetail.fundCode)
  ifCurrency = isCurrencyFund(data.fundTypeCode)
  //默认获取一个月数据
  getchartdata("one")
  if (isCurrencyFund(data.fundTypeCode)) {
    // 顶部数据
    var profit_left_string = ''
    if (data.latestWeeklyYield < 0) {
      profit_left_string += "<div>七日年化</div><div style='color:green'>" + parseFloat(data.latestWeeklyYield).toFixed(2) + "%</div><div><ul>"
    }
    else if (data.latestWeeklyYield == 0) {
      profit_left_string += "<div>七日年化</div><div style='color:#696969'>0.00%</div><div><ul>"
    }
    else {
      profit_left_string += "<div>七日年化</div><div>" + parseFloat(data.latestWeeklyYield).toFixed(2) + "%</div><div><ul>"
    }
    if (data.originFundType != '') {
      profit_left_string += "<li>" + data.originFundType + "</li>"
    }
    if (data.riskLevelString != '') {
      profit_left_string += "<li>" + data.riskLevelString + "</li>"
    }
    profit_left_string += "</ul></div></div>"
    $('.profit_left').html(profit_left_string)
    var profit_right_string = ''
    profit_right_string += "<div>万份收益(" + data.tradingDay + ")</div><div>" + data.dailyProfit + "</div>"
    $('.profit_right').html(profit_right_string)

    $('.profit_list_tab').html('<div class="selected J_doc span3">历史七日年化</div><div class="J_notice span3">历史业绩</div>')
    $('.chart_title').html('七日年化收益走势')

    $.ajax({
      url: '/codi-api/h5/fund/get_history_seven_day_annualized',
      data: {
        fundCode: getUrlParam("fundCode"),
        page: 1,
        size: 10
      },
      dataType: 'json',
      type: 'get',
      headers: {},
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        console.log(data)
        var oneweekdata = data.result.content
        var oneweekstring = "<div class='oneLine_title'>" +
          "      <div class='span_title_3'>日期</div>" +
          "      <div class='span_title_3'>万分收益</div>" +
          "      <div class='span_title_3'>七日年化</div>" +
          "    </div>"
        for (var i = 0; i < 3; i++) {
          oneweekstring += "<div class='oneLine'>" +
            "      <div class='span_con_3'>" + oneweekdata[i].TradingDay.substr(0, 10) + "</div>" +
            "      <div class='span_con_3'>" + parseFloat(oneweekdata[i].DailyProfit).toFixed(4) + "</div>"
          //
          if (oneweekdata[i].LatestWeeklyYield < 0) {
            oneweekstring += "<div class='span_con_3' style='color:green'>" + parseFloat(oneweekdata[i].LatestWeeklyYield).toFixed(2) + "%</div></div>"
          }
          else if (oneweekdata[i].LatestWeeklyYield == 0) {
            oneweekstring += "<div class='span_con_3' style='color:#696969'>0.00%</div></div>"
          }
          else {
            oneweekstring += "<div class='span_con_3' style='color:red'>+" + parseFloat(oneweekdata[i].LatestWeeklyYield).toFixed(2) + "%</div></div>"
          }
        }
        // fundHistory_url = "codi://openUrl?url=" + encodeURIComponent('/fund/fundHistory.html?fundCode=' + getUrlParam("fundCode") + '&type=sevendays')
        oneweekstring += "<div class='oneweek_more sevendaysHistory'>" +
          "      查看更多" +
          "    </div>"
        $('#oneweek').html(oneweekstring)
        $('.sevendaysHistory').on('click', function () {
          loadURL({
            url: '/page/fund/fundHistory',
            query: {
              fundCode: getUrlParam("fundCode"),
              type: 'sevendays'
            }
          })
        })
      }
    });

  } else {
    // 顶部数据
    var profit_left_string = ''
    if (data.nvDailyGrowthRate < 0) {
      profit_left_string += "<div>日涨幅</div><div style='color: green;'>" + data.nvDailyGrowthRate + "%</div><div><ul>"
    }
    else if (data.nvDailyGrowthRate == 0) {
      profit_left_string += "<div>日涨幅</div><div style='color: #696969;'>0.00%</div><div><ul>"
    }
    else {
      profit_left_string += "<div>日涨幅</div><div>" + data.nvDailyGrowthRate + "%</div><div><ul>"
    }
    if (data.originFundType != '') {
      profit_left_string += "<li>" + data.originFundType + "</li>"
    }
    if (data.riskLevelString != '') {
      profit_left_string += "<li>" + data.riskLevelString + "</li>"
    }
    profit_left_string += "</ul></div></div>"
    $('.profit_left').html(profit_left_string)
    var profit_right_string = ''
    profit_right_string += "<div>净值(" + data.tradingDay + ")</div><div>" + data.unitNV + "</div>"
    $('.profit_right').html(profit_right_string)

    $('.profit_list_tab').html('<div class="selected J_doc span3">历史净值</div><div class="J_notice span3">历史业绩</div>')
    $('.chart_title').html('净值走势')


    $.ajax({
      url: '/codi-api/h5/fund/get_history_net_values',
      data: {
        fundCode: getUrlParam("fundCode"),
        page: 1,
        size: 10
      },
      dataType: 'json',
      type: 'get',
      headers: {},
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        console.log(data)
        var oneweekdata = data.result.content
        var oneweekstring = "<div class='oneLine_title'>" +
          "      <div class='span_title_4'>日期</div>" +
          "      <div class='span_title_4'>单位净值</div>" +
          "      <div class='span_title_4'>累计净值</div>" +
          "      <div class='span_title_4'>日增涨率</div>" +
          "    </div>"
        for (var i = 0; i < 3; i++) {
          if (!oneweekdata[i]) {
            continue
          }
          oneweekstring += "<div class='oneLine'>" +
            "      <div class='span_con_4'>" + oneweekdata[i].EndDate.substr(0, 10) + "</div>" +
            "      <div class='span_con_4'>" + parseFloat(oneweekdata[i].UnitNV).toFixed(4) + "</div>" +
            "      <div class='span_con_4'>" + parseFloat(oneweekdata[i].AccumulatedUnitNV).toFixed(4) + "</div>"
          // parseFloat(oneweekdata[i].UnitNV).toFixed(4)
          if (oneweekdata[i].NVDailyGrowthRate < 0) {
            oneweekstring += "<div class='span_con_4' style='color:green'>" + parseFloat(oneweekdata[i].NVDailyGrowthRate).toFixed(2) + "%</div></div>"
          }
          else if (oneweekdata[i].NVDailyGrowthRate == 0) {
            oneweekstring += "<div class='span_con_4' style='color:#696969'>0.00%</div></div>"
          } else {
            oneweekstring += "<div class='span_con_4' style='color:red'>+" + parseFloat(oneweekdata[i].NVDailyGrowthRate).toFixed(2) + "%</div></div>"
          }
        }
        //fundHistory_url = "codi://openUrl?url=" + encodeURIComponent('/fund/fundHistory.html?fundCode=' + getUrlParam("fundCode") + '&type=UnitNV')
        oneweekstring += "<div class='oneweek_more unitnvHistory'>" +
          "      查看更多" +
          "    </div>"
        $('#oneweek').html(oneweekstring)
        $('.unitnvHistory').on('click', function () {
          loadURL({
            url: '/page/fund/fundHistory',
            query: {
              fundCode: getUrlParam("fundCode"),
              type: 'UnitNV'
            }
          })
        })
      }
    });


  }
  // 历史业绩渲染
  var history_string = "<div class='oneLine_title'>" +
    "      <div class='span_title_2'>日期</div>" +
    "      <div class='span_title_2'>收益</div>" +
    "    </div>"

  // 近一周数据
  if (data.rRInSingleWeek < 0) {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近一周</div>" +
      "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRInSingleWeek).toFixed(2) + "%</div>" +
      "    </div>"
  }
  else if (data.rRInSingleWeek == 0) {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近一周</div>" +
      "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
      "    </div>"
  }
  else {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近一周</div>" +
      "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRInSingleWeek).toFixed(2) + "%</div>" +
      "    </div>"
  }

  // 近一月数据
  if (data.rRInSingleMonth < 0) {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近一月</div>" +
      "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRInSingleMonth).toFixed(2) + "%</div>" +
      "    </div>"
  }
  else if (data.rRInSingleMonth == 0) {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近一月</div>" +
      "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
      "    </div>"
  }
  else {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近一月</div>" +
      "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRInSingleMonth).toFixed(2) + "%</div>" +
      "    </div>"
  }

  // 近三月数据
  if (data.rRInThreeMonth < 0) {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近三月</div>" +
      "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRInThreeMonth).toFixed(2) + "%</div>" +
      "    </div>"
  }
  else if (data.rRInThreeMonth == 0) {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近三月</div>" +
      "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
      "    </div>"
  }
  else {
    history_string += "<div class='oneLine'>" +
      "      <div class='span_con_2'>近三月</div>" +
      "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRInThreeMonth).toFixed(2) + "%</div>" +
      "    </div>"
  }

  //fundHistory_url = "codi://openUrl?url=" + encodeURIComponent('/fund/fundHistory.html?fundCode=' + getUrlParam("fundCode") + '&type=achievement')
  history_string += "<div class='oneweek_more achievementHistory' >" +
    "      查看更多" +
    "    </div>"

  $('#history').html(history_string)
  $('.achievementHistory').on('click', function () {
    loadURL({
      url: '/page/fund/fundHistory',
      query: {
        fundCode: getUrlParam("fundCode"),
        type: 'achievement'
      }
    })
  })
  initEvent()

  // 产品档案渲染

  // var investAdvisor_url = "codi://openUrl?url=" + encodeURIComponent('/fund/fundAdministrators.html?investAdvisorCode=' + data.investAdvisorCode)
  // var fundnotice_url = "codi://openUrl?url=" + encodeURIComponent('/fund/fundNotice.html?fundCode=' + getUrlParam("fundCode"))
  // var purchasenotice_url = "codi://openUrl?url=" + encodeURIComponent('/fund/purchaseNotice.html?fundCode=' + getUrlParam("fundCode"))
  // var fundarchives_url = "codi://openUrl?url=" + encodeURIComponent('/fund/fundArchives.html?fundCode=' + getUrlParam("fundCode"))


  var product_string = "<div class='product_title'>" +
    "    产品档案" +
    "  </div>"
  if (isCurrencyFund(data.fundTypeCode)) {
    product_string += "<div class='product_con fundarchives' >" +
      "    <div class='product_con_l'>基金档案</div>" +
      "    <div class='product_con_m'>概况、资产配置</div>" +
      "    <div class='product_con_r'></div>" +
      "  </div>"
  } else {
    product_string += "<div class='product_con fundarchives' >" +
      "    <div class='product_con_l'>基金档案</div>" +
      "    <div class='product_con_m'>概况、资产配置、分红</div>" +
      "    <div class='product_con_r'></div>" +
      "  </div>"
  }

  if (data.fundManagers.length == 1) {
    // var link = "codi://fundManager?fundManagerCode=" + data.fundManagers[0].code

    product_string += "<div class='product_con fundManager'>" +
      "    <div class='product_con_l'>基金经理</div>" +
      "    <div class='product_con_m'>" + data.fundManager + "</div>" +
      "    <div class='product_con_r'></div>" +
      "  </div>"

  } else if (data.fundManagers.length > 1) {
    // var link = "codi://openUrl?url=" + encodeURIComponent('/fund/fundManagerTransfer.html?fundCode=' + getUrlParam("fundCode"))
    product_string += "<div class='product_con fundManager'>" +
      "    <div class='product_con_l'>基金经理</div>" +
      "    <div class='product_con_m'>" + data.fundManager + "</div>" +
      "    <div class='product_con_r'></div>" +
      "  </div>"
  }

  // 基金管理人拦截地址


  product_string += "  <div class='product_con investAdvisor'>" +
    "    <div class='product_con_l'>基金管理人</div>" +
    "    <div class='product_con_m'>" + data.investAdvisor + "</div>" +
    "    <div class='product_con_r'></div>" +
    "  </div>" +
    "  <div class='product_con fundnotice' >" +
    "    <div class='product_con_l'>基金公告</div>" +
    "    <div class='product_con_m'>发行运作等</div>" +
    "    <div class='product_con_r'></div>" +
    "  </div>" +
    "  <div class='product_con purchasenotice' >" +
    "    <div class='product_con_l'>交易说明</div>" +
    "    <div class='product_con_m'>申购、赎回流程/申购、赎回费率</div>" +
    "    <div class='product_con_r'></div>" +
    "  </div>"

  $('.product').html(product_string)

  if (data.fundManagers.length == 1) {
    $('.fundManager').on('click', function () {
      loadURL({
        url: '/page/fund/fundManager',
        query: {
          managerCode: data.fundManagers[0].code
        }
      })
    })
  } else if (data.fundManagers.length > 1) {
    $('.fundManager').on('click', function () {
      loadURL({
        url: '/page/fund/fundManagerTransfer',
        query: {
          fundCode: getUrlParam("fundCode")
        }
      })
    })
  }

  $('.fundarchives').on('click', function () {
    loadURL({
      url: '/page/fund/fundArchives',
      query: {
        fundCode: getUrlParam("fundCode")
      }
    })
  })

  $('.investAdvisor').on('click', function () {
    loadURL({
      url: '/page/fund/fundAdministrators',
      query: {
        investAdvisorCode: data.investAdvisorCode
      }
    })
  })
  $('.fundnotice').on('click', function () {
    loadURL({
      url: '/page/fund/fundNotice',
      query: {
        fundCode: getUrlParam("fundCode")
      }
    })
  })
  $('.purchasenotice').on('click', function () {
    loadURL({
      url: '/page/fund/purchaseNotice',
      query: {
        fundCode: getUrlParam("fundCode")
      }
    })
  })
  data.fareRatio
  data.fareRatioAfterDiscount
  var rate_string
  if (isCurrencyFund(data.fundTypeCode)) {
    rate_string = '购买费率&nbsp;&nbsp;'
    rate_string += "<span>0.00%</span>"
  } else {
    rate_string = '优惠费率&nbsp;&nbsp;'
    var fareRatio = parseFloat(data.fareRatio).toFixed(2) + '%'
    var fareRatioAfterDiscount = parseFloat(data.fareRatioAfterDiscount).toFixed(2) + '%'
    rate_string += "<span style='text-decoration: line-through;'>" + fareRatio + "</span>"
    rate_string += "<span style='margin-left:14px'>" + fareRatioAfterDiscount + "</span>"
  }

  $('.rate').html(rate_string)

}

// 图表数据渲染
function showechart(xdata, ydata) {
  // console.log()
  console.log(xdata)
  console.log(xshowdata)
  console.log(ydata)
  ydata_max = parseFloat(ydata[0])
  ydata_min = parseFloat(ydata[0])
  for (var i = 1; i < ydata.length; i++) {
    if (parseFloat(ydata[i]) > ydata_max) {
      ydata_max = parseFloat(ydata[i])
    }
    if (parseFloat(ydata[i]) < ydata_min) {
      ydata_min = parseFloat(ydata[i])
    }
  }
  ydata_interval = (Math.ceil(ydata_max * 10) - Math.floor(ydata_min * 10)) / 50
  console.log(ydata_interval + ',' + ydata_max + ',' + ydata_min)
  console.log(markdata)
  var intervaldata = xdata.length - 2
  var myChart = echarts.init(document.getElementById('main'));
  // 指定图表的配置项和数据
  var option = {
    grid: {
      x: 0.9 * fontdata,
      y: 0.7 * fontdata,
      x2: 0.7 * fontdata,
      y2: 0.6 * fontdata,
      borderWidth: 1
    },
    xAxis: [{
      boundaryGap: false,
      triggerEvent: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#918F90',
        fontSize: 0.18 * fontdata,
        interval: intervaldata,
        margin: 0.2 * fontdata
      },
      data: xdata
    }],
    yAxis: {
      axisLabel: {
        fontSize: 0.16 * fontdata,
        color: '#918F90',
        formatter: '{value}'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      min: function (value) {
        //return parseInt(value.min * 10) / 10;
        return Math.floor(ydata_min * 10) / 10
      },
      max: function (value) {
        //return parseInt(value.max * 10) / 10;
        return Math.ceil(ydata_max * 10) / 10
      },
      interval: ydata_interval
    },
    tooltip: {
      trigger: 'axis',
      position: [0.59 * fontdata, 0],
      //padding: [0, 0.3 * fontdata],
      extraCssText: 'width:' + 6.1 * fontdata + 'px; height:' + 0.3 * fontdata + 'px;line-height:' + 0.3 * fontdata + 'px;',
      backgroundColor: 'white',
      alwaysShowContent: false,
      transitionDuration: 0,
      formatter: function (params, ticket, callback) {
        //x轴名称
        var name = params[0].name
        //图表title名称
        var seriesName = params[0].seriesName
        //值
        var data = params[0].data
        console.log(params[0])
        return '<div style="float:left;"><p style="margin: 0">时间：' + params[0].name + '</p></div><div style="float:right;"><p style="margin: 0">走势：' + params[0].data + '</p></div>'
        //return '时间：'+params[0].name+'涨幅：'+params[0].data
      },
      textStyle: {
        color: '#95776C',
        lineHeight: '15px',
        fontSize: 0.2 * fontdata
      }
    },
    series: [{
      type: 'line',
      itemStyle: {
        normal: {
          color: '#FFAA00'
        }
      },
      lineStyle: {
        normal: {
          width: 0.02 * fontdata,
        }
        //width: 0.01*fontdata
      },
      markPoint: {
        label: {
          normal: {
            show: true,
            formatter: ''
          }
        },
        itemStyle: {
          normal: {
            color: 'red',
          }
        },
        symbol: 'circle',
        symbolSize: 0.08 * fontdata,

        data: markdata
      },
      smooth: true,
      data: ydata
    }]
  };

  myChart.setOption(option);
}

// 获取图表数据
function getchartdata(date) {
  var param = {fundCode: getUrlParam("fundCode")};
  if (date == 'one') {
    param.option = 1
  }
  else if (date == 'three') {
    param.option = 2
  }
  else if (date == 'six') {
    param.option = 3
  }
  else if (date == 'net') {
    param.option = 4
  }
  $.ajax({
    url: '/codi-api/h5/fund/netValue',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: {},
    error: function (err) {
      console.log(err)
      if (err) {
        mui.toast(err.statusText);
        return;
      }
    },
    success: function (data) {
      console.log(data)
      // x轴的数据
      var xdata = []
      // y轴的数据
      var ydata = []
      var date = dataprocessing(data, xdata, ydata)
      console.log('是否为货币' + ifCurrency)
      if (!ifCurrency) {
        // dateexchangge(['2017-11-21', '2017-12-14'])
        console.log('非货币')
        buydata(date[0], date[1])
      } else {
        console.log('货币')
        showechart(date[0], date[1])
      }
    }
  });

}

// 图表数据处理
function dataprocessing(data, xdata, ydata) {
  console.log(data.result)
  if (!data.result) {
    return [[], []];
  }
  for (var i = 0; i < data.result.length; i++) {
    xdata.push(data.result[i].tradingDay)
    ydata.push(data.result[i].unitNV)
  }
  xshowdata[0] = xdata[0]
  xshowdata[1] = xdata[parseInt(xdata.length / 2)]
  xshowdata[2] = xdata[xdata.length - 1]
  xdata = xdata.reverse()
  ydata = ydata.reverse()
  xshowdata = xshowdata.reverse()
  console.log(xdata)
  console.log(ydata)
  console.log(xshowdata)
  return [xdata, ydata]
}

//买入点数据获取
function buydata(xdata, ydata) {

  var param = {fundCode: getUrlParam("fundCode")};
  $.ajax({
    url: '/codi-api/h5/fund/trading',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: getToken(),
    error: function (err) {
      console.log(err)
      if (err) {
        mui.toast(err.statusText);
        return;
      }
    },
    success: function (data) {
      if (data.result) {
        console.log(data.result)
        var buydate = data.result
        if (buydate) {
          for (var i = 0; i < buydate.length; i++) {
            buydate[i] = buydate[i].substr(0, 10)
          }
          console.log(buydate)
          if (getUrlParam('share') == 'true') {

          } else {
            dateexchangge(buydate, xdata, ydata)
          }
        }
      } else {
        console.log('获取买入点失败')
      }
      showechart(xdata, ydata)
    }
  });

}

/**
 * 判断是否是货基展现形式
 * @param fundTypeCode
 * @returns {boolean}
 */
function isCurrencyFund(fundTypeCode) {
  return fundTypeCode == "1109" || fundTypeCode == "900000";
}


function formatDate(now) {
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  return year + "-" + month + "-" + date;
}

// 时间格式转换
function dateexchangge(data, xdata, ydata) {
  if (data) {
    var newdate = data
    // for (var i = 0; i < data.length; i++) {
    //   //newdate.push(new Date(parseInt(("/Date(" + data[i] + ")/").substr(6, 13))).toLocaleDateString())
    //   newdate.push(formatDate(new Date(data[i])))
    //   console.log(new Date(data[i]))
    // }
    console.log(newdate)
    var dateindex = []
    var makpoitdatex = []
    for (var j = 0; j < newdate.length; j++) {
      for (var k = 0; k < xdata.length; k++) {
        if (newdate[j] == xdata[k]) {
          dateindex.push(k)
          makpoitdatex.push(xdata[k])
        }
      }
    }
    console.log(dateindex)
    var makpoitdatey = []
    for (var n = 0; n < dateindex.length; n++) {
      makpoitdatey.push(ydata[dateindex[n]])
    }

    console.log(makpoitdatex)
    console.log(makpoitdatey)
    for (var m = 0; m < makpoitdatex.length; m++) {
      if (m == 0) {
        markdata.push({
          xAxis: makpoitdatex[m],
          yAxis: makpoitdatey[m],
          symbol: 'image://static/asset/1.jpg',
          symbolSize: [0.6 * fontdata, 0.4 * fontdata],
          symbolOffset: [-0.32 * fontdata, -0.3 * fontdata],
          label: {
            normal: {
              show: true,
              textStyle: {
                color: '#000',
                fontFamily: 'sans-serif',
                fontSize: 12,
              }
            }
          }
        })
        markdata.push({
          xAxis: makpoitdatex[m],
          yAxis: makpoitdatey[m]
        })
      } else {
        markdata.push({
          xAxis: makpoitdatex[m],
          yAxis: makpoitdatey[m]
        })
      }
    }
  }

}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}


function loadURL(data) {
  window.location = addqueryarg(data.url, {
    ...data.query
  })
}

var userBuyFundInfo = {};
var userCastsurelyFundInfo = {};
function getUserFundInfo() {
  $.ajax({
    url: '/codi-api/h5/fund/goBuy',
    data: {
      fundCode: fundDetail.fundCode,
      fundName: fundDetail.fundName,
    },
    dataType: 'json',
    type: 'get',
    headers: token,
    success: function (data) {
      userBuyFundInfo = data;
    }
  })
  $.ajax({
    url: '/codi-api/h5/fund/goCircleBuy',
    data: {
      fundCode: fundDetail.fundCode,
      fundName: fundDetail.fundName,
    },
    dataType: 'json',
    type: 'get',
    headers: token,
    success: function (data) {
      userCastsurelyFundInfo = data;
    }
  })
}


function btninit() {
  // 基金买入
  $('#fund_buy').on('click', function () {
    if (userBuyFundInfo.status == 0) {
      var backurl = window.location.pathname + window.location.search;
      localStorage.setItem('sourceToFundBuy', backurl)
      window.location = '/page/fund/fundBuy?fundCode=' + fundDetail.fundCode + '&fundName=' + fundDetail.fundNameAbbr + '&riskLevel=' + fundDetail.riskLevel + '&riskLevelString=' + fundDetail.riskLevelString
    } else if (userBuyFundInfo.status == 1) {
      //未开户
      var btnArray = ['取消', '去开户'];
      mui.confirm('请先进行开户', '', btnArray, function (e) {
        if (e.index == 1) {
          localStorage.setItem('sourceToOpenAccount', window.location.pathname + window.location.search);
          window.location = '/page/public/openAccount'
        } else {

        }
      })
    } else if (userBuyFundInfo.status == 2) {
      //未做风险评测
      var btnArray = ['默认保守型', '风险评测'];
      mui.confirm('基金、私募及资管产品风险较高，应《证券期货投资者适当性管理办法》的要求，请先完成风险评测', '', btnArray, function (e) {
        if (e.index == 1) {
          localStorage.setItem('sourceToAssessRisk', window.location.pathname + window.location.search)
          window.location = '/page/user/assessRisk?answer_object=1&targetUrl=' + window.location.pathname + window.location.search
        } else {

        }
      })
    } else if (userBuyFundInfo.status == 3) {
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
  })
  // 基金定投
  $('#fund_castsurely').on('click', function () {
    if (userCastsurelyFundInfo.status == 0) {
      window.location = '/page/fund/fundCastsurely?fundCode=' + fundDetail.fundCode + '&fundName=' + fundDetail.fundNameAbbr
    } else if (userCastsurelyFundInfo.status == 1) {
      //未开户
      var btnArray = ['取消', '去开户'];
      mui.confirm('请先进行开户', '', btnArray, function (e) {
        if (e.index == 1) {
          localStorage.setItem('sourceToOpenAccount', window.location.pathname + window.location.search);
          window.location = '/page/public/openAccount'
        } else {

        }
      })
    } else if (userCastsurelyFundInfo.status == 2) {
      //未做风险评测
      var btnArray = ['默认保守型', '风险评测'];
      mui.confirm('基金、私募及资管产品风险较高，应《证券期货投资者适当性管理办法》的要求，请先完成风险评测', '', btnArray, function (e) {
        if (e.index == 1) {
          localStorage.setItem('sourceToAssessRisk', window.location.pathname + window.location.search)
          window.location = '/page/user/assessRisk?answer_object=1&targetUrl=' + window.location.pathname + window.location.search
        } else {

        }
      })
    } else if (userCastsurelyFundInfo.status == 3) {
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
  })

}

/**
 * 返回
 */
function backToLastUrl() {
  var sourceToFundDetail = localStorage.getItem('sourceToFundDetail');
  if (sourceToFundDetail) {
    localStorage.removeItem('sourceToFundDetail')
    window.location = sourceToFundDetail;
  } else {
    window.history.go(-1);
  }
}
$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl);
