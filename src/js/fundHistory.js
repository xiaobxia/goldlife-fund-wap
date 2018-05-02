var type = getUrlParam("type")

var fundCode = getUrlParam("fundCode")

var lastListSize = null;
// 当前页码
var currPage = 1;
// 每页数量
var pageSize = 20;
// 当前页面基金
var currDataList = [];
// 是否能向下加载数据的开关
var canAppendData = true;
$(function () {


  initpage()

  loadData()

  bindScrollEvent()
})


function initpage() {
  var htmlstring = ''
  // 历史业绩
  if (type == 'achievement') {
    $.ajax({
      url:'/codi-api/h5/fund/detail',
      data: {
        fundCode: fundCode
      },
      dataType: 'json',
      type: 'get',
      headers:{},
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        htmlstring += "<div class='oneLine_title'>" +
          "      <div class='span_title_2'>日期</div>" +
          "      <div class='span_title_2'>收益</div>" +
          "    </div>"

        // 近一周数据
        if (data.RRInSingleWeek < 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近一周</div>" +
            "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRInSingleWeek).toFixed(2) + "%</div>" +
            "    </div>"
        }
        else if (data.RRInSingleWeek > 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近一周</div>" +
            "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRInSingleWeek).toFixed(2) + "%</div>" +
            "    </div>"
        }else{
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近一周</div>" +
            "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
            "    </div>"
        }

        // 近一月数据
        if (data.rRInSingleMonth < 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近一月</div>" +
            "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRInSingleMonth).toFixed(2) + "%</div>" +
            "    </div>"
        }
        else if (data.rRInSingleMonth > 0){
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近一月</div>" +
            "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRInSingleMonth).toFixed(2) + "%</div>" +
            "    </div>"
        }else{
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近一月</div>" +
            "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
            "    </div>"
        }
        // 近三月数据
        if (data.rRInThreeMonth < 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近三月</div>" +
            "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRInThreeMonth).toFixed(2) + "%</div>" +
            "    </div>"
        }
        else if (data.rRInThreeMonth > 0){
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近三月</div>" +
            "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRInThreeMonth).toFixed(2) + "%</div>" +
            "    </div>"
        }else{
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近三月</div>" +
            "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
            "    </div>"
        }
        // 近六月数据
        if (data.rRInSixMonth < 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近六月</div>" +
            "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRInSixMonth).toFixed(2) + "%</div>" +
            "    </div>"
        }
        else if (data.rRInSixMonth > 0){
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近六月</div>" +
            "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRInSixMonth).toFixed(2) + "%</div>" +
            "    </div>"
        }else{
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>近六月</div>" +
            "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
            "    </div>"
        }
        // 今年以来数据
        if (data.rRSinceThisYear < 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>今年以来</div>" +
            "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRSinceThisYear).toFixed(2) + "%</div>" +
            "    </div>"
        }
        else if (data.rRSinceThisYear > 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>今年以来</div>" +
            "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRSinceThisYear).toFixed(2) + "%</div>" +
            "    </div>"
        }else{
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>今年以来</div>" +
            "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
            "    </div>"
        }
        // 成立以来数据
        if (data.rRSinceStart < 0) {
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>成立以来</div>" +
            "      <div class='span_con_2' style='color:green'>" + parseFloat(data.rRSinceStart).toFixed(2) + "%</div>" +
            "    </div>"
        }
        else if (data.rRSinceStart > 0){
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>成立以来</div>" +
            "      <div class='span_con_2' style='color:red'>+" + parseFloat(data.rRSinceStart).toFixed(2) + "%</div>" +
            "    </div>"
        }else{
          htmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_2'>成立以来</div>" +
            "      <div class='span_con_2' style='color:#696969'>0.00%</div>" +
            "    </div>"
        }
        $('.profit_list').html(htmlstring)

      }
    });
  }

}


function bindScrollEvent() {
  console.log(1)
  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    console.log($(document))
    var diff = $(document).height() - $(window).height();
    console.log(scrollTop + '--' + diff)
    console.log(lastListSize + '--' + pageSize)
    if (scrollTop > (diff - 50) && lastListSize >= pageSize) {
      console.log(1)
      //1s内不允许重复append数据
      if (canAppendData) {
        canAppendData = false;
        appendData();
        setTimeout(function () {
          canAppendData = true;
        }, 1000)
      }
    }
  });
}

function loadData() {
  console.log(1)
  lastListSize = null;
  baseLoadData(true);
}

function appendData() {
  $(".page-end").html("加载中...");
  baseLoadData(false);
}

