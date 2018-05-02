/**
 * Created by xiaobxia on 2018/3/15.
 */
/**
 * 返回
 */
function backToLastUrl() {
  var sourceToPortfolioRecords = localStorage.getItem('sourceToPortfolioRecords');
  if (sourceToPortfolioRecords) {
    localStorage.removeItem('sourceToPortfolioRecords')
    window.location = sourceToPortfolioRecords;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var token = getToken();
  var queryString = getQueryStringArgs();
  var activeTab = 'record';

  function renderRecordItem(data) {
    return `<a href="${addqueryarg('/page/assets/portfolio/recordDetail',{type: 'record', data: JSON.stringify(data)})}"><li class="mui-table-view-cell"><div class="title">${data.protocolName}<span class="tag-yellow">组合</span></div><div class="detail"><p>${data.fundBusinName}${data.fundBusinName==='组合调仓'?'':(data.fundBusinName==='申购'?'：'+data.balanceString+'元':'：'+data.sharesString+'份')}</p><p>${data.orderDate} ${data.orderTime}</p></div><div class="status"><div class="content"><p>${data.statusString}</p></div></div></li></a>`
  }

  function renderDividendItem(data) {
    return `<a href="${addqueryarg('/page/assets/portfolio/recordDetail',{type: 'dividend', data: JSON.stringify(data)})}"><li class="mui-table-view-cell"><div class="title">${data.fundName}<span>${data.fundCode}</span></div><div class="detail"><p>${data.autoBuyString}：${data.autoBuy === '0' ? data.dividendShare+'份' : data.dividendBalance+'元'}</p><p>${data.equityRegDateString}</p></div><div class="status"><div class="content"><p>${data.status}</p></div></div></li></a>`
  }
  $('.mui-icon-left-nav').off('tap');

  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  // 切换时滚动到顶部
  $('#segmentedControl').on('tap', function () {
    $(window).scrollTop(0);
  });
  //上次加载数据数量
  var lastRecordListSize = null;
  // 当前页码
  var beginNumRecord = 1;
  // 每页数量
  var requestNumRecord = 10;
  // 是否能向下加载数据的开关
  var canAppendDataRecord = true;
  //上次加载数据数量
  var lastDividendListSize = null;
  // 当前页码
  var beginNumDividend = 1;
  // 每页数量
  var requestNumDividend = 10;
  // 是否能向下加载数据的开关
  var canAppendDataDividend = true;

  loadDividendData();
  loadRecordData();
  bindScrollEvent();

  function bindScrollEvent() {
    $(window).scroll(function () {
      var scrollTop = $(window).scrollTop();
      var diff = $(document).height() - $(window).height();
      if ($('#record-btn').hasClass('mui-active')) {
        activeTab = 'record';
      } else {
        activeTab = 'dividend';
      }
      console.log(activeTab)
      if (activeTab === 'record') {
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
      } else {
        if (scrollTop > (diff - 50) && lastDividendListSize >= requestNumDividend) {
          //1s内不允许重复append数据
          if (canAppendDataDividend) {
            console.log('start render');
            canAppendDataDividend = false;
            appendDividendData();
            setTimeout(function () {
              canAppendDataDividend = true;
            }, 2000)
          }
        }
      }
    });
  }

  function appendDividendData() {
    $("#page-end-dividend").html("加载中...");
    baseLoadDividendData(false);
  }

  function appendRecordData() {
    $("#page-end-record").html("加载中...");
    baseLoadRecordData(false);
  }


  function loadDividendData() {
    lastDividendListSize = null;
    baseLoadDividendData(true);
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
      url: '/codi-api/h5/portfolio/record',
      data: param,
      dataType: 'json',
      headers: token,
      type: 'get',
      error: function (err) {
        console.log(err)
        if (err) {
          mui.toast(err.statusText);
          $("#page-end-record").html('暂无数据').addClass('no-data');
          return;
        }
      },
      success: function (data) {
        console.log(data)
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        if (data.applys.length === 0 && isFirst) {
          lastRecordListSize = 0;
        } else if (data.applys.length === 0 && !isFirst) {
          lastRecordListSize = 0;
        } else {
          lastRecordListSize = data.applys.length
          beginNumRecord += lastRecordListSize;
          var html = '';
          for (var i = 0; i < data.applys.length; i++) {
            html += renderRecordItem(data.applys[i]);
          }
          $('#recordList').append(html);
        }
        $("#page-end-record").html(lastRecordListSize < requestNumRecord ? "没有更多数据了" : "↑ 继续加载更多数据");
        if (isFirst && lastRecordListSize === 0) {
          $("#page-end-record").html('暂无数据').addClass('no-data');
        }
      }
    });
  }

  function baseLoadDividendData(isFirst) {
    lastDividendListSize = 10;
    beginNumDividend = isFirst ? 1 : beginNumDividend;
    var param = {
      sortDirection: 1,
      beginNum: beginNumDividend,
      // 第一次查询时重新统计
      queryFlag: isFirst ? 1 : 0,
      requestNum: 10
    };
    $.ajax({
      url: '/codi-api/h5/portfolio/dividend/apply',
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
          $("#page-end-dividend").html('暂无数据').addClass('no-data');
          return;
        }
        if (data.dividendModels.length === 0 && isFirst) {
          lastDividendListSize = 0;
        } else if (data.dividendModels.length === 0 && !isFirst) {
          lastDividendListSize = 0;
        } else {
          lastDividendListSize = data.dividendModels.length
          beginNumDividend += lastDividendListSize;
          var html = '';
          for (var i = 0; i < data.dividendModels.length; i++) {
            html += renderDividendItem(data.dividendModels[i]);
          }
          $('#dividendList').append(html);
        }
        $("#page-end-dividend").html(lastDividendListSize < requestNumDividend ? "没有更多数据了" : "↑ 继续加载更多数据");
        if (isFirst && lastDividendListSize === 0) {
          $("#page-end-dividend").html('暂无数据').addClass('no-data');
        }
      }
    });
  }
};

