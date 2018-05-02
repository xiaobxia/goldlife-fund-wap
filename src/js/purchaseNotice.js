$(function () {
  console.log(999)
  get_page_data();
});


var MAX_DAYS_FOREVER = '2000000000';

function get_page_data() {
  var param = {fundCode: getUrlParam('fundCode')};
  $.ajax({
    url:'/codi-api/h5/fund/purchaseNotice',
    data: param,
    dataType: 'json',
    type: 'get',
    headers:{},
    success: render_page
  });
  //commAjaxByGET('/codi-api/fund/purchaseNotice', param, render_page);
}

function get_apply_ratio_div_html(shareType, ratio_section) {
  var max = ratio_section['maxValue'];
  var min = ratio_section['minValue'];

  shareType = (shareType == null || shareType.length == 0) ? 'A' : shareType;
  var middleLabel = '金额', unit = '元';
  if (shareType == 'B') {
    middleLabel = '时间';
    unit = '天';
  }

  var section_text = min + unit + '<=' + middleLabel;
  if (max != '0.00') {
    if (max === MAX_DAYS_FOREVER) {
    } else {
      section_text += ' < ' + max + unit;
    }
  }
  var section_div = '<td class="table_block border_top border_right">' + section_text + '</td>';
  var fare_ratio = ratio_section['fareRatio'];
  var fare_ratio_after_discount = fare_ratio;
  var discountList = ratio_section['discountList'];
  if (discountList && discountList.length != 0) {
    fare_ratio_after_discount = discountList[0]['fareRatioAfterDiscount'];
  }
  var ratio_div;
  if (isZero(fare_ratio)) {
    var minFare = ratio_section.minFare, maxFare = ratio_section.maxFare;

    var finalFare;
    if (isZero(minFare)) {
      finalFare = maxFare;
    } else {
      if (isSameValue(minFare, maxFare)) {
        finalFare = minFare;
      } else {
        if (isZero(maxFare)) {
          finalFare = minFare;
        } else {
          finalFare = minFare + ' - ' + maxFare;
        }
      }
    }

    ratio_div = '<td class="table_block border_top">' + finalFare + '元</td>'
  } else {
    ratio_div = '<td class="table_block border_top">' + fare_ratio_after_discount;
    ratio_div += '%&nbsp;&nbsp;&nbsp;&nbsp;<del>' + fare_ratio + '%</del></td>';
  }


  return '<tr>' + section_div + ratio_div + '</tr>';
}

function get_exceed_ratio_div_html(fund_exceed_ratio) {
  var min_time = fund_exceed_ratio['minDay'];
  if (!min_time) {
    min_time = '0';
  }
  var max_time = fund_exceed_ratio['maxDay'];
  if (!max_time) {
    max_time = '0';
  }

  var unit = '天';

  var time_text = min_time + unit + ' < 持有时间';
  if (max_time != '0') {
    if (max_time === MAX_DAYS_FOREVER) {

    } else {
      time_text += '<' + max_time + unit;
    }
  }
  var time_div = '<td class="table_block border_top border_right">' + time_text + '</td>';
  var ratio_div = '<td class="table_block border_top">' + fund_exceed_ratio['fareRatio'] + '%</td>';
  return '<tr>' + time_div + ratio_div + '</tr>';
}

function render_page(data) {
  console.log(data)
  if (data['success'] == true) {
    //渲染申购数据
    var minPurchase = data['minPurchase'];
    if (!minPurchase) {
      minPurchase = '0';
    }
    $('#fund_apply_min_bla').text('起购金额 : ' + minPurchase + ' 元');

    if (data.shareType === 'B') {
      $('#fund_apply_ratio_list .title').html('时间');
    }

    if (data['fundTypeCode'] == 1109) {
      $('.hide_monetary_fund').hide();
      $('#exceed_operation_sure').attr('src', '/static/asset/shlc.png')
    } else {
      var fund_apply_ratios = data['fundPurchaseList'], shareType = data.shareType;
      var fund_apply_ratios_html = '';
      for (var i = 0; i < fund_apply_ratios.length; i++) {
        fund_apply_ratios_html += get_apply_ratio_div_html(shareType, fund_apply_ratios[i]);
      }
      $('#fund_apply_ratio_list').append(fund_apply_ratios_html);
    }
    //渲染赎回数据
    var minRedeem = data['minRedeem'];
    if (!minRedeem) {
      minRedeem = '0';
    }
    var minHold = data['minHold'];
    if (!minHold) {
      minHold = '0';
    }
    $('#fund_exceed_limit').text('最少赎回: ' + minRedeem + ' 份; 最低持有: ' + minHold + ' 份');
    if (data['fundTypeCode'] != 1109) {
      var fund_exceed_ratios = data['fundRedeemList'];
      var fund_exceed_ratios_html = '';
      if(fund_exceed_ratios){
        for (var i = 0; i < fund_exceed_ratios.length; i++) {
          fund_exceed_ratios_html += get_exceed_ratio_div_html(fund_exceed_ratios[i]);
        }
      }
      $('#fund_exceed_ratio_list').append(fund_exceed_ratios_html);
    }
  } else {
    alert('系统查询失败')
  }
}

function isZero(valueStr) {
  if (valueStr == null || valueStr.length == 0) {
    return false;
  }
  return (parseFloat(valueStr, 10) == 0);
}

function isSameValue(a, b) {
  return parseFloat(a, 10) == parseFloat(b, 10);
}
