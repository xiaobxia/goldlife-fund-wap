var queryString = getQueryStringArgs();
var token = getToken()
var tradePassword = ''
function backToLastUrl() {
  window.location='/page/user/bankcardList'
}
$(function () {
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('click',backToLastUrl)
  initbtn()
  initpage()

})


function initbtn() {
  $('.banklist').on('click', function () {
    var pageInfo = {
      bankName: queryString.bankName,
      userBankNo: queryString.userBankNo,
      bankCode: queryString.bankCode,
      branchBankName:queryString.branchBankName
    };
    localStorage.setItem('sourceToSelectSubBranch', addqueryarg(window.location.pathname, pageInfo));
    window.location = `/page/public/selectSubBranch?bankName=${bankName}`
  })

  $('.btn').on('click', function () {
    if (queryString.vcBankname||queryString.branchBankName) {
      activePasswordPopup();
    } else {
      mui.toast('请选择支行信息');
    }
  })

  $('#password-input').on('keyup', function () {
    var value = $('#password-input').val();
    var len = value.length;
    value = value.substr(0, 6);
    $('.box-item').removeClass('active');
    for (var i = 0; i < len; i++) {
      $('.box-item').eq(i).addClass('active')
    }
    console.log(value)
    console.log(value.length)
    tradePassword = value
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
    tradePassword = $('#password-input').val();
    console.log($('#password-input').val())
    var parma
    if(queryString.vcBranchbank){
      parma = {
        vcBranchbank: queryString.vcBranchbank,
        vcBankname: queryString.vcBankname,
        tradePassword: tradePassword
      }
    }else{
      parma = {
        vcBranchbank: queryString.branchBankName,
        vcBankname: queryString.branchBank,
        tradePassword: tradePassword
      }
    }
    $.ajax({
      url: '/codi-api/h5/mine/bank/setBank',
      data: parma,
      dataType: 'json',
      type: 'POST',
      headers: token,
      success: function (data) {
        console.log(data);
        if(data.success == true){
          mui.toast('修改成功');
          window.location='/page/assets'
          // window.location='/page/user/mine'
        }else{
          mui.toast(data.errorMessage);
          return;
        }
      }
    });

  });


}

function initpage() {

  if (queryString.vcBankname) {
    $('.banklist div:nth-child(2)').html(queryString.vcBankname)
  } else if(queryString.branchBankName) {
    $('.banklist div:nth-child(2)').html(queryString.branchBankName)
  }else{
    $('.banklist div:nth-child(2)').html('')
  }
}
