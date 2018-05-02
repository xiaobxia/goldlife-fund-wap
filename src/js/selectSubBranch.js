/**
 * Created by xiaobxia on 2018/3/12.
 */
function backToLastUrl(e) {
  var queryString = getQueryStringArgs();
  var sourceToSelectSubBranch = localStorage.getItem('sourceToSelectSubBranch');
  if (!queryString.province && sourceToSelectSubBranch) {
    localStorage.removeItem('sourceToSelectSubBranch')
    window.location = sourceToSelectSubBranch;
  } else {
    window.history.go(-1);
  }
}
window.onload = function () {
  mui.init();
  var token = getToken();
  var queryString = getQueryStringArgs();
  var bankName = queryString.bankName;
  var isSearching = false;

  //返回
  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap', backToLastUrl);

  function renderNavList(list) {
    var htmlStr = '';
    for (var i = 0; i < list.length; i++) {
      htmlStr += `<li class="mui-table-view-cell" data-value="${list[i]}"><a class="mui-navigate-right">${list[i]}</a></li>`;
    }
    return htmlStr;
  }

  function renderResultList(list) {
    var htmlStr = '';
    for (var i = 0; i < list.length; i++) {
      htmlStr += `<li class="mui-table-view-cell result" data-vcBranchbank="${list[i].vcBranchbank}" data-vcBankname="${list[i].vcBankname}">${list[i].vcBankname}</li>`;
    }
    return htmlStr;
  }

  function renderPosition() {
    var htmlStr = '';
    for (var i = 0; i < list.length; i++) {
      htmlStr += `<li class="mui-table-view-cell" data-value="${list[i]}">${list[i]}</li>`;
    }
    return htmlStr;
  }

  /**
   * 搜索的分页逻辑
   */
    //上次加载数据数量
  var lastRecordListSize = '';
  // 当前页码
  var beginNumRecord = '';
  // 每页数量
  var requestNumRecord = 20;
  // 是否能向下加载数据的开关
  var canAppendDataRecord = '';

  var searchResult = null;

  function initSearch() {
    lastRecordListSize = null;
    beginNumRecord = 1;
    canAppendDataRecord = true;
  }

  initSearch();

  bindScrollEvent();

  function bindScrollEvent() {
    $(window).scroll(function () {
      var scrollTop = $(window).scrollTop();
      var diff = $(document).height() - $(window).height();
      if (scrollTop > (diff - 100) && lastRecordListSize >= requestNumRecord && isSearching) {
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
    baseLoadRecordData(false);
  }

  function baseLoadRecordData(isFirst) {
    // lastRecordListSize = 20;
    beginNumRecord = isFirst ? 1 : beginNumRecord;
    var start =(beginNumRecord - 1)*20;
    var end = beginNumRecord * 20;
    console.log(start)
    console.log(end)
    var list = searchResult.slice(start, end);
    lastRecordListSize = list.length;
    beginNumRecord++;
    var html = renderResultList(list);
    $('#list-body').append(html);
  }

  /**
   * 搜索逻辑
   */
  var lastSearchValue = '';
  var pageCache = {
    position: '',
    list: ''
  };
  var onSearchChangeHandler = debounce(function (e) {
    var searchValue = $.trim($('#search-input').val());
    if (lastSearchValue === searchValue) {
      return;
    }
    lastSearchValue = searchValue;
    //正在搜索
    isSearching = true;
    initSearch();
    // 有城市名
    $.ajax({
      url: '/codi-api/h5/bank/fundBank',
      data: {
        bankName: bankName,
        word: searchValue
      },
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
        if (!data.success === true) {
          mui.toast(data.errorMessage);
          return;
        }
        if (!pageCache.position) {
          pageCache.position = $('#now-position').text();
          pageCache.list = $('#list-body').html();
        }
        // 取20个
        searchResult = data.result;
        var list = data.result.slice(0, 20);
        lastRecordListSize = list.length;
        beginNumRecord++;
        var html = renderResultList(list);
        $('#list-body').html(html);
        $('#now-position').text('搜索结果');
        console.log(data)
      }
    });
  }, 600);
  $('#search-input').on('keyup', onSearchChangeHandler);

  /**
   * 搜索取消
   */
  $('#cancel-btn').on('tap', function () {
    $('.mui-search').removeClass('mui-active');
    $('#search-input').val('');
    isSearching = false;
    initSearch();
    $('#list-body').html(pageCache.list);
    $('#now-position').text(pageCache.position);
  });

  /**
   * 选择支行逻辑
   */
  $('#list-body').on('tap', '.result', function () {
    var itemData = {
      vcBankname: $(this).attr('data-vcBankname'),
      vcBranchbank: $(this).attr('data-vcBranchbank')
    };
    var sourceToSelectSubBranch = localStorage.getItem('sourceToSelectSubBranch');
    localStorage.removeItem('sourceToSelectSubBranch');
    //跳转到原来界面
    var path = sourceToSelectSubBranch.substring(0, sourceToSelectSubBranch.indexOf('?'));
    window.location = addqueryarg(path, {
      ...getQueryStringArgs(sourceToSelectSubBranch.substring(sourceToSelectSubBranch.indexOf('?') + 1)),
      ...itemData
    });
  });
};
