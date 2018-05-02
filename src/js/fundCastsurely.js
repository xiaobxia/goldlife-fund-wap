/**
 * Created by xiaobxia on 2018/3/20.
 */
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  var payWayNow = banks[0];
  var tradePassword = '';

  var selectData = {
    // 定投周期
    period: 0,
    // 定投日期
    date: 1
  }

  function verifyFormData(data, all) {
  }

  /**
   * 选择支付方式
   */
  $('#select-pay').on('tap', function () {
    $('.mui-backdrop ').addClass('mui-active');
    $('.mui-popover').addClass('mui-active');
    var value = $.trim($('#balance-input').val());
    value = value || 0;
    for (var i = 0; i < banks.length; i++) {
      var flag = banks[i].canUse;
      if (banks[i].singleDealMaxValue !== -1 && banks[i].singleDealMaxValue < value) {
        flag = false;
      }
      if (banks[i].dayDealRetainMaxValue !== -1 && banks[i].dayDealRetainMaxValue < value) {
        flag = false;
      }
      if (banks[i].monthDealRetainMaxValue !== -1 && banks[i].monthDealRetainMaxValue < value) {
        flag = false;
      }
      if (flag === false) {
        $('.mui-popover .mui-table-view-cell').eq(i).attr('data-canuse', flag);
      }
    }
  });
  $('.mui-popover .mui-icon').on('tap', function () {
    $('.mui-backdrop ').removeClass('mui-active');
    $('.mui-popover').removeClass('mui-active');
  });

  /**
   * 具体选择
   */
  /**
   * 选择逻辑
   */
  $('.mui-popover').on('tap', '.mui-table-view-cell', function () {
    console.log($(this).attr('data-canUse'))
    if ($(this).attr('data-canUse') === 'false') {
      return
    }
    $('.mui-popover .mui-table-view-cell').removeClass('active');
    $(this).addClass('active');
    var $this = $(this);
    var index = $this.attr('data-index');
    payWayNow = banks[index];
    setTimeout(function () {
      $('.mui-backdrop ').removeClass('mui-active');
      $('.mui-popover').removeClass('mui-active');
      $('#select-pay').html($this.html());
      $('#select-pay span').attr('class', 'mui-navigate-right');
    }, 300)
  });


  /**
   * 预估费用
   */
  function renderEstimateCost(data) {
    return `<span>预估手续费</span><span class="through">${data.origin_fee}</span><span class="red-text">${data.fee}元（省${data.discount_fee}元）</span>`
  }

  function queryEstimateCost() {
    var value = $.trim($('#balance-input').val());
    $.ajax({
      url: '/codi-api/h5/fund/estimateCost',
      data: {
        fundCode: queryString.fundCode,
        balance: value
      },
      dataType: 'json',
      headers: token,
      type: 'get',
      success: function (data) {
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        $('#estimateCost').html(renderEstimateCost(data));
        console.log(data);
      }
    });
  }

  // 输入时查
  var onBalanceChangeHandler = debounce(queryEstimateCost, 600);
  $('#balance-input').on('keyup', onBalanceChangeHandler);


  /**
   * 点击验证逻辑
   */
  $('#buy-btn').on('tap', function () {
    var value = $.trim($('#balance-input').val());
    if (!value) {
      mui.toast('请输入购买金额');
    }
    if (value > payWayNow.singleDealMaxValue && payWayNow.singleDealMaxValue != -1) {
      mui.confirm(`银行限定单笔交易不能超过${payWayNow.singleDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
    }

    if (value > payWayNow.dayDealRetainMaxValue && payWayNow.dayDealRetainMaxValue != -1) {
      mui.confirm(`银行限定单日交易不能超过${payWayNow.dayDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
    }

    if (value > payWayNow.monthDealRetainMaxValue && payWayNow.monthDealRetainMaxValue != -1) {
      mui.confirm(`银行限定单日交易不能超过${payWayNow.monthDealMaxValue}元，当前买入金额超过银行卡限额`, '', ['取消', '其他付款方式'], function (e) {
      });
    }


    activePasswordPopup();
  });

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
    setTimeout(function () {
      hidePasswordPopup();
    }, 200)
    tradePassword = $.trim($('#password-input').val());
    console.log($.trim($('#password-input').val()))
    var value = $.trim($('#balance-input').val());
    showToast();
    $.ajax({
      url: '/codi-api/h5/fund/sureCircleBuy',
      data: {
        fundCode: queryString.fundCode,
        fundName: queryString.fundName,
        balance: value,
        bankAccount: payWayNow.userBankNo,
        applyNo: moment().format('yyyyMMddHHmmssSSS'),
        tradePassword: tradePassword,
        protocolPeriodUnit: selectData.period,
        protocolFixDay: selectData.date,
        capitalMode: payWayNow.capitalMode,
        payType:'BANK',
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
        // $('#estimateCost').html(renderEstimateCost(data));
        mui.toast('定投成功');
        window.location = '/page/user/castSurely'
      }
    });
  });

  // 定投设置
  // 定投周期
  var periodPicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择'
  });

  var datePicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择'
  });
  // 一周选择内容
  var weekdata = [
    {text: '周一', value: 1},
    {text: '周二', value: 2},
    {text: '周三', value: 3},
    {text: '周四', value: 4},
    {text: '周五', value: 5}
  ]

  // 一个月的内容
  var monthdata = [
    {text: '1日', value: 1}, {text: '2日', value: 2}, {text: '3日', value: 3}, {text: '4日', value: 4}, {
      text: '5日',
      value: 5
    }, {text: '6日', value: 6}, {text: '7日', value: 7}, {text: '8日', value: 8}, {text: '9日', value: 9}, {
      text: '10日',
      value: 10
    }, {text: '11日', value: 11}, {text: '12日', value: 12}, {text: '13日', value: 13}, {
      text: '14日',
      value: 14
    }, {text: '15日', value: 15}, {text: '16日', value: 16}, {text: '17日', value: 17}, {
      text: '18日',
      value: 18
    }, {text: '19日', value: 19}, {text: '20日', value: 20}, {text: '21日', value: 21}, {
      text: '22日',
      value: 22
    }, {text: '23日', value: 23}, {text: '24日', value: 24}, {text: '25日', value: 25}, {
      text: '26日',
      value: 26
    }, {text: '27日', value: 27}, {text: '28日', value: 28}
  ]
  datepicker(monthdata)
  $('#date-text').text('1日');
  periodPicker.setData([{text: '月', value: 0}, {text: '周', value: 1}]);
  $('#period-btn').on('tap', function () {
    periodPicker.show(function (items) {
      console.log(items[0])
      selectData.period = items[0].value;
      $('#period-text').text(items[0].text);
      if ($('#period-text').text() == '周') {
        datepicker(weekdata)
        $('#date-text').text('周一');
      }
      else {
        datepicker(monthdata)
        $('#date-text').text('1日');
      }
    });
  });

  // 定投日期
  function datepicker(data) {
    datePicker.setData(data);
    $('#date-btn').on('tap', function () {
      datePicker.show(function (items) {
        console.log(items[0])
        selectData.date = items[0].value;
        $('#date-text').text(items[0].text);
      });
    });
  }
};
