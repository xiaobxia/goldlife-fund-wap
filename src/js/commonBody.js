/**
 * Created by xiaobxia on 2018/4/4.
 */
function connectWebViewJavascriptBridge(callback) {
  if (window.WebViewJavascriptBridge) {
    callback(WebViewJavascriptBridge)
  } else {
    document.addEventListener(
      'WebViewJavascriptBridgeReady'
      , function() {
        callback(WebViewJavascriptBridge)
      },
      false
    );
  }
}
connectWebViewJavascriptBridge(function(bridge) {
  bridge.init(function(message, responseCallback) {
    console.log('JS got a message', message);
    var data = {
      'Javascript Responds': '测试中文!'
    };
    console.log('JS responding with', data);
    responseCallback(data);
  });

  bridge.registerHandler("backToLastUrl", function(data, responseCallback) {
    var flag = 'false';
    if (backToLastUrl) {
      flag = 'true'
    }
    responseCallback(flag);
    if (backToLastUrl) {
      backToLastUrl();
    }
  });
});

//全局注册返回
$('.mui-icon-left-nav').on('tap', function () {
  window.history.go(-1);
});

function activePasswordPopup() {
  $('.mui-popup-backdrop').addClass('mui-active');
  $('.password-popup').addClass('active');
  $('.box-item').removeClass('active');
  $('#password-input').val('');
  setTimeout(function () {
    $('#password-input').trigger('focus');
    $('#password-input').trigger('tap');
    // document.getElementById('password-input').focus();
  }, 200);
}

function hidePasswordPopup() {
  $('.mui-popup-backdrop').removeClass('mui-active');
  $('.password-popup').removeClass('active');
  $('.box-item').removeClass('active');
  $('#password-input').val('');
}

function showToast() {
  $('body').append(
    '<div class="my-toast-container"><div class="mui-toast-message"><span class="mui-spinner"></span></div></div>'
  );
}
function hideToast() {
  $('.my-toast-container').remove();
}
