/**
 * Created by xiaobxia on 2018/3/8.
 */
window.onload = function () {
  mui.init();
  var queryString = getQueryStringArgs();
  var position = {
    province: queryString.province || '',
    city: queryString.city || '',
    range: queryString.range || '',
    addressCode: queryString.addressCode || ''
  };

  function renderForm() {
    $('#province-text').text(position.province || '');
    $('#city-text').text(position.city || '');
    $('#range-text').text(position.range || '');
  }

  renderForm();

  var thisTree = null;
  var provinceList = [];
  for (var i = 0; i < addressCode.length; i++) {
    provinceList.push({
      text: addressCode[i].text,
      value: addressCode[i].value
    })
  }
  var provincePicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择省'
  });
  var cityPicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择市'
  });
  var rangePicker = new mui.PopPicker({
    buttons: ['取消', '完成'],
    headText: '请选择地区'
  });
  provincePicker.setData(provinceList);
  // if (position.province) {
  //   provincePicker.pickers[0].setSelectedValue('fourth', 2000);
  // }
  //选择省
  $('#province-btn').on('tap', function () {
    provincePicker.show(function (items) {
      position.province = items[0].text;
      $('#province-text').text(items[0].text);
      // 清理子选项
      position.city = '';
      $('#city-text').text('');
      position.range = '';
      $('#range-text').text('');
      console.log(items[0]);
    });
  });
  //选择市
  $('#city-btn').on('tap', function () {
    if (!position.province) {
      mui.toast('请选择省');
      return;
    }
    var cityList = [];
    for (var i = 0; i < addressCode.length; i++) {
      if (addressCode[i].text === position.province) {
        // 缓存一层
        thisTree = addressCode[i].children;
        for (var k = 0; k < addressCode[i].children.length; k++) {
          cityList.push({
            text: addressCode[i].children[k].text,
            value: addressCode[i].children[k].value
          })
        }
      }
    }
    cityPicker.setData(cityList);
    cityPicker.show(function (items) {
      position.city = items[0].text;
      $('#city-text').text(items[0].text);
      // 清理子选项
      position.range = '';
      $('#range-text').text('');
      console.log(items[0]);
    });
  });
  //选择地区
  $('#range-btn').on('tap', function () {
    if (!position.city) {
      mui.toast('请选择市');
      return;
    }
    var rangeList = [];
    for (var i = 0; i < thisTree.length; i++) {
      if (thisTree[i].text === position.city) {
        for (var k = 0; k < thisTree[i].children.length; k++) {
          rangeList.push({
            text: thisTree[i].children[k].text,
            value: thisTree[i].children[k].value
          })
        }
      }
    }
    rangePicker.setData(rangeList);
    rangePicker.show(function (items) {
      position.range = items[0].text;
      position.addressCode = items[0].value;
      $('#range-text').text(items[0].text);
      console.log(items[0]);
    });
  });

  /**
   * 完成选择
   */
  $('#next-btn').on('tap', function () {
    var data = {};
    if (!position.province || !position.city || !position.range) {
      mui.toast('请设置完整居住地址');
      return;
    }
    data.addressCode = position.addressCode;
    data.userAddress = position.province + position.city + position.range;
    var sourceToSelectAddr = localStorage.getItem('sourceToSelectAddr');
    //跳转到原来界面
    var path = sourceToSelectAddr.substring(0, sourceToSelectAddr.indexOf('?'));
    window.location = addqueryarg(path, {
      ...getQueryStringArgs(sourceToSelectAddr.substring(sourceToSelectAddr.indexOf('?') + 1)),
      ...position,
      ...data
    });
  });
};
