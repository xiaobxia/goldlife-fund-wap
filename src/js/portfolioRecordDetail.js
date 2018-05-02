/**
 * Created by xiaobxia on 2018/3/22.
 */
window.onload = function () {
  mui.init();
  var token = getToken();
  var queryString = getQueryStringArgs();
  queryString = JSON.parse(queryString.data)
  var tradePassword = '';
  console.log(queryString)

  $('#next-btn').on('tap', function () {
    if (!$('#next-btn').hasClass('disabled')) {
      activePasswordPopup();
    }
  })

  function undo() {
    showToast();
    $.ajax({
      url: '/codi-api/h5/portfolio/undo',
      data: {
        allotNo: queryString.allotNo,
        applyNo: moment().format('yyyyMMddHHmmssSSS'),
        tradePassword: tradePassword,
        portfolioAllotNo: queryString.portfolioAllotNo,
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
        console.log(data)
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        mui.toast('撤单成功');
        setTimeout(function () {
          window.location ='/page/assets/portfolio/records';
        }, 2000)
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
    undo();
    console.log(value);
  });
}
