/**
 * Created by xiaobxia on 2018/3/20.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToFundBuy = localStorage.getItem('sourceToFundBuy');
  if (sourceToFundBuy) {
    localStorage.removeItem('sourceToFundBuy')
    window.location = sourceToFundBuy;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  var payWayNow = payWay[recommendIndex];
  var tradePassword = '';


  function verifyFormData(data, all) {
  }

  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  /**
   * 选择支付方式
   */
  function selectPay() {
    $('.mui-popup-backdrop').addClass('mui-active');
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
  }

  $('#select-pay').on('tap', selectPay);
  $('.mui-popover .mui-icon').on('tap', function () {
    $('.mui-popup-backdrop').removeClass('mui-active');
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
    if (payWayNow.payType === 'OFFLINE') {
      $('.offline-info').addClass('active');
    } else {
      $('.offline-info').removeClass('active');
    }
    setTimeout(function () {
      $('.mui-popup-backdrop').removeClass('mui-active');
      $('.mui-popover').removeClass('mui-active');
      $('#select-pay').html($this.html());
      $('#select-pay span').attr('class', 'mui-navigate-right');
    }, 300)
  });


  /**
   * 预估费用
   */
  queryEstimateCost();
  function renderEstimateCost(data) {
    return `<span>预估手续费</span><span class="through">${data.origin_fee}</span><span class="red-text">${data.fee}元（省${data.discount_fee}元）</span>`
  }

  function queryEstimateCost() {
    var value = $.trim($('#balance-input').val());
    if (value.length === 0) {
      $('#estimateCost').html('');
      return;
    }
    $.ajax({
      url: '/codi-api/h5/fund/estimateCost',
      data: {
        fundCode: queryString.fundCode,
        balance: value
      },
      dataType: 'json',
      headers: token,
      type: 'get',
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        if (!data.success === true) {
          if (data.errorMessage==='未找到该基金当前金额对应的费率') {
            $('#estimateCost').html('');
            return;
          }
          mui.toast(data.errorMessage);
          return;
        }
        $('#estimateCost').html(renderEstimateCost(data));
        console.log(data);
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
      mui.toast('请输入买入金额');
      return;
    }
    if (limits[0] && limits[0].minValue !== -1 && value < limits[0].minValue) {
      mui.confirm(`最低买入金额为${limits[0].minValue}元`, '', ['取消', '确定'], function (e) {
      });
      return;
    }
    if (payWayNow.payType === "OFFLINE" && value < payWayNow.singleDealMinValue) {
      mui.confirm(`汇款支付买入金额需大于等于${payWayNow.singleDealMinValue}元`, '', ['取消', '其他付款方式'], function (e) {
        if (e.index === 1) {
          selectPay();
        }
      });
      return;
    }
    if (payWayNow.singleDealMaxValue !== -1 && value > payWayNow.singleDealMaxValue) {
      mui.confirm(`银行限定单笔交易不能超过${payWayNow.singleDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
      return;
    }

    if (payWayNow.dayDealRetainMaxValue !== -1 && value > payWayNow.dayDealRetainMaxValue) {
      mui.confirm(`银行限定单日交易不能超过${payWayNow.dayDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
      return;
    }

    if (payWayNow.monthDealRetainMaxValue !== -1 && value > payWayNow.monthDealRetainMaxValue) {
      mui.confirm(`银行限定单日交易不能超过${payWayNow.monthDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
      return;
    }
    if(userInv.userRisk === '1' && queryString.riskLevel>'1') {
      mui.confirm(`您所选择的基金：【${queryString.fundName}】，风险等级为【${queryString.riskLevelString}】与您的风险等级【${userInv.userRiskDesc}】不匹配，高出您的风险承受能力。`, '风险警示', ['取消', '重做测评'], function (e) {
        if (e.index === 1) {
          localStorage.setItem('sourceToAssessRisk',window.location.pathname+window.location.search)
          window.location = '/page/user/assessResult'
        }
      });
      $('.mui-popup-title').css({
        display: 'block'
      });
      return;
    }
    if (queryString.riskLevel > userInv.userRisk) {
      mui.confirm(`${queryString.fundName}的风险等级为（${queryString.riskLevelString}），超出你当前的风险承受能力（${userInv.userRiskDesc}）。如点击继续购买，视为自愿承担该产品风险，请慎重考虑30秒。`, '风险警示', ['取消', '30s'], function (e) {
        if (e.index === 1) {
          if ($('.mui-popup-button-bold').text() === '继续购买') {
            showPasswordWap();
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
    // 没有啥提示那就显示
    showPasswordWap();
  });
  /**
   * 显示密码框
   */
  function showPasswordWap() {
    activePasswordPopup();
  }

  function buy() {
    var value = $.trim($('#balance-input').val());
    $('#password-input').val('');
    var postData = {
      payType: payWayNow.payType,
      fundCode: queryString.fundCode,
      fundName: queryString.fundName,
      fundBalance: value,
      tradeAcco: payWayNow.tradeAcco,
      applyNo: moment().format('yyyyMMddHHmmssSSS'),
      tradePassword: tradePassword,
      sign: Math.random()
    };
    if (payWayNow.payType === 'T0') {
      postData.orginFundCode = payWayNow.fundCode
    }
    showToast();
    $.ajax({
      url: '/codi-api/h5/fund/sureBuy',
      data: postData,
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
        }
        window.location = addqueryarg('/page/fund/fundBuyResult', {
          payType: payWayNow.payType,
          fundName: queryString.fundName,
          fundBalance: data.result.balanceString,
          bankName: payWayNow.bankName,
          bankAccount: payWayNow.bankNo,
          orderDate: data.result.orderDate,
          orderTime: data.result.orderTime
        });
        // $('#estimateCost').html(renderEstimateCost(data));
        console.log(data);
      }
    });
  }

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
    var value = $.trim($('#password-input').val());
    var len = value.length;
    if (len < 6) {
      mui.toast('请输入密码');
      return;
    }
    value = value.substr(0, 6);
    setTimeout(function () {
      hidePasswordPopup();
    }, 200)
    tradePassword = value;
    buy();
    console.log(value);
  });


};
