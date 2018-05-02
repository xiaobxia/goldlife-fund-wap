/**
 * Created by xiaobxia on 2018/3/8.
 */
/**
 * 返回
 */
function backToLastUrl() {
  window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();

  function getFormData() {
    return {
      userName: $.trim($('#userName-input').val()),
      userCard: $.trim($('#userCard-input').val()),
      tradePassword: $.trim($('#tradePassword-input').val())
    }
  }

  function verifyFormData(data) {
    var userCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    var tradePasswordReg = /^\d{6}$/;
    if (!data.userName) {
      mui.toast('姓名格式不正确');
      return false;
    }
    if (!data.userCard || !userCardReg.test(data.userCard)) {
      mui.toast('身份证号码格式不正确');
      return false;
    }
    if (!data.tradePassword || !tradePasswordReg.test(data.tradePassword)) {
      mui.toast('交易密码格式应为6位数字');
      return false;
    }
    var one = data.tradePassword[0];
    var flag = true;
    for (var i = 1; i < data.tradePassword.length; i++) {
      if (data.tradePassword[i] !== one) {
        flag = false;
      }
    }
    if (flag) {
      mui.toast('交易密码不能为全部相同的数字');
      return false;
    }
    return true;
  }

  /**
   * 可以根据queryString填充数据
   */
  function renderFromData() {
    queryString.userName && $('#userName-input').val(queryString.userName);
    queryString.userCard && $('#userCard-input').val(queryString.userCard);
    queryString.tradePassword && $('#tradePassword-input').val(queryString.tradePassword);
  }

  renderFromData();


  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  /**
   * 下一步
   */
  $('#next-btn').on('tap', function () {
    var formData = getFormData();
    // 验证表单
    if (verifyFormData(formData) === false) {
      return;
    }

    var pageInfo = {
      ...formData
    };
    localStorage.setItem('sourceToOpenAccountStep2', addqueryarg(window.location.pathname,
      pageInfo));
    window.location = addqueryarg('/page/public/openAccount/openAccountStep2',
      pageInfo)
  });
};
