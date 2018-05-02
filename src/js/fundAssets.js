/**
 * Created by xiaobxia on 2018/3/20.
 */
/**
 * 返回，应该去资产
 */
function backToLastUrl() {
  window.location = '/page/assets';
}
window.onload = function () {
  mui.init();
  var token = getToken();


  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);
  /**
   * 去记录
   */
  $('#to-records').on('tap', function () {
    localStorage.setItem('sourceToFundRecords', window.location.pathname+window.location.search)
    window.location = '/page/assets/fund/records';
  });

  /**
   * 渲染第一次请求的数据
   * @type {number}
   */
  var fHtml = '';
  for (var i = 0; i < fShares.length; i++) {
    fHtml += renderRecordItem(fShares[i]);
  }
  $('#recordList').append(fHtml);

  //上次加载数据数量
  // var lastRecordListSize = null;
  // 当前页码
  // var beginNumRecord = 1;
  // 每页数量
  var requestNumRecord = 10;
  // 是否能向下加载数据的开关
  var canAppendDataRecord = true;

  function renderRecordItem(data) {
    return `<a href="${addqueryarg('/page/assets/fund/assetDetail', data)}"><li class="mui-table-view-cell"><div class="title">${data.fundName}<span>${data.fundCode}</span></div><div class="detail"><div class="sub-wrap left"><p class="title">总资产</p><p>${data.worthValueString}</p></div><div class="sub-wrap"><p class="title">日收益(${data.netValueDateString})</p><p class="${!data.todayIncome ? '' : (data.todayIncome < 0 ? 'green-text' : 'red-text')}">${data.todayIncomeString}</p></div><div class="sub-wrap"><p class="title">累计收益</p><p class="${!data.totalAccumIncome ? '' : (data.totalAccumIncome < 0 ? 'green-text' : 'red-text')}">${data.totalAccumIncomeString}</p></div>${data.sellInTransit?`<div class="other"><span class="warn-icon">i</span><span>${data.sellInTransitString}</span></div>`: ''}</div></li></a>`;
  }

  // loadRecordData();
  bindScrollEvent();

  function bindScrollEvent() {
    $(window).scroll(function () {
      var scrollTop = $(window).scrollTop();
      var diff = $(document).height() - $(window).height();

      if (scrollTop > (diff - 50) && lastRecordListSize >= requestNumRecord) {
        //1s内不允许重复append数据
        if (canAppendDataRecord) {
          console.log('start render');
          canAppendDataRecord = false;
          appendRecordData();
          setTimeout(function () {
            canAppendDataRecord = true;
          }, 2000)
        }
      }
    });
  }

  function appendRecordData() {
    $("#page-end-record").html("加载中...");
    baseLoadRecordData(false);
  }


  function loadRecordData() {
    lastRecordListSize = null;
    baseLoadRecordData(true);
  }

  function baseLoadRecordData(isFirst) {
    lastRecordListSize = 10;
    beginNumRecord = isFirst ? 1 : beginNumRecord;
    var param = {
      sortDirection: 1,
      beginNum: beginNumRecord,
      // 第一次查询时重新统计
      queryFlag: isFirst ? 1 : 0,
      requestNum: 10
    };
    $.ajax({
      url: '/codi-api/h5/assets/fund',
      data: param,
      dataType: 'json',
      headers: token,
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
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        if (data.shares.length === 0 && isFirst) {
          lastRecordListSize = 0;
        } else if (data.shares.length === 0 && !isFirst) {
          lastRecordListSize = 0;
        } else {
          lastRecordListSize = data.shares.length
          beginNumRecord += lastRecordListSize;
          var html = '';
          for (var i = 0; i < data.shares.length; i++) {
            html += renderRecordItem(data.shares[i]);
          }
          $('#recordList').append(html);
        }
        $("#page-end-record").html(lastRecordListSize < requestNumRecord ? "没有更多数据了" : "↑ 继续加载更多数据");
      }
    });
  }
};
