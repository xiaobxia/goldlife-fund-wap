/**
 * Created by xiaobxia on 2018/3/20.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToRuifubaoBuy = localStorage.getItem('sourceToRuifubaoBuy');
  if (sourceToRuifubaoBuy) {
    localStorage.removeItem('sourceToRuifubaoBuy')
    window.location = sourceToRuifubaoBuy;
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
      $('.mui-popover .mui-table-view-cell').eq(i).attr('data-canuse', flag);
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
   * 点击验证逻辑
   */
  $('#buy-btn').on('tap', function () {
    var value = $.trim($('#balance-input').val());
    if (!value) {
      mui.toast('请输入买入金额');
      return;
    }

    if (limits[0] && limits[0].minValue !==-1 && value < limits[0].minValue) {
      mui.confirm(`最低买入金额为${limits[0].minValue}元`, '', ['取消', '确定'], function (e) {
      });
      return;
    }
    if (payWayNow.payType === "OFFLINE" && value < payWayNow.singleDealMinValue) {
      mui.confirm(`汇款支付买入金额需大于等于${payWayNow.singleDealMinValue}元`, '', ['取消', '其他付款方式'], function (e) {
        if (e.index == 1) {
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

    activePasswordPopup();
  });

  /**
   * 发起买入
   */
  function buy() {
    var value = $.trim($('#balance-input').val());
    $('#password-input').val('');
    showToast();
    $.ajax({
      url: '/codi-api/h5/ruifubao/sureBuy',
      data: {
        payType: payWayNow.payType,
        fundCode: queryString.fundCode,
        fundName: queryString.fundName,
        fundBalance: value,
        tradeAcco: payWayNow.tradeAcco,
        applyNo: moment().format('yyyyMMddHHmmssSSS'),
        tradePassword: tradePassword,
        sign: Math.random()
      },
      dataType: 'json',
      headers: token,
      type: 'post',
      error: function (err) {
        hideToast();
        console.log(err)
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
        window.location = addqueryarg('/page/ruifu/ruifuBuyResult', {
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
  // $('#buy-btn').on('tap', function () {
  //
  // });
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
