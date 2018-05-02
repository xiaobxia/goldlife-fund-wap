var noticesVue = null;
//上次加载数据
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
  mui.init();
  loadData()
  renderNotices();
  bindScrollEvent();
})

// function loadNoticeData() {
//   var param = {fundCode: getUrlParam("fundCode"), pageIndex: 1, pageSize: 30};
//   commAjaxByGET('/codi-api/fund/announcements', param, function (data) {
//     renderNotices(data.announcements);
//   });
// }

function renderNotices(notices) {
  if (noticesVue == null)
    noticesVue = new Vue({
      el: "#FUND_INFO_NOTICE",
      data: {
        notices: notices
      }
    });
  else
    noticesVue.notices = notices;
}


function bindScrollEvent() {
  console.log(1)
  $(window).scroll(function () {
    var scrollTop = $(document).scrollTop();
    var diff = $(document).height() - $(window).height();
    console.log(scrollTop+'--'+diff)
    console.log(lastListSize+'--'+pageSize)
    if (scrollTop > (diff - 50) && lastListSize >= pageSize) {
      console.log(1)
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
  currPage = isFirst ? 1 : currPage;
  var param = {
    fundCode: getUrlParam("fundCode"),
    pageIndex: currPage,
    pageSize: pageSize
  };

  $.ajax({
    url:'/codi-api/h5/fund/announcements',
    data: param,
    dataType: 'json',
    type: 'get',
    error: function (err) {
      console.log(err)
      if (err) {
        mui.toast(err.statusText);
        return;
      }
    },
    success: function (data) {
      console.log(data)
      if (!data.success=='true') {
        console.log("false");
        renderNotices(null);
        $(".page-end").html("没有更多数据了");
        return;
      }
      if (data.announcements == undefined && isFirst) {
        lastListSize = 0;
        currDataList = null;
      } else if (data.announcements == undefined && !isFirst) {
        lastListSize = 0;
      } else {
        lastListSize = data.announcements.length
      }

      currDataList = currDataList.concat(data.announcements);
      renderNotices(currDataList);
      currPage++;
      $(".page-end").html(lastListSize < pageSize ? "没有更多数据了" : "↑ 继续加载更多数据");
      if (isFirst) {
        $("html,body").animate({scrollTop: 0}, 700);
      }
    }
  });
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}
