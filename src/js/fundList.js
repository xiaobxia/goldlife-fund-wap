/**
 * Created by Garry King on 2016/11/22.
 */

// vue渲染模版对象
var fundListVue = null;
//上次加载数据
var lastListSize = null;
// 当前页码
var currPage = 1;
// 每页数量
var pageSize = 40;
// 当前页面基金
var currDataList = [];
// 是否能向下加载数据的开关
var canAppendData = true;

var loadURL_btn
$(function () {
  //FastClick.attach(document.body);
  clickBtn(true)
  initVueModule();
  bindScrollEvent();
  bindSelectFundTypeEvent();
  bindSortEvent();
  loadData();
});

function initVueModule() {
  renderFundList();
}
/**
 * 返回
 */
function backToLastUrl() {
  window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
}
$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl);
function bindScrollEvent() {
  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var diff = $(document).height() - $(window).height();
    if (scrollTop > (diff - 40) && lastListSize >= pageSize) {
      var fundType = $(".fund_type .selected").attr("v-fund-type");
      var statisType = 0;
      var sortValue = $(".sort-icon").attr("v-sort-value");
      //1s内不允许重复append数据
      if (canAppendData) {
        canAppendData = false;
        appendData(fundType, statisType, sortValue);
        setTimeout(function () {
          canAppendData = true;
        }, 2000)
      }
    }
  });
}

function bindSelectFundTypeEvent() {
  baseBindSelect($(".fund_type td"));
}

function bindSortEvent() {
  var sortObj = $(".J_sort");
  var sortIcon = $(".sort-icon");
  sortObj.click(function () {
    if (sortIcon.attr("v-sort-value") == 0) {
      sortIcon.attr("v-sort-value", 1);
      sortIcon.html("▼");
    } else {
      sortIcon.attr("v-sort-value", 0);
      sortIcon.html("▲");
    }
    var fundType = $(".fund_type .selected").attr("v-fund-type");
    var statisType = 0;
    var sortValue = sortIcon.attr("v-sort-value");
    loadData(fundType, statisType, sortValue);
  });
}

function baseBindSelect(domObj) {
  domObj.click(function () {
    domObj.removeClass("selected");
    $(this).addClass("selected");
    var sortValue = $(".sort-icon").attr("v-sort-value");
    var fundType = $(".fund_type .selected").attr("v-fund-type");
    var currStatis = $(".date-select ul .selected");
    var statisType = 0;
    var rateName = "日涨幅";
    $(".J_rateName").html(fundType == 1109 ? "七日年化率" : rateName);
    $(".J_valueName").html(fundType == 1109 ? "万份收益" : "最新净值");
    loadData(fundType, statisType, sortValue);
  });
}

function renderFundList(fundList) {
  if (fundListVue == null)
    fundListVue = new Vue({
      el: "#fund_detail",
      data: {
        fundList: fundList,
        currentfund: ''
      },
      methods: {
        clickone: function (fund) {
          console.log(1)
          localStorage.setItem('sourceToFundDetail', window.location.pathname + window.location.search)
          loadURL_btn('/page/fund/fundDetail?fundCode=' + fund.fundCode)
          this.currentfund = fund.fundCode
          console.log(this.currentfund)
          // if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
          //   clickBtn(false)
          //   console.log("IOS");
          // } else if (/android/.test(navigator.userAgent.toLowerCase())) {
          //   console.log("ANDROID");
          // }

        }
      }
    });
  else
    fundListVue.fundList = fundList;
}

function loadData(fundTypeCode, statisType, sort) {
  lastListSize = null;
  baseLoadData(fundTypeCode, statisType, sort, true);
}

function appendData(fundTypeCode, statisType, sort) {
  $(".page-end").html("数据加载中");
  baseLoadData(fundTypeCode, statisType, sort, false);
}

function baseLoadData(fundTypeCode, statisType, sort, isFirst) {
  currPage = isFirst ? 1 : currPage;
  var param = {
    fundTypeCode: fundTypeCode,
    pageIndex: currPage,
    pageSize: pageSize,
    statisType: statisType,
    sort: sort
  };
  $.ajax({
    url: '/codi-api/h5/index/foundList',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: headers,
    error: function (err) {
      console.log(err)
      if (err) {
        mui.toast(err.statusText);
        return;
      }
    },
    success: function (data) {
      if (!data.success) {
        console.log("/codi-api/fund/sort/performance return false..");
        renderFundList(null);
        $(".page-end").html("没有更多数据了");
        return;
      }
      if (data.sortList == undefined && isFirst) {
        lastListSize = 0;
        currDataList = null;
      } else if (data.sortList == undefined && !isFirst) {
        lastListSize = 0;
      } else {
        lastListSize = data.sortList.length;
        for (var i = 0; i < data.sortList.length; i++) {
          var tempFund = data.sortList[i];
          if (tempFund.tradingDay != undefined && tempFund.tradingDay != null) {
            tempFund.tradingDay = tempFund.tradingDay.substring(5);
          } else {
            tempFund.tradingDay = "---";
          }
          if (tempFund.value == undefined || tempFund.value == null) {
            tempFund.value = "---";
          }
          if (tempFund.rate == undefined || tempFund.rate == null) {
            tempFund.rate = "---";
          }
          if (tempFund.rate < 0) {
            tempFund.color = "bigGreen";
            tempFund.rate = tempFund.rate + "%";
          } else if (tempFund.rate > 0) {
            tempFund.color = "bigRed";
            tempFund.rate = '+' + tempFund.rate + "%";
          } else if (tempFund.rate == 0) {
            tempFund.color = "bigGree";
            tempFund.rate = tempFund.rate + "%";
          } else {
            tempFund.color = "bigBlack";
          }
        }
        currDataList = isFirst ? data.sortList : currDataList.concat(data.sortList);
      }
      renderFundList(currDataList);
      currPage++;
      $(".page-end").html(lastListSize < pageSize ? "没有更多数据了" : " ↑ 继续加载更多数据");
      if (isFirst) {
        // $("html,body").animate({scrollTop: 0}, 700);
      }
    }
  });
}

// 点击事件开关
function clickBtn() {

    loadURL_btn = function (url) {
      console.log(1111)
      window.location = url
    }
}