function baseLoadData(isFirst) {
  if (type == 'UnitNV') {
    currPage = isFirst ? 1 : currPage;
    var param = {
      fundCode: getUrlParam("fundCode"),
      page: currPage,
      size: pageSize
    };

    $.ajax({
      url:'/codi-api/h5/fund/get_history_net_values',
      data: param,
      dataType: 'json',
      type: 'get',
      headers:{},
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        if (!data.success == 'true') {
          console.log("false");
          renderNotices(null);
          $(".page-end").html("没有更多数据了");
          return;
        }
        if (data.result.content == undefined && isFirst) {
          lastListSize = 0;
          currDataList = null;
        } else if (data.result.content == undefined && !isFirst) {
          lastListSize = 0;
        } else {
          lastListSize = data.result.content.length
        }
        if(isFirst){
          var newhtmlstring = '<div class="oneLine_title">' +
            '            <div class="span_title_4">日期</div> ' +
            '            <div class="span_title_4">单位净值</div> ' +
            '            <div class="span_title_4">累计净值</div> ' +
            '            <div class="span_title_4">日增长率</div> ' +
            '          </div>'
        }else{
          var newhtmlstring =''
        }
        for (var i = 0; i < data.result.content.length; i++) {
          newhtmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_4'>" + data.result.content[i].EndDate.substr(0, 10) + "</div>" +
            "      <div class='span_con_4'>" + parseFloat(data.result.content[i].UnitNV).toFixed(4) + "</div>" +
            "      <div class='span_con_4'>" + parseFloat(data.result.content[i].AccumulatedUnitNV).toFixed(4) + "</div>"
          // parseFloat(data.result.content[i].UnitNV).toFixed(4)
          if (data.result.content[i].NVDailyGrowthRate < 0) {
            newhtmlstring += "<div class='span_con_4' style='color:green'>" + parseFloat(data.result.content[i].NVDailyGrowthRate).toFixed(2) + "%</div></div>"
          }
          else if(data.result.content[i].NVDailyGrowthRate == 0){
            newhtmlstring += "<div class='span_con_4' style='color:#696969'>0.00%</div></div>"
          }
          else {
            newhtmlstring += "<div class='span_con_4' style='color:red'>+" + parseFloat(data.result.content[i].NVDailyGrowthRate).toFixed(2) + "%</div></div>"
          }
        }
        $('.profit_list').append(newhtmlstring)
        currPage++;
        $(".page-end").html(lastListSize < pageSize ? "没有更多数据了" : "↑ 继续加载更多数据");
        if (isFirst) {
          $("html,body").animate({scrollTop: 0}, 700);
        }
      }
    });

  }
  if (type == 'sevendays') {
    currPage = isFirst ? 1 : currPage;
    var param = {
      fundCode: getUrlParam("fundCode"),
      page: currPage,
      size: pageSize
    };

    $.ajax({
      url:'/codi-api/h5/fund/get_history_seven_day_annualized',
      data: param,
      dataType: 'json',
      type: 'get',
      headers:{},
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          return;
        }
      },
      success: function (data) {
        if (!data.success == 'true') {
          console.log("false");
          renderNotices(null);
          $(".page-end").html("没有更多数据了");
          return;
        }

        if (data.result.content == undefined && isFirst) {
          lastListSize = 0;
          currDataList = null;
        } else if (data.result.content == undefined && !isFirst) {
          lastListSize = 0;
        } else {
          lastListSize = data.result.content.length
        }
        if(isFirst){
          var newhtmlstring = '<div class="oneLine_title">' +
            '  <div class="span_title_3">日期</div>' +
            '  <div class="span_title_3">万份收益</div>' +
            '  <div class="span_title_3">七日年化</div>' +
            '</div>'
        }else{
          var newhtmlstring =''
        }

        for (var i = 0; i < data.result.content.length; i++) {
          newhtmlstring += "<div class='oneLine'>" +
            "      <div class='span_con_3'>" + data.result.content[i].TradingDay.substr(0, 10) + "</div>" +
            "      <div class='span_con_3'>" + parseFloat(data.result.content[i].DailyProfit).toFixed(4) + "</div>"
          // parseFloat(data.result.content[i].DailyProfit).toFixed(4)
          if (data.result.content[i].LatestWeeklyYield < 0) {
            newhtmlstring += "<div class='span_con_3' style='color:green'>" + parseFloat(data.result.content[i].LatestWeeklyYield).toFixed(2) + "%</div></div>"
          }
          else if (data.result.content[i].LatestWeeklyYield == 0) {
            newhtmlstring += "<div class='span_con_3' style='color:#696969'>0.00%</div></div>"
          }
          else {
            newhtmlstring += "<div class='span_con_3' style='color:red'>+" + parseFloat(data.result.content[i].LatestWeeklyYield).toFixed(2) + "%</div></div>"
          }
        }
        $('.profit_list').append(newhtmlstring)
        currPage++;
        $(".page-end").html(lastListSize < pageSize ? "没有更多数据了" : "↑ 继续加载更多数据");
        if (isFirst) {
          $("html,body").animate({scrollTop: 0}, 700);
        }
      }
    });
  }
}
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}
