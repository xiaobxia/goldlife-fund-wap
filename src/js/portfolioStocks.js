/**
 * Created by xiaobxia on 2018/3/23.
 */
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  var tradePassword = '';
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
    stock();
    console.log(value);
  });

  $('#next-btn').on('tap', function () {
    activePasswordPopup();
  });

  function stock() {
    showToast();
    $.ajax({
      url: '/codi-api/h5/assets/portfolio/sureTransfer',
      data: {
        portfolioTradeAcco: queryString.portfolioTradeAcco,
        portfolioCode: queryString.portfolioCode,
        transferId: queryString.transferId,
        password: tradePassword,
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
        }
        mui.toast('调仓申请提交成功');
        setTimeout(function () {
          window.history.go(-1);
        }, 2000)
      }
    });
  }
}
