var token = getToken();

var formdata
$(function () {
  mui.init();
  initbtn()
  initmessage()
})

function getform() {
  data
  var data ={
    userIdcard:$.trim($('#userIdcard-input').val()),
    Phonenum:$.trim($('#userPhonenum-input').val()),
    mobileCode:$.trim($('#mobileCode-input').val())
  }
  console.log(data)
  return data
}

function initmessage() {
  $('#mobileCode-btn').on('click',function () {
    formdata = getform()
    if(check(formdata)){
      $.ajax({
        url:'/codi-api/h5/mine/sendvcode',
        data: {
          mobile:formdata.Phonenum,
          applyNo: moment().format('yyyyMMddHHmmssSSS'),
        },
        dataType: 'json',
        type: 'POST',
        headers:token,
        success: function (data) {
          if(data.success){
            mui.toast('短信发送成功');
            var nums = 59
            $('#mobileCode-btn').text(nums+'秒后可发送')
            $('#mobileCode-btn').unbind()
            $('#mobileCode-btn').css('color','#D0D0D0')
            var clock = setInterval(ch,1000);
            function ch(){
              nums--;
              if(nums > 0){
                $('#mobileCode-btn').text(nums+'秒后可发送')
              }else{
                $('#mobileCode-btn').text('获取验证码')
                $('#mobileCode-btn').css('color','#00c1ff')
                nums = 59; //重置时间
                clearInterval(clock); //清除js定时器
                initmessage()
              }
            }
          }else{
            mui.toast(data.errorMessage);
          }

        }
      });
    }
  })
}

function initbtn() {
  $('.btn').on('click',function () {
    formdata = getform()
    console.log(formdata)
    if(nextcheck(formdata)){
      $.ajax({
        url:'/codi-api/h5/mine/check_mobile_id_card',
        data: {
          id_card:formdata.userIdcard,
          mobile:formdata.Phonenum,
          verification_code:formdata.mobileCode
        },
        dataType: 'json',
        type: 'POST',
        headers:token,
        success: function (data) {
          if(data.success){
            mui.toast('验证成功');
            window.location = addqueryarg("/page/user/transactionEdit_step2", {
              id_card:formdata.userIdcard,
              mobile:formdata.Phonenum,
              verification_code:formdata.mobileCode
            })
          }else{
            mui.toast(data.errorMessage);
          }
        }
      });
    }
  })
}

function check(data) {
  var mobileReg = /^[1][3,4,5,7,8][0-9]{9}$/;
  var IDcardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (data.userIdcard == ''||!IDcardReg.test(data.userIdcard)) {
    mui.toast('身份证号码格式不正确');
    return false;
  }
  if (!data.Phonenum || !mobileReg.test(data.Phonenum)) {
    mui.toast('手机号码格式不正确');
    return false;
  }
  return true;
}

// 下一步验证
function nextcheck(data) {
  var mobileReg = /^[1][3,4,5,7,8][0-9]{9}$/;
  var IDcardReg =/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (data.userIdcard == ''||!IDcardReg.test(data.userIdcard)) {
    mui.toast('身份证号码格式不正确');
    return false;
  }
  if (!data.Phonenum || !mobileReg.test(data.Phonenum)) {
    mui.toast('手机号码格式不正确');
    return false;
  }
  if (!data.mobileCode) {
    mui.toast('验证码不能为空');
    return false;
  }
  return true;
}
