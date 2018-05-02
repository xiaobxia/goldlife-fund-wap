/**
 * Created by xiaobxia on 2018/3/8.
 */
/**
 * 返回
 */
function backToLastUrl(e) {
  var sourceToOpenAccountStep2 = localStorage.getItem('sourceToOpenAccountStep2');
  if (sourceToOpenAccountStep2) {
    localStorage.removeItem('sourceToOpenAccountStep2')
    window.location = sourceToOpenAccountStep2;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  var bankInfo = {};
  var paySignOneInfo = {
    originalSerialNo: '',
    smsSerialNo: ''
  };

  function getFormData() {
    return {
      userCard: queryString.userCard || '',
      userName: queryString.userName || '',
      tradePassword: queryString.tradePassword || '',
      vcBankname: queryString.vcBankname || '',
      vcBranchbank: queryString.vcBranchbank || '',
      userBankNo: $.trim($('#userBankNo-input').val()) || '',
      userBankMobile: $.trim($('#userBankMobile-input').val()) || '',
      mobileCode: $.trim($('#mobileCode-input').val()) || '',
      bankName: bankInfo.bankName || '',
      bankCode: bankInfo.bankCode || '',
      originalSerialNo: paySignOneInfo.originalSerialNo|| '',
      smsSerialNo: paySignOneInfo.smsSerialNo|| ''
    }
  }

  function verifyuserBankNo(data) {
    var userBankNoReg = /^\d{6,}$/;
    if (!data || !userBankNoReg.test(data)) {
      mui.toast('银行卡号格式不正确');
      return false;
    }
    return true;
  }

  function verifyFormData(data, all) {
    var userBankNoReg = /^\d{6,}$/;
    var mobileReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    var mobileCodeReg = /^\d{6}$/;
    // if (verifyuserBankNo(data.userBankNo) === false) {
    //   return false;
    // }
    if (!data.userBankNo || !userBankNoReg.test(data.userBankNo)) {
      mui.toast('银行卡号格式不正确');
      return false;
    }
    if (!data.userBankMobile || !mobileReg.test(data.userBankMobile)) {
      mui.toast('银行预留号码格式不正确');
      return false;
    }
    if (all) {
      if (!data.mobileCode || !mobileCodeReg.test(data.mobileCode)) {
        mui.toast('验证码格式不正确');
        return false;
      }
      if (!data.vcBankname) {
        mui.toast('未选择支行');
        return false;
      }
    }
    return true;
  }

  $('.mui-icon-left-nav').off('tap');

  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  /**
   * 勾选协议
   */
  $('#agreement-box').on('change', function (e) {
    if (e.srcElement.checked) {
      $('#next-btn').removeClass('disabled')
    } else {
      $('#next-btn').addClass('disabled')
    }
  });

  /**
   * 跳转下一步
   */
  $('#next-btn').on('tap', function () {
    if ($('#next-btn').hasClass('disabled')) {
      return;
    }
    var formData = getFormData();
    // 验证表单
    if (verifyFormData(formData, true) === false) {
      return;
    }
    var pageInfo = {
      ...queryString,
      ...formData
    };
    localStorage.setItem('sourceToOpenAccountStep3', addqueryarg(window.location.pathname,
      pageInfo));
    window.location = addqueryarg('/page/public/openAccount/openAccountStep3', pageInfo);
  });


  /**
   * 可以根据queryString填充数据
   */
  function renderFromData() {
    queryString.userName && $('#userName-text').text(queryString.userName);
    queryString.userBankNo && $('#userBankNo-input').val(queryString.userBankNo);
    queryString.userBankMobile && $('#userBankMobile-input').val(queryString.userBankMobile);
    queryString.mobileCode && $('#mobileCode-input').val(queryString.mobileCode);
    queryString.bankName && $('#bankName-text').text(queryString.bankName);
    queryString.vcBankname && $('#vcBankname-text').text(queryString.vcBankname);
    queryString.bankName && (bankInfo.bankName = queryString.bankName);
    queryString.bankCode && (bankInfo.bankCode = queryString.bankCode);
    queryString.originalSerialNo && (paySignOneInfo.originalSerialNo = queryString.originalSerialNo);
    queryString.smsSerialNo && (paySignOneInfo.smsSerialNo = queryString.smsSerialNo);
  }

  renderFromData();

  /**
   * 跳转协议
   */
  $('#to-auto').on('tap', function () {
    var today = new Date();
    var formData = getFormData();
    window.location = addqueryarg('/page/public/openAccount/autoPayProtocol', {
      accountName: formData.userName,
      account: formData.userBankNo,
      bankName: bankInfo.bankName,
      idNo: formData.userCard,
      year: today.getFullYear(),
      month: (today.getMonth() + 1),
      day: today.getDate()
    });
  });

  /**
   * 跳转选择支行
   */
  $('#selectSunBranch-btn').on('tap', function () {
    var formData = getFormData();
    if (verifyuserBankNo(formData.userBankNo) === false) {
      return;
    }
    if ($('#bankName-text').text() === '银行名称') {
      mui.toast('请选择银行名称');
      return false;
    }
    var pageInfo = {
      ...queryString,
      ...formData
    };
    localStorage.setItem('sourceToSelectSubBranch', addqueryarg(window.location.pathname, pageInfo));
    window.location = `/page/public/selectSubBranch?bankName=${formData.bankName}`
  });

  /**
   * 通过银行卡号查银行信息
   */
  var canSelect = false;

  function reinitBankInfo(bankCode, bankName, select) {
    //清空支行信息
    delete queryString.vcBankname;
    delete queryString.vcBranchbank;
    $('#vcBankname-text').text('请选择开户支行名称');
    bankInfo = {
      "bankCode": bankCode,
      "bankName": bankName
    };
    $('#bankName-text').text(bankName || '银行名称')
    canSelect = select;
  }

  function queryBankName() {
    var value = $.trim($('#userBankNo-input').val());
    // 大于6位就能查询，19位银行卡
    if (value.length >= 6) {
      $.ajax({
        url: '/codi-api/h5/pub/getAccountBank',
        data: {
          cardNo: value
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
            mui.toast(data.errorMessage);
            return;
          }
          if (!(data.validCard === '3' || data.validCard === '4')) {
            mui.toast('不支持的银行卡');
            return;
          }
          reinitBankInfo(data.bankCode, data.bankName, !data.bankName);
          console.log(data);
        }
      });
    }
  }

  // 刚进页面就查一次
  // queryBankName();
  // 输入时查
  var onUserBankNoChangeHandler = debounce(queryBankName, 600);
  $('#userBankNo-input').on('keyup', onUserBankNoChangeHandler);

  /**
   * 手动选择银行
   */
  var bankList = [];
  var bankPicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择银行'
  });
  $.ajax({
    url: '/codi-api/h5/pub/getPayBankList',
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
        mui.toast(data.errorMessage);
        return;
      }
      for (var i = 0; i < data.banks.length; i++) {
        bankList.push({
          text: data.banks[i].bankName,
          bankName: data.banks[i].bankName,
          bankCode: data.banks[i].bankCode
        });
      }
      bankPicker.setData(bankList);
      console.log(bankList)
    }
  });
  //选择银行
  $('#bank-btn').on('tap', function () {
    if (!canSelect) {
      return;
    }
    bankPicker.show(function (items) {
      reinitBankInfo(items[0].bankCode, items[0].bankName, true);
    });
  });

  /**
   * 获取验证码
   */
  $('#mobileCode-btn').on('tap', function () {
    var formData = getFormData();
    // 验证表单
    if (verifyFormData(formData) === false) {
      return;
    }
    $.ajax({
      url: '/codi-api/h5/pub/pay-sign-one',
      data: {
        userName: formData.userName,
        userCard: formData.userCard,
        userBankNo: formData.userBankNo,
        userBankMobile: formData.userBankMobile,
        bankCode: bankInfo.bankCode,
        isOpen: 1
      },
      dataType: 'json',
      headers: token,
      type: 'POST',
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        paySignOneInfo.originalSerialNo = data.originalSerialNo;
        paySignOneInfo.smsSerialNo = data.smsSerialNo;
        mui.toast('验证码已经发送，请注意查收');
        $('#time-btn').removeClass('hidden');
        $('#mobileCode-btn').addClass('hidden');
        var timer = null;
        var nowTime = 60;

        function showTime() {
          $('#time-btn').text(nowTime);
          nowTime--;
          if (nowTime === 0) {
            clearInterval(timer);
            $('#time-btn').addClass('hidden');
            $('#mobileCode-btn').removeClass('hidden');
          }
        }

        showTime();
        timer = setInterval(showTime, 1000);
        console.log(data);
      }
    });
  });
};
