// 用户风险等级
var userRisk
var userRiskstr
// 组合风险等级
var fundRisk
var fundRiskstr
var queryString = getQueryStringArgs();

var token = getToken();
window.onload = function () {
  mui.init();

  var payWayNow = payWay[0];
  var tradePassword = '';
  // initclick()
  queryEstimateCost()
  var password = ''

  riskCheck()
  function verifyFormData(data, all) {
  }

  /**
   * 选择支付方式
   */
  $('#select-pay').on('tap', function () {
    $('.mui-backdrop ').addClass('mui-active');
    $('.mui-popover').addClass('mui-active');
    var value = $.trim($('#balance-input').val());
    value = value || 0;
    for (var i = 0; i < payWay.length; i++) {
      var flag = payWay[i].canUse;
      if (payWay[i].singleDealMaxValue !== -1 && payWay[i].singleDealMaxValue < value) {
        flag = false;
      }
      if (payWay[i].dayDealRetainMaxValue !== -1 && payWay[i].dayDealRetainMaxValue < value) {
        flag = false;
      }
      if (payWay[i].monthDealRetainMaxValue !== -1 && payWay[i].monthDealRetainMaxValue < value) {
        flag = false;
      }
      if (flag === false) {
        $('.mui-popover .mui-table-view-cell').eq(i).attr('data-canuse', flag);
      }
    }
  });
  $('.mui-popover .mui-icon').on('tap', function () {
    $('.mui-backdrop ').removeClass('mui-active');
    $('.mui-popover').removeClass('mui-active');
  });

  /**
   * 具体选择
   */
  /**
   * 选择逻辑
   */
  $('.mui-popover').on('tap', '.mui-table-view-cell', function () {
    console.log($(this).attr('data-canUse'))
    if ($(this).attr('data-canUse') === 'false') {
      return
    }
    $('.mui-popover .mui-table-view-cell').removeClass('active');
    $(this).addClass('active');
    var $this = $(this);
    var index = $this.attr('data-index');
    payWayNow = payWay[index];
    setTimeout(function () {
      $('.mui-backdrop ').removeClass('mui-active');
      $('.mui-popover').removeClass('mui-active');
      $('#select-pay').html($this.html());
      $('#select-pay span').attr('class', 'mui-navigate-right');
    }, 300)
  });


  /**
   * 预估费用
   */
  function renderEstimateCost(fundName, paynumlist, data) {
    var htmlstring = ''
    for (var i = 0; i < data.length; i++) {
      htmlstring += '<div>' +
        '  <div class="fund_pay_main_top">' +
        '    <div>' + fundName[i] + '</div>' +
        '    <div>' + paynumlist[i] + '</div>' +
        '  </div>' +
        '  <div class="fund_pay_main_bot">' +
        '    <div>' + data[i].fundCode + '</div>' +
        '    <div>' + data[i].fee + '</div>' +
        '  </div>' +
        '</div>'
    }
    return htmlstring
  }

  function queryEstimateCost() {
    var value = $.trim($('#balance-input').val());
    var Namelist = fundNamelist.split(',')
    var Codelist = fundCodelist.split(',')
    var persentlist = persent.split(',')
    var fundCodesStr = ''
    var paynum = 0
    var paynumlist = []
    for (var i = 0; i < Namelist.length; i++) {
      paynum = parseFloat(persentlist[i] * value / 100).toFixed(2)
      paynumlist[i] = paynum
      if (i == Namelist.length - 1) {
        fundCodesStr += Codelist[i] + '|' + paynum
      } else {
        fundCodesStr += Codelist[i] + '|' + paynum + '|'
      }
    }
    $.ajax({
      url: '/codi-api/h5/portfolio/estimateCost',
      data: {
        fundCodesStr: fundCodesStr
      },
      dataType: 'json',
      headers: token,
      type: 'get',
      success: function (data) {
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        $('.fund_pay_num span').html(data.result.fee + '元')
        $('.fund_pay_main').html(renderEstimateCost(Namelist, paynumlist, data.result.portfolio));
        //console.log(data);
      }
    });
  }

  // 输入时查
  var onBalanceChangeHandler = debounce(queryEstimateCost, 600);
  $('#balance-input').on('keyup', onBalanceChangeHandler);


  /**
   * 点击验证逻辑
   */
  var timer = null;
  $('#buy-btn').on('tap', function () {
    var value = $.trim($('#balance-input').val());


    if (!value) {
      mui.toast('请输入购买金额');
      return false
    }
    if (value > payWayNow.singleDealMaxValue && payWayNow.singleDealMaxValue != -1) {
      mui.confirm(`银行限定单笔交易不能超过${payWayNow.singleDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
      return false
    }

    if (value > payWayNow.dayDealRetainMaxValue && payWayNow.dayDealRetainMaxValue != -1) {
      mui.confirm(`银行限定单日交易不能超过${payWayNow.dayDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
      return false
    }

    if (value > payWayNow.monthDealRetainMaxValue && payWayNow.monthDealRetainMaxValue != -1) {
      mui.confirm(`银行限定单日交易不能超过${payWayNow.monthDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
      return false
    }

    if (value < limits.minValue) {
      mui.toast('购买金额不能少于' + limits.minValue)
      return false
    }
    console.log(userRisk + '-' + userRiskstr + '-' + fundRisk + '-' + fundRiskstr)

    if (userRisk == 1 && fundRisk > 1) {
      mui.confirm(`你所选的基金:（${combinationName}）,风险等级为（${fundRiskstr}）与您的风险等级（${userRiskstr}）不匹配,高出你的风险承受能力.`, '风险警示', ['取消', '重做测评'], function (e) {
        if (e.index === 1) {
          localStorage.setItem('sourceToAssessRisk', window.location.pathname + window.location.search)
          window.location = '/page/user/assessResult'
        }
      });
      $('.mui-popup-title').css({
        display: 'block'
      });
      return;
    }
    else if (userRisk < fundRisk) {
      mui.confirm(`该组合的风险等级为（${fundRiskstr}），超出你当前的风险承受能力（${userRiskstr}）。如点击继续购买，视为自愿承担该产品风险，请慎重考虑30秒。`, '风险警示', ['取消', '30s'], function (e) {
        if (e.index === 1) {
          if ($('.mui-popup-button-bold').text() === '继续购买') {
            activePasswordPopup();
          } else {
            return false;
          }
        }
        clearInterval(timer)
      });
      $('.mui-popup-title').css({
        display: 'block'
      })
      var now = 30;
      timer = setInterval(function () {
        now--;
        if (now === 0) {
          clearInterval(timer)
          $('.mui-popup-button-bold').text('继续购买');
          return;
        }
        $('.mui-popup-button-bold').text(now + 's');
      }, 1000);
      return;
    }

    activePasswordPopup();
    // var value = $('#balance-input').val();
    // $.ajax({
    //   url: '/codi-api/h5/fund/sureBuy',
    //   data: {
    //     payType: payWayNow.payType,
    //     fundCode: queryString.fundCode,
    //     fundName: queryString.fundName,
    //     fundBalance: value,
    //     tradeAcco: payWayNow.tradeAcco,
    //     applyNo: moment().format('yyyyMMddHHmmssSSS'),
    //     tradePassword: 333564,
    //     sign: Math.random()
    //   },
    //   dataType: 'json',
    //   headers: token,
    //   type: 'post',
    //   success: function (data) {
    //     if (!data.success === true) {
    //       mui.toast(data.errorMessage);
    //       return;
    //     }
    //     // $('#estimateCost').html(renderEstimateCost(data));
    //     console.log(data);
    //   }
    // });
  });

  /**
   * 输入密码
   */
  $('#password-input').on('keyup', function () {
    var value = $.trim($('#password-input').val());
    var len = value.length;
    value = value.substr(0, 6);
    $('.box-item').removeClass('active');
    for (var i = 0; i < len; i++) {
      $('.box-item').eq(i).addClass('active')
    }
    console.log(value)
    console.log(value.length)
    password = value
  });

  /**
   * 密码取消
   */
  $('.password-popup-buttons .cancel').on('tap', function () {
    hidePasswordPopup();
  });
  /**
   * 密码确认
   */
  $('.password-popup-buttons .confirm').on('tap', function () {


    setTimeout(function () {
      hidePasswordPopup();
    }, 200)
    tradePassword = $.trim($('#password-input').val());
    console.log($.trim($('#password-input').val()))


    var value = $.trim($('#balance-input').val());
    showToast();
    $.ajax({
      url: '/codi-api/h5/portfolio/sureBuy',
      data: {
        payType: payWayNow.payType,
        tradeAcco: payWayNow.tradeAcco,
        portfolioCode: portfolioCode,
        balance: value,
        applyNo: moment().format('yyyyMMddHHmmssSSS'),
        tradePassword: tradePassword,
        sign: Math.random()
      },
      dataType: 'json',
      headers: token,
      type: 'post',
      error: function (err) {
        console.log(err)
        hideToast();
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        hideToast();
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        } else {
          mui.toast('购买成功');
          window.location = addqueryarg('/page/combination/combinationResult', {
            ...data,
            ...payWayNow,
            value,
            ...queryString
          })
        }
        // $('#estimateCost').html(renderEstimateCost(data));
        console.log(data);
      }
    });
  });


  $(".fund_pay_num").click(function () {
    console.log($(this).next())
    if ($(this).children().hasClass("rotate")) { //点击箭头旋转180度
      console.log(1)
      $(this).children().removeClass("rotate");
      $(this).children().addClass("rotate1");
      $('.slide').slideToggle()
    } else {
      console.log(2)
      $(this).children().removeClass("rotate1"); //再次点击箭头回来
      $(this).children().addClass("rotate");
      $('.slide').slideToggle()
    }
  })

  $(".title_message input").on('click', function () {
    console.log(this.checked)
    if (this.checked == true) {
      $("#buy-btn").css('background-color', '#FFAA01')
      var timer = null;
      $('#buy-btn').on('tap', function () {
        var value = $.trim($('#balance-input').val());


        if (!value) {
          mui.toast('请输入购买金额');
          return false
        }
        if (value > payWayNow.singleDealMaxValue && payWayNow.singleDealMaxValue != -1) {
          mui.confirm(`银行限定单笔交易不能超过${payWayNow.singleDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
          });
          return false
        }

        if (value > payWayNow.dayDealRetainMaxValue && payWayNow.dayDealRetainMaxValue != -1) {
          mui.confirm(`银行限定单日交易不能超过${payWayNow.dayDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
          });
          return false
        }

        if (value > payWayNow.monthDealRetainMaxValue && payWayNow.monthDealRetainMaxValue != -1) {
          mui.confirm(`银行限定单日交易不能超过${payWayNow.monthDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
          });
          return false
        }

        if (value < limits.minValue) {
          mui.toast('购买金额不能少于' + limits.minValue)
          return false
        }
        console.log(userRisk + '-' + userRiskstr + '-' + fundRisk + '-' + fundRiskstr)

        if (userRisk == 1 && fundRisk > 1) {
          mui.confirm(`你所选的基金:（${combinationName}）,风险等级为（${fundRiskstr}）与您的风险等级（${userRiskstr}）不匹配,高出你的风险承受能力.`, '风险警示', ['取消', '重做测评'], function (e) {
            if (e.index === 1) {
              localStorage.setItem('sourceToAssessRisk', window.location.pathname + window.location.search)
              window.location = '/page/user/assessResult'
            }
          });
          $('.mui-popup-title').css({
            display: 'block'
          });
          return;
        }
        else if (userRisk > fundRisk) {
          mui.confirm(`该组合的风险等级为（${fundRiskstr}），超出你当前的风险承受能力（${userRiskstr}）。如点击继续购买，视为自愿承担该产品风险，请慎重考虑30秒。`, '风险警示', ['取消', '30s'], function (e) {
            if (e.index === 1) {
              if ($('.mui-popup-button-bold').text() === '继续购买') {
                activePasswordPopup();
              } else {
                return false;
              }
            }
            clearInterval(timer)
          });
          $('.mui-popup-title').css({
            display: 'block'
          })
          var now = 30;
          timer = setInterval(function () {
            now--;
            if (now === 0) {
              clearInterval(timer)
              $('.mui-popup-button-bold').text('继续购买');
              return;
            }
            $('.mui-popup-button-bold').text(now + 's');
          }, 1000);
          return;
        }

        activePasswordPopup();
        // var value = $('#balance-input').val();
        // $.ajax({
        //   url: '/codi-api/h5/fund/sureBuy',
        //   data: {
        //     payType: payWayNow.payType,
        //     fundCode: queryString.fundCode,
        //     fundName: queryString.fundName,
        //     fundBalance: value,
        //     tradeAcco: payWayNow.tradeAcco,
        //     applyNo: moment().format('yyyyMMddHHmmssSSS'),
        //     tradePassword: 333564,
        //     sign: Math.random()
        //   },
        //   dataType: 'json',
        //   headers: token,
        //   type: 'post',
        //   success: function (data) {
        //     if (!data.success === true) {
        //       mui.toast(data.errorMessage);
        //       return;
        //     }
        //     // $('#estimateCost').html(renderEstimateCost(data));
        //     console.log(data);
        //   }
        // });
      });
    } else {
      $("#buy-btn").css('background-color', '#CCCCCC')
      $('#buy-btn').unbind()
    }
  })
};

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


function riskCheck() {
  $.ajax({
    url: '/codi-api/h5/mine/paper/test_result',
    data: {},
    dataType: 'json',
    type: 'get',
    async: false,
    headers: token,
    success: function (data) {
      userRisk = data.result.invest_risk_tolerance
      userRiskstr = data.result.invest_risk_tolerance_desc
    }
  });

  $.ajax({
    url: '/codi-api/h5/portfolio/risk_detail',
    data: {
      combinationCode: portfolioCode
    },
    dataType: 'json',
    type: 'get',
    async: false,
    headers: token,
    success: function (data) {
      fundRisk = data.result.result.riskLevel
      fundRiskstr = data.result.result.riskLevelStr
    }
  });
}
