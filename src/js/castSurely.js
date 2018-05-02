// 加载开关
var canAppendData = true;
// 起始行数
var beginNum = 0
// 请求行数
var requestNum = 4

var lastListSize

var pageSize = 4

var password = '';

var token = getToken()


var ajaxdata
$(function () {
  bindScrollEvent()
  appendData(true)




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
    password = value
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
    if ($('#password-input').val().length >= 6) {
      setTimeout(function () {
        hidePasswordPopup();
      }, 200)
      var tradePassword = $('#password-input').val();
      console.log($('#password-input').val())

      $.ajax({
        url: '/codi-api/h5/mine/invest/modifyfix',
        data: {
          ...ajaxdata,
          checkRisk: false,
          tradePassword: tradePassword,
          fixModel: 2,
          applyNo: moment().format('yyyyMMddHHmmssSSS'),
          paymentType: ajaxdata.capitalMode
        },
        dataType: 'json',
        type: 'POST',
        headers: token,
        success: function (data) {
          if (data.success) {
            mui.toast('操作成功');
            window.location.reload();
            // window.location = '/page/user/castSurely'
          } else {
            mui.toast(data.errorMessage);
          }
        }
      });
    }else{
      mui.toast('请输入正确的密码');
    }
  });
});


function bindScrollEvent() {
  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var diff = $(document).height() - $(window).height();
    if (scrollTop > (diff - 40) && lastListSize >= pageSize) {
      //1s内不允许重复append数据
      if (canAppendData) {
        canAppendData = false;
        appendData();
        setTimeout(function () {
          canAppendData = true;
        }, 2000)
      }
    }
  });
}

function appendData(isFirst) {
  beginNum = isFirst ? 0 : beginNum;
  var param = {
    requestNum: 4,
    beginNum: beginNum,
    sortDirection: 0,
    queryFlag: 0,
  };
  $.ajax({
    url: '/codi-api/h5/mine/invest/fixes',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: token,
    error: function (err) {
      console.log(err)
      if (err) {
        mui.toast(err.statusText);
        return;
      }
    },
    success: function (data) {
      console.log(data)
      if (data.success) {
        var fixes = data.fixes
        var htmlstring = ''
        lastListSize = fixes.length
        for (var i = 0; i < fixes.length; i++) {
          var datastring = JSON.stringify(fixes[i])
          htmlstring += '<div class="content">' +
            '  <div class="part1 font1 numcolor">' + fixes[i].fundName + '&nbsp;&nbsp;' + fixes[i].fundCode + '</div>' +
            '  <div class="part2 font2">银行卡:' + fixes[i].bankName.substr(fixes[i].bankName.length - 4) + '******' + fixes[i].bankAccount.substr(fixes[i].bankAccount.length - 4) + '</div>'
          if (fixes[i].protocolPeriodUnit == 0) {
            htmlstring += '  <div class="part3 font2">每月' + fixes[i].protocolFixDay + '日定投:<span class="numcolor">' + fixes[i].balance + '元</span></div>'
          } else if (fixes[i].protocolPeriodUnit == 1) {
            htmlstring += '  <div class="part3 font2">每周周' + fixes[i].protocolFixDay + '定投:<span class="numcolor">' + fixes[i].balance + '元</span></div>'
          }
          htmlstring += '  <div class="part4 font2">预计扣款日期:<span class="numcolor">' + fixes[i].nextFixRequestDate + '</span></div>'
          htmlstring += '  <div class="part4 font2">累计定投<span class="numcolor">' + fixes[i].totalCfmBala + '元</span></div>'
          if (fixes[i].fixState == 'A') {
            htmlstring += '  <div class="part5">' +
              '    <div class="btn1 btnstyle stop" onclick=\'stop(' + datastring + ')\'>终止</div>' +
              '    <div class="btn2 btnstyle edit" onclick=\'edit(' + datastring + ')\'>修改</div>' +
              '  </div>' +
              '</div>'
          } else if (fixes[i].fixState == 'H') {
            htmlstring += '  <div class="part5 stopnow">已终止</div>' +
              '</div>'
          }

        }
        $('.main').append(htmlstring)
        beginNum = beginNum + 4
      }

    }
  });
}

function stop(data) {
  console.log(data)
  var parma = data
  // var parma = JSON.parse(data)
  ajaxdata = data
  activePasswordPopup();
}


function edit(data) {
  // var parma = JSON.parse(data)
  console.log(data)
  window.location = addqueryarg('/page/user/editCastsurely', {
    ...data
  })
}


