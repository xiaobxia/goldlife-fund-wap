/**
 * Created by xiaobxia on 2018/3/22.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToRuifubaoWithdraw = localStorage.getItem('sourceToRuifubaoWithdraw');
  if (sourceToRuifubaoWithdraw) {
    localStorage.removeItem('sourceToRuifubaoWithdraw')
    window.location = sourceToRuifubaoWithdraw;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  var tradePassword = '';

  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);
  //默认提现方式
  var withdrawType = '1';
  console.log(resResult)
  function verifyFormData(value) {
    if (!((queryString.vcBranchbank || resResult.branchBank) && (queryString.vcBankname || resResult.branchBankName))) {
      mui.toast('请选择支行');
      return false;
    }
    if (!value) {
      mui.toast('请输入提现金额');
      return false;
    }
    if (resResult.enableShare < value) {
      mui.toast('最大可用金额' + resResult.enableShare + '元');
      return false;
    }
    if (withdrawType === '1' && resResult.maxValueForFastSell < value) {
      mui.toast('快速提现最大金额' + resResult.maxValueForFastSell + '元');
      return false;
    }
    if (withdrawType === '2' && resResult.maxValueForSell < value) {
      mui.toast('普通提现最大金额' + resResult.maxValueForSell + '元');
      return false;
    }
    if (resResult.minValue > value) {
      mui.toast('最小提现金额' + resResult.minValue + '元');
      return false;
    }
    return true;
  }

  /**
   * 选择逻辑
   */
  $('#select').on('tap', '.mui-table-view-cell', function () {
    console.log($(this).attr('data-index-value'));
    withdrawType = $(this).attr('data-index-value');
    if (withdrawType === '2') {
      $('#xieyi').addClass('hidden');
    } else {
      $('#xieyi').removeClass('hidden');
    }
    $('#select .mui-table-view-cell').removeClass('active');
    $(this).addClass('active');
  });

  /**
   * 点击确认
   */
  $('#next-btn').on('tap', function () {
    var value = $.trim($('#shares-input').val());
    if (!verifyFormData(value)) {
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

  //选择支行
  $('#selectSunBranch-btn').on('tap', function () {
    localStorage.setItem('sourceToSelectSubBranch', window.location.pathname + window.location.search);
    window.location = `/page/public/selectSubBranch?bankName=${resResult.bankName}`
  });

  /**
   * 全部
   */
  $('#all-btn').on('tap', function () {
    $('#shares-input').val(resResult.enableShare);
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
    $('#password-input').val('')
    change();
    console.log($.trim($('#password-input').val()))
  });

  function change() {
    showToast();
    $.ajax({
      url: '/codi-api/h5/ruifubao/sureWithdraw',
      data: {
        bankAccount: resResult.bankAccount,
        vcBranchbank: ueryString.vcBranchbank || resResult.branchBank,
        vcBankname: queryString.vcBankname || resResult.branchBankName,
        fundCode: queryString.fundCode,
        shares: $.trim($('#shares-input').val()),
        fundName: queryString.fundName,
        withdrawType: withdrawType,
        tradePassword: tradePassword,
        applyNo: moment().format('yyyyMMddHHmmssSSS'),
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
        mui.toast('赎回成功');
        window.location = '/page/ruifu/withdrawResult?type=' + (withdrawType === '1' ? 'fast' : 'normal')
        // $('#estimateCost').html(renderEstimateCost(data));
        console.log(data);
      }
    });
  }

  // $('#confirm-btn').on('tap', function () {
  //   window.location = '/page/assets/fund/selectDividendResult'
  // })
};
