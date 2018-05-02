/**
 * Created by zhenhaowang on 2016/11/1.
 */
var count = 2;
var render = true;

$(function () {
  get_page_data();
  console.log(fundAdministrators)
});

function get_page_data() {
  var data = fundAdministrators
  $("#managerIntro").html(data.background);

  $.each(data.funds, function (i, item) {
    var tableData = '';
    var tr1 = '<tr id="' + item.fundCode + '" data-fundName="' + item.fundNameAbbr + '" class="fundManagerEx2">';
    var tr2 = '</tr>';
    var td1 = '<td class="table_block_left border_right border_bottom font4">';
    var td2 = '<td class="table_block_middle border_right border_bottom font4" >';
    var td3 = '<td class="table_block_right border_bottom font3" >';
    var td4 = '</td>';
    var td5 = '<td class="table_block_right border_bottom font5">';
    var td6 = '<td class="table_block_right border_bottom">';

    tableData += tr1;

    tableData += td1;
    if (item.fundNameAbbr == '' || !item.fundNameAbbr) {
      console.log(item.fundNameAbbr)
      tableData += '---';
    } else {
      tableData += item.fundNameAbbr;
    }

    tableData += td4;

    tableData += td2;
    if (item.fundType == '' || !item.fundType) {
      console.log(item.fundType)
      tableData += '---';
    } else {
      tableData += item.fundType;
    }
    tableData += td4;


    var rRInSingleYear = item.rRInSingleYear;

    if (rRInSingleYear == "" || !rRInSingleYear) {
      tableData += td6;
      tableData += '----';
      tableData += td4;
    } else {
      if (rRInSingleYear < 0) {
        tableData += td5;
      } else {
        tableData += td3;
      }


      tableData += item.rRInSingleYear;
      tableData += '%';
      tableData += td4;
    }

    tableData += tr2;

    $("#performance").append(tableData);

  });

  mui.init({
    pullRefresh: {
      container: '#pullrefresh',
      up: {
        contentrefresh: '正在加载基金列表...',
        callback: pullupRefresh
      }
    }
  });

}


/**
 * 上拉加载具体业务实现
 *
 *
 */

function renderFundData() {
  render = false;

  var param2 = {investAdvisorCode: getUrlParam('investAdvisorCode'), pageIndex: count, pageSize: 10};

  $.ajax({
    url: '/codi-api/fund/investAdvisorFunds',
    data: param2,
    dataType: 'json',
    type: 'get',
    headers: {},
    success: function (data) {
      if (data.funds.length == 0) {
        count = 0;
      } else {
        ++count;

        $.each(data.funds, function (i, item) {
          var tableData = '';
          var tr1 = '<tr id="' + item.fundCode + '" data-fundName="' + item.fundNameAbbr + '" class="fundManagerEx2">';
          var tr2 = '</tr>';
          var td1 = '<td class="table_block_left border_right border_bottom font4">';
          var td2 = '<td class="table_block_middle border_right border_bottom font4" >';
          var td3 = '<td class="table_block_right border_bottom font3" >';
          var td4 = '</td>';
          var td5 = '<td class="table_block_right border_bottom font5">';
          var td6 = '<td class="table_block_right border_bottom">';

          tableData += tr1;

          tableData += td1;
          if (!item.fundNameAbbr||item.fundNameAbbr==''){
            tableData += '---';
          }else{
            tableData += item.fundNameAbbr;
          }

          tableData += td4;

          tableData += td2;
          if(!item.fundType||item.fundType == ''){
            tableData += '---';
          }else{
            tableData += item.fundType;
          }

          tableData += td4;

          var RRInSingleYear = item.RRInSingleYear;

          if (RRInSingleYear == "" || !RRInSingleYear) {
            tableData += td6;
            tableData += '----';
            tableData += td4;
          } else {
            if (RRInSingleYear < 0) {
              tableData += td5;
            } else {
              tableData += td3;
            }


            tableData += item.RRInSingleYear;
            tableData += '%';
            tableData += td4;
          }

          tableData += tr2;

          $("#performance").append(tableData);

        });
      }
    }
  });


  render = true;
}

var firstTime = true;

function pullupRefresh() {
  if (firstTime) {
    firstTime = false;
    mui('#pullrefresh').pullRefresh().endPullupToRefresh((count == 0));
    return;
  }

  setTimeout(function () {
    if (firstTime) {
      firstTime = false;
    }
    if (render) {
      mui('#pullrefresh').pullRefresh().endPullupToRefresh((count == 0)); //参数为true代表没有更多数据了。
      renderFundData();
    }


  }, 500);

  //mui('.dataintable').on('tap','tr',function(e){
  //  var $target =$(e.target);
  //  var idValue = $target.parent()[0].id;
  //  if (checkMobile()) {
  //    location.href = 'codi://fundDetail?fundCode=' + idValue;
  //  } else {
  //    location.href = '/fund/fundDetail.html?fundCode=' + idValue;
  //  }
  //});
}

if (mui.os.plus) {
  mui.plusReady(function () {
    setTimeout(function () {
      mui('#pullrefresh').pullRefresh().pullupLoading();
    }, 1000);

  });
} else {
  mui.ready(function () {
    mui('#pullrefresh').pullRefresh().pullupLoading();
  });
}


function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}
