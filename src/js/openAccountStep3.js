/**
 * Created by xiaobxia on 2018/3/8.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToOpenAccountStep3 = localStorage.getItem('sourceToOpenAccountStep3');
  if (sourceToOpenAccountStep3) {
    localStorage.removeItem('sourceToOpenAccountStep3')
    window.location = sourceToOpenAccountStep3;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  console.log(queryString)

  var selectData = {
    // 用户职业， 默认其他
    userOccupation: '其他',
    // 用户职业编码
    occupationCode: '8',
    // 用户地址
    userAddress: '',
    // 邮政编码
    addressCode: '',
    // 是否本人持有，默认本人
    selfSustain: true
  };

  function getFormData() {
    return {
      userAddress: queryString.userAddress,
      userOccupation: queryString.userOccupation,
      // 是本人就不用输入
      beneficiary: selectData.selfSustain ? queryString.userName : $.trim($('#beneficiary-input').val()),
      owner: selectData.selfSustain ? queryString.userName : $.trim($('#owner-input').val()),
      openAcc: true,
      ...selectData
    }
  }

  function verifyFormData(data) {
    if (!data.userAddress) {
      mui.toast('未填写居住地址');
      return false;
    }
    if (!data.beneficiary) {
      mui.toast('未填写实际受益人');
      return false;
    } else {
      if (data.beneficiary.length > 50) {
        mui.toast('长度限制50个字');
        return false;
      }
    }
    if (!data.owner) {
      mui.toast('未填写实际控制人');
      return false;
    } else {
      if (data.owner.length > 50) {
        mui.toast('长度限制50个字');
        return false;
      }
    }
    return true;
  }

  /**
   * 可以根据queryString填充数据
   */
  function renderFromData() {
    queryString.userAddress && $('#userAddress-text').text(queryString.userAddress);
    queryString.userOccupation && $('#profession-text').text(queryString.userOccupation);
    if (queryString.selfSustain === 'true') {
      $('#selfSustain-text').text('本人');
    } else if (queryString.selfSustain === 'false') {
      $('#selfSustain-text').text('他人');
    }
    queryString.userOccupation && (selectData.userOccupation = queryString.userOccupation);
    queryString.occupationCode && (selectData.occupationCode = queryString.occupationCode);
    queryString.addressCode && (selectData.addressCode = queryString.addressCode);
    queryString.selfSustain && (selectData.selfSustain = queryString.selfSustain);
    queryString.userAddress && (selectData.userAddress = queryString.userAddress);
  }

  renderFromData();

  $('.mui-icon-left-nav').off('tap');

  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  /**
   * 跳转选择地区
   */
  $('#address-btn').on('tap', function () {
    var formData = getFormData();
    var pageInfo = {
      ...queryString,
      ...formData
    };
    localStorage.setItem('sourceToSelectAddr', addqueryarg(window.location.pathname, pageInfo));
    window.location = addqueryarg('/page/public/openAccount/getAddr', {
      province: queryString.province || '',
      city: queryString.city|| '',
      range: queryString.range|| '',
      addressCode: queryString.addressCode|| ''
    });
  });
  /**
   * 职业选择
   */
  var professionPicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择职业'
  });
  var professionList = [];
  for (var i = 0; i < professionCode.length; i++) {
    professionList.push({
      jobID: professionCode[i].jobID,
      desc: professionCode[i].desc,
      text: professionCode[i].desc
    })
  }

  professionPicker.setData(professionList);
  $('#profession-btn').on('tap', function () {
    professionPicker.show(function (items) {
      console.log(items[0])
      selectData.userOccupation = items[0].desc;
      selectData.occupationCode = items[0].jobID;
      $('#profession-text').text(selectData.userOccupation);
    });
  });

  /**
   * 是否是本人持有选择
   */

  var selfSustainPicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择'
  });

  selfSustainPicker.setData([{text: '本人', value: true}, {text: '他人', value: false}]);
  $('#selfSustain-btn').on('tap', function () {
    selfSustainPicker.show(function (items) {
      selectData.selfSustain = items[0].value;
      // 是本人那就不用填实际人
      if (items[0].value) {
        $('#owner-wrap').addClass('hidden');
      } else {
        $('#owner-wrap').removeClass('hidden');
      }
      $('#selfSustain-text').text(items[0].text);
    });
  });

  /**
   * 跳转结果
   */
  var ifOpening = false;
  $('#next-btn').on('tap', function () {
    if (ifOpening) {
      return;
    }
    var formData = getFormData();
    console.log({
      ...queryString,
      ...formData
    });
    if (verifyFormData(formData, true) === false) {
      return;
    }
    ifOpening = true;
    showToast();
    $.ajax({
      url: '/codi-api/h5/pub/openAccountByH5',
      data: {
        ...queryString,
        ...formData
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
        console.log(data);
        hideToast();
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        if (data.success === true) {
          // localStorage.setItem('lastUrl', addqueryarg(window.location.pathname,
          //   {
          //     ...queryString,
          //     ...formData
          //   }));
          //TODO 风险测评的跳转
          mui.confirm('基金、私募及资管产品风险较高，应《证券期货投资者适当性管理办法》的要求，请先完成风险评测', '', ['默认保守型', '风险评测'], function (e) {
            // 去了风险测评
            if (e.index === 0) {
              window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
              // window.location = addqueryarg('/page/user/manageIndex',getToIndexToken());
            } else {
              localStorage.setItem('sourceToAssessRisk', addqueryarg('/page/user/manageIndex', getToIndexToken()));
              window.location = '/page/user/assessRisk?answer_object=1'
            }
          });
          // window.location = '/page/public/openAccount/openResult'
        }
      }
    });
  })

};
