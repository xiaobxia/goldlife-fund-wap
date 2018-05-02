var ajaxdata
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var token = getToken();
  initpage()
  console.log(ajaxdata)
  var selectData = {
    // 用户职业， 默认其他
    userOccupation: '其他',
    // 用户职业编码
    occupationCode: '8',
    // 用户地址
    userAddress: $.trim($('#userAddress-text').text()),
    // 邮政编码
    addressCode:queryString.addressCode?queryString.addressCode:ajaxdata.addressCode,
    // 是否本人持有，默认本人
    selfSustain: true
  };

  function getFormData() {

    return {
      address: $.trim($('#userAddress-text').text()),
      occupation: $.trim($('#profession-text').text()),
      // 是本人就不用输入
      beneficiary: selectData.selfSustain ? ajaxdata.beneficiary : $.trim($('#beneficiary-input').val()),
      owner: selectData.selfSustain ? ajaxdata.owner : $.trim($('#owner-input').val()),
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
    }
    if (!data.owner) {
      mui.toast('未填写实际控制人');
      return false;
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

  /**
   * 跳转选择地区
   */
  $('#address-btn').on('tap', function () {
    var formData = getFormData();
    console.log(formData)
    localStorage.setItem('lastUrl', addqueryarg(window.location.pathname,
      {
        ...queryString,
        ...formData
      }));
    localStorage.setItem('sourceToSelectAddr', addqueryarg(window.location.pathname, {
      ...queryString,
      ...formData
    }));
    window.location = '/page/public/openAccount/getAddr';
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
      console.log(items[0])
      selectData.selfSustain = items[0].value;
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
  $('#next-btn').on('tap', function () {
    var formData = getFormData();
    console.log({
      ...queryString,
      ...formData
    });
    if (verifyFormData(formData, true) === false) {
      return;
    }
    showToast();
    $.ajax({
      url: '/codi-api/h5/mine/modify_client_info',
      data: {
        ...queryString,
        ...formData
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
        console.log(data);
        if (!data.success == true) {
          mui.toast(data.errorMessage);
          return;
        }
        if (data.success == true) {
          mui.toast('修改成功');
          window.location='/page/assets'
        }
      }
    });
  })

};

function initpage() {
  var queryString = getQueryStringArgs();
    var token = getToken()
    $.ajax({
      url: '/codi-api/h5/mine/get_client_info',
      data: {},
      dataType: 'json',
      async: false,
      headers: token,
      type: 'get',
      success: function (data) {
        ajaxdata = data
        console.log(data)
        if(!queryString.userAddress){
          $('#userAddress-text').html(data.userAddress)
          if(data.selfSustain){
            $('#owner-wrap').addClass('hidden');
            $('#selfSustain-text').html('本人')
          }else{
            $('#owner-wrap').removeClass('hidden')
            $('#selfSustain-text').html('他人')
            $('#beneficiary-input').val(data.beneficiary)
            $('#owner-input').val(data.owner)
          }
        }
        $('#profession-text').html(data.userOccupation)
      }
    });

}
