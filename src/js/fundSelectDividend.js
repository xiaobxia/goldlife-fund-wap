/**
 * Created by xiaobxia on 2018/3/12.
 */
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  var tradePassword = '';
  var autoBuy = queryString.autoBuy;
  /**
   * 选择逻辑
   */
  $('#select').on('tap', '.mui-table-view-cell', function () {
    console.log($(this).attr('data-index-value'));
    autoBuy = $(this).attr('data-index-value');
    $('#select .mui-table-view-cell').removeClass('active');
    $(this).addClass('active');
  });

  /**
   * 点击确认
   */
  $('#confirm-btn').on('tap', function () {
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
    change();
    console.log($.trim($('#password-input').val()))
  });

  function change() {
    showToast();
    $.ajax({
      url: '/codi-api/h5/assets/saveFundBonus',
      data: {
        tradeAcco: queryString.tradeAcco,
        taAcco: queryString.taAcco,
        fundCode: queryString.fundCode,
        autoBuy: autoBuy,
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
        mui.toast('分红方式修改成功');
        window.location = '/page/assets/fund';
        // var sourceToSelectDividend = localStorage.getItem('sourceToSelectDividend')
        // var path = sourceToSelectDividend.substring(0, sourceToSelectDividend.indexOf('?'));
        // window.location = addqueryarg(path, {
        //   ...getQueryStringArgs(sourceToSelectDividend.substring(sourceToSelectDividend.indexOf('?')+1)),
        //   autoBuy
        // });
        // $('#estimateCost').html(renderEstimateCost(data));
        console.log(data);
      }
    });
  }

  // $('#confirm-btn').on('tap', function () {
  //   window.location = '/page/assets/fund/selectDividendResult'
  // })
};
