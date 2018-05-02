// 运行天数
var runDay
// 基准年化
var baseAnnualizedIncome
// 年化收益
var annualizedIncome
// 获取数据长度
var datalength
// 组合收益数据
var realline = []
// 组合收益时间轴
var date = []
// 基准时间轴
var basedate = []
// 基准
var baseline = []
// 展示时间轴
var showdate = []

var fontdata

var createDate

var showchart

var token = getToken()
$(function () {
  console.log(combinationDetail)
  setFontSize()

  pageinit()

  eventinit()

  showdownload()

  wareHouse()

  chartdata(1)

  showechart()

  initbtn()
})

function setFontSize() {
  var html = document.getElementsByTagName('html')[0];

  var w = document.documentElement.clientWidth || document.body.clientWidth;

  var size = w / 7.5
  //size = size < 100 ? 100 : size
  fontdata = size
  console.log(html.style.fontSize)
};

function showechart() {
  console.log()
  console.log(baseline)
  console.log(basedate)
  console.log(realline)
  console.log(date)
  console.log(parseInt(baseAnnualizedIncome) * (parseInt(runDay)) / 365)
  var title = '业绩基准线:目标年化' + baseAnnualizedIncome + '%'
  var myChart = echarts.init(document.getElementById('main'));
  // 指定图表的配置项和数据
  if (showchart) {
    var option = {
      grid: {
        x: 0.9 * fontdata,
        y: 0.7 * fontdata,
        x2: 0.7 * fontdata,
        y2: 0.4 * fontdata,
        borderWidth: 1
      },
      color: ['#FE6601', '#00C0FF'],
      legend: {
        icon: 'circle',
        itemWidth: 0.28 * fontdata,
        itemHeight: 0.1 * fontdata,
        itemGap: 0.26 * fontdata,
        data: ['组合收益率', title],
        right: '20%',
        textStyle: {
          fontSize: 0.23 * fontdata,
          color: '#939192'
        }
      },
      xAxis: [{
        show: 'false',
        type: 'category',
        boundaryGap: false,
        data: showdate,
        axisTick: {length: 0},
        axisLine: {
          show: 'false'
        },
        axisLabel: {
          show: 'false',
          fontSize: 0.2 * fontdata,
          color: '#D2D2D2'
        }
      }, {
        show: 'false',
        type: 'category',
        boundaryGap: false,
        data: basedate,
        axisTick: {length: 0},
        axisLine: {
          show: 'false'
        },
        axisLabel: {
          show: 'false',
          color: 'white',
          linestyle: {
            color: '#ddd'
          }
        }
      }, {
        show: 'false',
        type: 'category',
        boundaryGap: false,
        data: date,
        axisTick: {length: 0},
        axisLine: {
          show: 'false',
          lineStyle: {
            color: '#D2D2D2'
          }
        },
        axisLabel: {
          show: 'false',
          color: 'white',
          linestyle: {
            color: '#ddd'
          }
        }
      }
      ],
      yAxis: [{
        type: 'value',
        splitLine: {
          show: 'false'
        },
        axisLabel: {
          fontSize: 0.16 * fontdata,
          color: '#918F90',
          formatter: '{value}%'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      }],
      series: [{
        name: '组合收益率',
        type: 'line',
        symbol: 'circle',
        showSymbol: false,
        xAxisIndex: 2,
        lineStyle: {
          normal: {
            width: 0.01 * fontdata,
            color: '#FE6601'
          }
        },
        data: realline
      }, {
        name: title,
        type: 'line',
        symbol: 'circle',
        showSymbol: false,
        xAxisIndex: 1,
        lineStyle: {
          normal: {
            width: 0.01 * fontdata,
            color: '#00C0FF'
          }
        },
        data: baseline
      }]
    };
  } else {
    var option = {
      grid: {
        x: 0.7 * fontdata,
        y: 0.7 * fontdata,
        x2: 0.7 * fontdata,
        y2: 0.4 * fontdata,
        borderWidth: 1
      },
      color: ['#FE6601', '#00C0FF'],
      legend: {
        icon: 'circle',
        itemWidth: 0.28 * fontdata,
        itemHeight: 0.1 * fontdata,
        itemGap: 0.26 * fontdata,
        data: ['组合收益率', title],
        right: '20%',
        textStyle: {
          fontSize: 0.23 * fontdata,
          color: '#939192'
        }
      },
      xAxis: [{
        show: 'false',
        type: 'category',
        boundaryGap: false,
        data: showdate,
        axisTick: {length: 0},
        axisLine: {
          show: 'false'
        },
        axisLabel: {
          show: 'false',
          fontSize: 0.2 * fontdata,
          color: '#D2D2D2'
        }
      }, {
        show: 'false',
        type: 'category',
        boundaryGap: false,
        data: basedate,
        axisTick: {length: 0},
        axisLine: {
          show: 'false'
        },
        axisLabel: {
          show: 'false',
          color: 'white',
          linestyle: {
            color: '#ddd'
          }
        }
      }, {
        show: 'false',
        type: 'category',
        boundaryGap: false,
        data: date,
        axisTick: {length: 0},
        axisLine: {
          show: 'false',
          lineStyle: {
            color: '#D2D2D2'
          }
        },
        axisLabel: {
          show: 'false',
          color: 'white',
          linestyle: {
            color: '#ddd'
          }
        }
      }
      ],
      yAxis: [{
        type: 'value',
        splitLine: {
          show: 'false'
        },
        axisLabel: {
          fontSize: 0.16 * fontdata,
          color: '#918F90',
          formatter: '{value}% '
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        min: function (value) {
          //return parseInt(value.min * 10) / 10;
          return 0
        },
        max: function (value) {
          //return parseInt(value.max * 10) / 10;
          return 1
        }
      }],
      series: [{
        name: '组合收益率',
        type: 'line',
        symbol: 'circle',
        showSymbol: false,
        xAxisIndex: 2,
        lineStyle: {
          normal: {
            width: 0.02 * fontdata,
            color: '#918F90'
          }
        },
        data: realline
      }, {
        // name: '业绩基准线',
        name: title,
        type: 'line',
        symbol: 'circle',
        showSymbol: false,
        xAxisIndex: 1,
        lineStyle: {
          normal: {
            width: 0.02 * fontdata,
            color: '#918F90'
          }
        },
        data: baseline
      }]
    };
  }


  myChart.setOption(option);
}


function pageinit() {

  //添加日期
  var data = combinationDetail
  var tradeDate = data.tradeDate
  if (tradeDate && tradeDate != '') {
    $('.dailyCent_con').html("日涨幅(" + tradeDate.slice(5) + ")")
    $('.profit-b').html("<ul><li>年化收益(" + tradeDate.slice(5) + ")</li> <li>累计收益(" + tradeDate.slice(5) + ")</li></ul>")
  } else {
    $('.dailyCent_con').html("日涨幅")
    $('.profit-b').html("<ul><li>年化收益</li><li>累计收益</li></ul>")
    $('.profit-b ul li:nth-child(1)').css({
      "padding-right": "2.8rem"
    })
  }

  //组合名称
  var combinationName = data.combinationName
  $('.profit-t').html(combinationName)
  // 累计收益
  var accumulatedIncome = data.accumulatedIncome
  if (accumulatedIncome == '' || !accumulatedIncome) {
    $('.accumulatedIncome').css('color', '#696969')
    $('.accumulatedIncome').html("--")
  } else if (accumulatedIncome > 0) {
    $('.accumulatedIncome').css('color', 'red')
    $('.accumulatedIncome').html("+" + accumulatedIncome + "<a class='accper' href='javascript:void(0);'>%</a>")
    $('.accper').css('color', 'red')
  } else if (accumulatedIncome == 0) {
    $('.accumulatedIncome').css('color', '#696969')
    $('.accumulatedIncome').html("0.00<a class='accper' href='javascript:void(0);'>%</a>")
    $('.accper').css('color', '#696969')
  } else {
    $('.accumulatedIncome').css('color', 'green')
    $('.accumulatedIncome').html(accumulatedIncome + "<a class='accper' href='javascript:void(0);'>%</a>")
    $('.accper').css('color', 'green')
  }

  // 运行时间

  runDay = data.runDay
  if (runDay && runDay != '' && runDay != '0') {
    $('.runDay').html("已运行" + runDay + "天")
  }
  // 年化收益
  baseAnnualizedIncome = data.baseAnnualizedIncome
  annualizedIncome = data.annualizedIncome
  if (annualizedIncome == 0 && runDay > 90) {
    $('.baseAnnualizedIncome').css('color', '#696969')
    $('.baseAnnualizedIncome').html("0.00<a class='baseper' href='javascript:void(0);'>%</a>")
    $('.baseper').css('color', '#696969')
  } else if (annualizedIncome > 0 && runDay > 90) {
    $('.baseAnnualizedIncome').css('color', 'red')
    $('.baseAnnualizedIncome').html("+" + annualizedIncome + "<a class='baseper' href='javascript:void(0);'>%</a>")
    $('.baseper').css('color', 'red')
  } else if (annualizedIncome < 0 && runDay > 90) {
    $('.baseAnnualizedIncome').css('color', 'green')
    $('.baseAnnualizedIncome').html(annualizedIncome + "<a class='baseper' href='javascript:void(0);'>%</a>")
    $('.baseper').css('color', 'green')
  } else if (runDay < 90) {
    $('.baseAnnualizedIncome').css('color', '#696969')
    $('.baseAnnualizedIncome').html("--")
  } else if (annualizedIncome == '' || !annualizedIncome) {
    $('.baseAnnualizedIncome').css('color', '#696969')
    $('.baseAnnualizedIncome').html("--")
  }
  // 日收益
  var dailyCent = data.dailyCent
  if (dailyCent == '' || !dailyCent) {
    $('.dailyCent').css('color', '#696969')
    $('.dailyCent').html('--')
  } else if (dailyCent > 0) {
    $('.dailyCent').css('color', 'red')
    $('.dailyCent').html("+" + dailyCent + "%")
  } else if (dailyCent == 0) {
    $('.dailyCent').css('color', '#696969')
    $('.dailyCent').html("0.00%")
  } else {
    $('.dailyCent').css('color', 'green')
    $('.dailyCent').html(dailyCent + "%")
  }

  // 描述
  var describe = data.description
  var describe_arr = describe.split('$')
  var describe_html = ''
  for (var i = 0; i < describe_arr.length; i++) {
    describe_html += describe_arr[i] + '<br>'
  }
  $('.profit_main_a_con').html(describe_html)
  // 创建时间
  createDate = data.createDate
  $('.createDate').html(createDate.substring(0, 10) + '成立')
  //基金组合
  var fundInfoCombinationResults = data.fundInfoCombinationResults
  var liststring = ''
  for (var i = 0; i < fundInfoCombinationResults.length; i++) {
    var data = fundInfoCombinationResults[i]
    // window.location.href='fundDetail.html?fundCode=data.fundCode
    liststring += "<ul>" +
      "<li onclick=\"loadToDetail('/page/fund/fundDetail?fundCode=" + data.fundCode + "&fundName=" + data.fundName + "')\">" +
      "<p class='name'>" + data.fundName + "</p>" +
      "<span class='type_num'>" + data.fundCode + data.fundTypeName + "</span>" +
      "<p class='proportion'>" + data.fundPercent + "%</p>" +
      "<p class='list_icon'></p>" +
      "</li>"
  }
  liststring += "</ul>"
  $('.list_data').html(liststring)

  $('.transaction').html('<img src="/static/asset/jysm.jpg" alt="">')

  $('.download').html('<img src="./img/download_l.jpg" class="download_icon">' +
    '    <div>科地基金</div>' +
    '    <a href="javascript:void(0)" class="download_link"></a>' +
    '    <a href="javascript:void(0)" class="download_close"></a>')
  // eventinit(ajaxlistdata)
  // 取消遮挡层
  $('.occlusion').css('display', 'none')

}

function chartdata(type) {

  var type = type
  var combinationCode = getUrlParam('combinationCode')
  console.log(1)
  var param = {combinationCode: combinationCode, type: type};
  $.ajax({
    url: '/codi-api/h5/portfolio/query_chart',
    data: param,
    dataType: 'json',
    type: 'get',
    async: false,
    error: function (err) {
      console.log(err)
      if (err) {
        mui.toast(err.statusText);
        return;
      }
    },
    success: function (data) {
      console.log(data)
      datalength = data.result.length
      if (datalength > 0) {
        showchart = true
        var chartdata = data.result
        date = []
        realline = []
        for (var i = 0; i < chartdata.length; i++) {
          date[i] = chartdata[i].tradeDate
          realline[i] = parseFloat(chartdata[i].accumulatedIncome)
        }
        if (datalength == 1) {
          date[1] = chartdata[0].tradeDate
          realline[1] = parseFloat(chartdata[0].accumulatedIncome)
        }
        showdate[0] = date[0]
        showdate[1] = date[date.length - 1]
        baseline[0] = parseFloat(baseAnnualizedIncome) * (parseInt(runDay) - parseInt(datalength)) / 365;
        baseline[1] = parseFloat(baseAnnualizedIncome) * (parseInt(runDay) - 1) / 365
        basedate[0] = chartdata[0].tradeDate
        basedate[1] = chartdata[chartdata.length - 1].tradeDate
      } else {
        showchart = false
        showdate[0] = createDate.substring(0, 10)
        showdate[1] = createDate.substring(0, 10)
        baseline[0] = createDate.substring(0, 10)
        baseline[1] = createDate.substring(0, 10)
        basedate = [0, 0]
        realline = [0, 0]
      }
    }
  });
}


function eventinit() {
  $('.charts_btn ul li').on('click', function () {
    console.log(this)
    console.log(this.innerText)
    if (this.innerText == '近一月') {
      console.log('近一月')
      $('.charts_btn ul li:nth-child(3)').css('border-right', '0.01rem solid #929091')
      $('.charts_btn ul li:nth-child(2)').css('border-right', '0.01rem solid #929091')
      chartdata(1)
      showechart()
    } else if (this.innerText == '近三月') {
      console.log('近三月')
      $('.charts_btn ul li:nth-child(1)').css('border-right', '0.01rem solid #FFAC12')
      $('.charts_btn ul li:nth-child(3)').css('border-right', '0.01rem solid #929091')
      chartdata(2)
      showechart()
    } else if (this.innerText == '近一年') {
      console.log('近一年')
      $('.charts_btn ul li:nth-child(2)').css('border-right', '0.01rem solid #FFAC12')
      $('.charts_btn ul li:nth-child(1)').css('border-right', '0.01rem solid #929091')
      chartdata(3)
      showechart()
    } else if (this.innerText == '成立以来') {
      console.log('成立以来')
      $('.charts_btn ul li:nth-child(1)').css('border-right', '0.01rem solid #929091')
      $('.charts_btn ul li:nth-child(2)').css('border-right', '0.01rem solid #929091')
      $('.charts_btn ul li:nth-child(3)').css('border-right', '0.01rem solid #FFAC12')
      chartdata(4)
      showechart()
    }
    $(this).addClass('btn_active')
    $(this).siblings().removeClass('btn_active')
  })
}

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

// 调仓渲染
function wareHouse() {
  var param = {combinationCode: getUrlParam('combinationCode')};
  $.ajax({
    url: '/codi-api/h5/portfolio/query_recent_transfer',
    data: param,
    dataType: 'json',
    type: 'get',
    error: function (err) {
      console.log(err)
      if (err) {
        mui.toast(err.statusText);
        return;
      }
    },
    success: function (data) {
      console.log(data)
      if (data.result) {
        var wareHousedata = data.result
        var begindate = wareHousedata.beginDate.substring(0, 10)
        $('.warehouse_list_t').html("<div>最近调仓</div><div>" + begindate + "</div>")
        var transferReason = wareHousedata.transferReason
        $('.warehouse_list_con').html(transferReason)
        var transferlist = wareHousedata.mappings
        var transferliststring = "<ul>"
        for (var i = 0; i < transferlist.length; i++) {
          transferliststring += "<li onclick=\"loadToDetail('/page/fund/fundDetail?fundCode=" + transferlist[i].fundCode + "&fundName=" + transferlist[i].fundName + "')\">" +
            "          <p class='name'>" + transferlist[i].fundName + "</p>" +
            "          <span class='type_num'>" + transferlist[i].fundCode + transferlist[i].fundType + "</span>" +
            "          <p class='proportion_old'>" + transferlist[i].percentBefore + "%</p>" +
            "          <p class='list_arrow'></p>" +
            "          <p class='proportion'>" + transferlist[i].percentNow + "%</p>" +
            "          <p class='list_icon'></p>" +
            "        </li>"
        }
        transferliststring += "</ul>"
        $('.warehouse_list_b .list_data').html(transferliststring)
        $('.warehouse_btn span').html("<span>查看调仓历史></span>")
        $('.warehouse_btn span').on('click', function () {
          window.location = '/page/fund/warehouseHistory?combinationCode=' + getUrlParam('combinationCode')
        })
      }
      else {
        $('.warehouse_list').html('')
      }
    }
  });

}

function loadToDetail(url) {
  localStorage.setItem('sourceToFundDetail', window.location.pathname + window.location.search)
  window.location = url;
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}

var userBuyFundInfo = {};

function getUserFundInfo() {
  $.ajax({
    url: '/codi-api/h5/portfolio/goBuy',
    data: {
      portfolioCode: combinationDetail.combinationCode
    },
    dataType: 'json',
    type: 'get',
    headers: token,
    success: function (data) {
      userBuyFundInfo = data;
    }
  });
}

getUserFundInfo();


function initbtn() {
  $('.bum_btn').on('click', function () {
    console.log(combinationDetail)
    var fundCodesStr = ''
    var portfolioCode = combinationDetail.combinationCode
    var combinationName = combinationDetail.combinationName
    var fundNamelist = ''
    var fundCodelist = ''
    var persent = ''
    var datalist = combinationDetail.fundInfoCombinationResults
    for (var i = 0; i < datalist.length; i++) {
      fundCodesStr += datalist[i].fundCode + "|" + datalist[i].fundPercent + "|"
      fundNamelist += datalist[i].fundName + ','
      fundCodelist += datalist[i].fundCode + ','
      persent += datalist[i].fundPercent + ','
      if (i = datalist.length - 1) {
        fundCodesStr += datalist[i].fundCode + "|" + datalist[i].fundPercent
        fundNamelist += datalist[i].fundName
        fundCodelist += datalist[i].fundCode
        persent += datalist[i].fundPercent
      }
    }
    // fundCodesStr = fundCodesStr.substr(0, fundCodesStr.Length - 1)
    // fundNamelist = fundNamelist.substr(0, fundNamelist.Length - 1)
    // fundCodelist = fundCodelist.substr(0, fundCodelist.Length - 1)
    // persent = persent.substr(0, persent.Length - 1)

    if (userBuyFundInfo.success == true) {
      localStorage.setItem('sourceToPortfolioBuy', window.location.pathname + window.location.search)
      window.location = addqueryarg('/page/combination/combinationBuy', {
        portfolioCode: portfolioCode,
        combinationName: combinationName,
        fundCodesStr: fundCodesStr,
        fundNamelist: fundNamelist,
        fundCodelist: fundCodelist,
        persent: persent
      });
    } else if (userBuyFundInfo.errorCode == 3102) {
      mui.toast('组合不存在')
    } else if (userBuyFundInfo.errorCode == 1033) {
      var btnArray = ['取消', '去开户'];
      mui.confirm('请先进行开户', '', btnArray, function (e) {
        if (e.index == 1) {
          localStorage.setItem('sourceToOpenAccount', window.location.pathname + window.location.search);
          window.location = '/page/public/openAccount'
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
  var sourceToPortfolioDetail = localStorage.getItem('sourceToPortfolioDetail');
  if (sourceToPortfolioDetail) {
    localStorage.removeItem('sourceToPortfolioDetail')
    window.location = sourceToPortfolioDetail;
  } else {
    window.history.go(-1);
  }
}

$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl);

