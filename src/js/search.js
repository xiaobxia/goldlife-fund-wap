/**
 * Created by xiaobxia on 2018/3/7.
 */
window.onload = function () {
  mui.init();
  var token = getToken();

  function renderResultList(list) {
    var htmlStr = '';
    for (var i = 0; i < list.length; i++) {
      htmlStr += `<li class="mui-table-view-cell"><div class="title">${list[i].fundName}<span class="right">${list[i].fundCode}</span></div><div class="explain">${list[i].shortName}<span class="right">${list[i].fundTypeName}</span></div></li>`;
    }
    return htmlStr;
  }

  function init() {
    if (localStorage.getItem('searchHistory')) {
      $('.history-wrap').removeClass('hidden');
      var list = JSON.parse(localStorage.getItem('searchHistory'));
      var html = '';
      for (var i = 0; i < list.length; i++) {
        html += list[i];
      }
      $('#list').html(html)
    } else {
      $('.history-wrap').addClass('hidden');
    }
  }

  /**
   * 是否有历史
   */
  init();
  /**
   * 清除历史
   */
  $('#clear').on('tap', function () {
    $('#list').html('');
    localStorage.removeItem('searchHistory');
    $('.history-wrap').addClass('hidden');
  });

  /**
   * 输入时搜索
   */
  var onSearchChangeHandler = debounce(function (e) {
    var searchValue = $.trim($('#search-input').val());
    console.log(searchValue)
    if (!searchValue) {
      return;
    }
    $.ajax({
      url: '/codi-api/h5/fund/search',
      data: {
        keyword: searchValue
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
        //搜索状态，历史的文案不显示
        $('.history-wrap').addClass('hidden');
        $('#list').html(renderResultList(data.fundInfos))
        // $('#estimateCost').html(renderEstimateCost(data));
        console.log(data);
      }
    });
  }, 600);

  $('#search-input').on('keyup', onSearchChangeHandler);

  /**
   * 清除输入内容
   */
  $('.mui-search .mui-icon-clear').on('tap', function () {
    $('#search-input').val('');
    $('#list').html('');
    init();
  });
  /**
   * 取消按键
   */
  $('#cancel-btn').on('tap', function () {
    // $('#search-input').val('');
    // $('#list').html('');
    // init();
    // window.history.go(-1);
    window.location = '/page/fund/fundList';
  });

  /**
   * 选择
   */
  $('#list').on('tap', '.mui-table-view-cell', function () {
    var html = $(this).prop("outerHTML");
    var searchHistory = localStorage.getItem('searchHistory');
    if (searchHistory) {
      var list = JSON.parse(searchHistory);
      for (var i = 0; i < list.length; i++) {
        if (html === list[i]) {
          list.splice(i,1);
        }
      }
      list.unshift(html);
      localStorage.setItem('searchHistory', JSON.stringify(list.slice(0, 5)))
    } else {
      localStorage.setItem('searchHistory', JSON.stringify([html]))
    }
    localStorage.setItem('sourceToFundDetail', window.location.pathname + window.location.search)
    window.location = addqueryarg('/page/fund/fundDetail', {
      fundCode: $(this).find('.title .right').text()
    });
  });
};
