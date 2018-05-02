/**
 * Created by xiaobxia on 2018/3/26.
 */
/**
 * 返回
 */
function backToLastUrl(e) {
  var sourceToPortfolioRedeem = localStorage.getItem('sourceToPortfolioRedeem');
  if (sourceToPortfolioRedeem) {
    localStorage.removeItem('sourceToPortfolioRedeem')
    window.location = sourceToPortfolioRedeem;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  let tempData = {
    ...queryString,
  };
  delete tempData.portfolioTrade;
  queryString = {
    ...tempData,
    ...JSON.parse(queryString.portfolioTrade)
  }
  var token = getToken();
  var tradePassword = '';
  var limits = null;
  console.log(queryString)

  function verifyFormData() {
    if (!((queryString.vcBranchbank || queryString.branchBank) && (queryString.vcBankname || queryString.branchBankName))) {
      mui.toast('请选择支行');
      return false;
    }
    var value = $.trim($('#redeem-input').val());
    if (!value) {
      mui.toast('请输入赎回比例');
      return false;
    }
    if (!/(^[1-9][0-9]$)|(^100$)|(^[1-9]$)/.test(value)) {
      mui.toast('请输入数字1到100');
      return false;
    }
    if(parseInt(value) === 100) {
      return true
    }
    if (limits.minValueRate !== -1 && value<(limits.minValueRate*100)) {
      mui.toast(`不能小于最小赎回比例${limits.minValueRate*100}%`);
      return false;
    }
    if (limits.maxValueRate !== -1 && value>(limits.maxValueRate*100)) {
      mui.toast(`剩余赎回份额不能小于最小持有份额，请全部赎回`);
      return false;
    }
    return true;
  }


  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  $('#selectSunBranch-btn').on('tap', function () {
    localStorage.setItem('sourceToSelectSubBranch', window.location.pathname+window.location.search);
    window.location = `/page/public/selectSubBranch?bankName=${queryString.bankName}`
  });

  /**
   * 更新比例
   */
  $('#redeem-input').on('keyup', function () {
    var value = $.trim($('#redeem-input').val()) || 0;
    var portfolioFunds = queryString.portfolioFunds;
    for (var i = 0; i < portfolioFunds.length; i++) {
      var text = value * portfolioFunds[i].enableShares;
      text = parseInt(text)/100;
      $('.collapse .content-item .right').eq(i).text(text+'份');
    }
  });
  checkRate();
  function checkRate() {
    let data = {
      "portfolioCode":queryString.portfolioCode,
      "captialMode":queryString.capitalMode,
      "totalEnableShares":queryString.enableShare,
      "funds":[]
    };
    var portfolioFunds = queryString.portfolioFunds;
    for (var i = 0; i < portfolioFunds.length; i++) {
      data.funds.push({
        enableShares: portfolioFunds[i].enableShares,
        fundCode: portfolioFunds[i].fCode
      });
    }
    $.ajax({
      url: '/codi-api/h5/assets/portfolio/withdraw',
      data: JSON.stringify(data),
      contentType: false,
      dataType: 'json',
      headers: {
        ...token,
        'Content-Type':'application/json'
      },
      type: 'post',
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
        limits = data;
        console.log(data)
      }
    });
  }

  /**
   * 输入密码
   */
  $('#redeem-btn').on('tap', function () {
    if (!verifyFormData()) {
      return;
    }
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
    redeem();
    console.log(value);
  });

  function redeem() {
    showToast();
    $.ajax({
      url: '/codi-api/h5/assets/portfolio/sureWithdraw',
      data: {
        portfolioTradeAcco: queryString.tradeAcco,
        innerPortfolioCode: queryString.portfolioCode,
        redeemRate: $.trim($('#redeem-input').val())/100,
        tradePassword: tradePassword,
        applyNo: moment().format('yyyyMMddHHmmssSSS'),
        sign: Math.random(),
        vcBranchbank: queryString.vcBranchbank || queryString.branchBank,
        vcBankname: queryString.vcBankname || queryString.branchBankName
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
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        queryString.orderDate = data.orderDate;
        queryString.orderTime = data.orderTime;

        window.location = addqueryarg('/page/assets/portfolio/redeemResult', {
          portfolioTrade: JSON.stringify(queryString),
          redeemRate: $.trim($('#redeem-input').val())
        })
      }
    });
  }
};
