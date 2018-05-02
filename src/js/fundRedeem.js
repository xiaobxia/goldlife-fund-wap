/**
 * Created by xiaobxia on 2018/3/13.
 */

/**
 * 返回
 */
function backToLastUrl() {
  var sourceToFundRedeem = localStorage.getItem('sourceToFundRedeem');
  if (sourceToFundRedeem) {
    localStorage.removeItem('sourceToFundRedeem')
    window.location = sourceToFundRedeem;
  } else {
    window.history.go(-1);
  }
}

window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  var tradePassword = '';
  console.log(queryString)
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl)

  //选择支行
  $('#selectSunBranch-btn').on('tap', function () {
    localStorage.setItem('sourceToSelectSubBranch', window.location.pathname + window.location.search);
    window.location = `/page/public/selectSubBranch?bankName=${queryString.bankName}`
  });
  /**
   * 快速填充全部
   */
  $('#quick-btn').on('tap', function () {
    $('#shares-input').val(parseFloat(queryString.enableShares));
  });

  function verifyData() {
    if (!((queryString.vcBranchbank || queryString.branchBank) && (queryString.vcBankname || queryString.branchBankName))) {
      mui.toast('请选择支行');
      return false;
    }
    var value = $('#shares-input').val();
    console.log(value)
    if (!value) {
      mui.toast('请输入赎回份额');
      return false;
    }
    if (value > parseFloat(queryString.enableShares)) {
      mui.toast('输入份额大于可赎回份额');
      return false;
    }
    if (value - parseFloat(queryString.enableShares) === 0) {
      //可以赎回全部
      return true;
    }
    if(limits.minValue === undefined) {
      return true;
    }
    if (value < limits.minValue || value > limits.maxValue) {
      mui.toast(`赎回份额不能小于${limits.minValue}份,不能大于${limits.maxValue}份`);
      return false;
    }
    if (parseFloat(queryString.enableShares) - value < limits.minHoldShares) {
      mui.toast('剩余份额小于最低可持有份额，请全部赎回');
      return false;
    }
    return true;
  }

  /**
   * 输入密码
   */
  $('#redeem-btn').on('tap', function () {
    if (!verifyData()) {
      return;
    }
    activePasswordPopup();
  });
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
    redeem();
    console.log(value);
  });

  function redeem() {
    showToast();
    $.ajax({
      url: '/codi-api/h5/assets/fund/sureWithdraw',
      data: {
        bankAccount: queryString.bankAccount,
        fundName: queryString.fundName,
        fundCode: queryString.fundCode,
        shares: $('#shares-input').val(),
        tradePassword: tradePassword,
        applyNo: moment().format('yyyyMMddHHmmssSSS'),
        vcBranchbank: queryString.vcBranchbank || queryString.branchBank,
        vcBankname: queryString.vcBankname || queryString.branchBankName
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
        window.location = addqueryarg('/page/assets/fund/redeemResult', {
          fundName: queryString.fundName,
          shares: $('#shares-input').val(),
          bankName: queryString.bankName,
          bankAccount: queryString.bankAccount,
          orderDate: moment().format('YYYY-MM-DD'),
          orderTime: moment().format('HH:mm:ss')
        })
      }
    });
  }
};
