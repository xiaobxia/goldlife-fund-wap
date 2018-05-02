var token = getToken()
$(function () {
  console.log(id_card)
  console.log(mobile)
  console.log(verification_code)
  initbtn()
})

function initbtn() {
  $('.btn').on('click', function () {
    var password = $('#userpassword1-input').val()
    var password2 = $('#userpassword2-input').val()
    var data = checkpassword(password, password2)
    if (data) {
      $.ajax({
        url: '/codi-api/h5/mine/reset_trade_password',
        data: {
          id_card: id_card,
          mobile: mobile,
          verification_code: verification_code,
          newest_passwd: password2
        },
        dataType: 'json',
        type: 'POST',
        headers: token,
        success: function (data) {
          if (data.success) {
            mui.toast('修改成功');
            $('.btn').unbind()
            window.location='/page/assets'
            // window.location = '/page/user/mine'
            
          } else {
            mui.toast(data.errorMessage);
          }
        }
      });
    }
  })
}


function checkpassword(password, checkpassword) {
  // var passwordReg = /^\d{6}$/;
  console.log(password)
  console.log(checkpassword)
  if (password == '') {
    mui.toast('新密码不能为空');
    return false;
  } else if (checkpassword == '') {
    mui.toast('确认密码不能为空');
    return false;
  } else if (!pwCheck(password)) {
    mui.toast('新密码格式不正确');
    return false;
  } else if (password != checkpassword) {
    mui.toast('两次输入的密码不一致');
    return false;
  }
  return true

}


function pwCheck(password) {
  var data = false
  password = password+''
  var firstdata = password[0]
  for (var i = 1; i < password.length; i++) {
    if (password[i] != firstdata) {
      data = true
    }
  }
  if (password.length != 6) {
    data = false
  }
  return data
}


