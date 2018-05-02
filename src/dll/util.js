/**
 * Created by xiaobxia on 2017/12/26.
 */
function changeTitle(title) {
  var body = document.getElementsByTagName('body')[0];
  document.title = title;
  var iframe = document.createElement("iframe");
  iframe.setAttribute("src", "/favicon.ico");

  iframe.addEventListener('load', function () {
    setTimeout(function () {
      iframe.removeEventListener('load');
      document.body.removeChild(iframe);
    }, 0);
  });
  document.body.appendChild(iframe);
}

function setAdaptive() {
  var _baseFontSize = 20;
  //和width有关
  var winWidth = 0;
  var winHeight = 0;
  if (window.innerWidth) {
    winWidth = window.innerWidth;
  } else if ((document.body) && (document.body.clientWidth)) {
    winWidth = document.body.clientWidth;
  }
  if (window.innerHeight) {
    winHeight = window.innerHeight;
  } else if ((document.body) && (document.body.clientHeight)) {
    winHeight = document.body.clientHeight;
  }
  //通过深入Document内部对body进行检测，获取窗口大小
  if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
    winWidth = document.documentElement.clientWidth;
    winHeight = document.documentElement.clientHeight;
  }
  var _fontscale = winWidth / 375;
  var ua = navigator.userAgent;
  var matches = ua.match(/Android[\S\s]+AppleWebkit\/(\d{3})/i);
  var UCversion = ua.match(/U3\/((\d+|\.){5,})/i);
  var isUCHd = UCversion && parseInt(UCversion[1].split('.').join(''), 10) >= 80;
  var isIos = navigator.appVersion.match(/(iphone|ipad|ipod)/gi);
  var dpr = parseInt((window.devicePixelRatio || 1), 10);
  if (!isIos && !(matches && matches[1] > 534) && !isUCHd) {
    // 如果非iOS, 非Android4.3以上, 非UC内核, 就不执行高清, dpr设为1;
    dpr = 1;
  }
  var scale = 1 / dpr;
  var metaEl = document.querySelector('meta[name="viewport"]');
  if (!metaEl) {
    metaEl = document.createElement('meta');
    metaEl.setAttribute('name', 'viewport');
    document.head.appendChild(metaEl);
  }
  metaEl.setAttribute('content', 'width=device-width,user-scalable=no,initial-scale=' + scale + ',maximum-scale=' + scale + ',minimum-scale=' + scale);
  document.documentElement.style.fontSize = (_baseFontSize / 2 * dpr * _fontscale) + 'px';
  document.documentElement.setAttribute('data-dpr', dpr);
  var fontSize = _baseFontSize / 2 * dpr * _fontscale;
  window.adaptive = {
    winHeight: winHeight,
    winWidth: winWidth,
    dpr: dpr,
    fontSize: fontSize,
    baseFontSize: _baseFontSize,
    zoom: fontSize / 20
  };
}

function load(url) {
  var iFrame;
  iFrame = document.createElement("iframe");
  iFrame.setAttribute("src", url);
  iFrame.setAttribute("style", "display:none;");
  iFrame.setAttribute("height", "0px");
  iFrame.setAttribute("width", "0px");
  iFrame.setAttribute("frameborder", "0");
  document.body.appendChild(iFrame);
  iFrame.parentNode.removeChild(iFrame);
  iFrame = null;
}

function hasClass(el, cls) {
  //如果产生不对就返回
  if (!el || !cls) return false;
  //如果输入问空格
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  //["aa", "bb", value: "aa bb"]
  if (el.classList) {
    //判断是否在
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}
function addClass(el, cls) {
  if (!el) return;
  var curClass = el.className;
  var classes = (cls || '').split(' ');
  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;
    if (el.classList) {
      el.classList.add(clsName);
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}
function removeClass(el, cls) {
  if (!el || !cls) return;
  var classes = cls.split(' ');
  var curClass = ' ' + el.className + ' ';

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

//通过id
function getById(id, oParent) {
  return (oParent || document).getElementById(id);
}
// //获取tagName
// function $$(tagName, oParent) {
//   return (oParent || document).getElementsByTagName(tagName)
// }
// //通过类获取
// function $$$(className, oParent) {
//   return (oParent || document).getElementsByClassName(className)
// }

var on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
})();
var off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
})();
var once = function (el, event, fn) {
  var listener = function () {
    if (fn) {
      fn.apply(this, arguments);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};
function getQueryStringArgs() {
  //get query string without the initial ?
  var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
    //object to hold data
    args = {},
    //get individual items
    items = qs.length ? qs.split("&") : [],
    item = null,
    name = null,
    value = null,

    //used in for loop
    i = 0,
    len = items.length;

  //assign each item onto the args object
  for (i = 0; i < len; i++) {
    item = items[i].split("=");
    name = decodeURIComponent(item[0]);
    value = decodeURIComponent(item[1]);

    if (name.length) {
      args[name] = value;
    }
  }
  return args;
}
function addqueryarg(url, args) {
  var key, name, value;
  if (typeof args !== "object") {
    return false;
  }
  url += (url.indexOf("?") === -1 ? "?" : "&");
  for (key in args) {
    name = encodeURIComponent(key);
    value = encodeURIComponent(args[key]);
    url += name + "=" + value + "&";
  }
  url = url.substring(0, url.length - 1);
  return url;
}

function getQueryStringArgs(text) {
  //get query string without the initial ?
  var qs = text || (location.search.length > 0 ? location.search.substring(1) : ""),
    //object to hold data
    args = {},
    //get individual items
    items = qs.length ? qs.split("&") : [],
    item = null,
    name = null,
    value = null,

    //used in for loop
    i = 0,
    len = items.length;

  //assign each item onto the args object
  for (i = 0; i < len; i++) {
    item = items[i].split("=");
    name = decodeURIComponent(item[0]);
    value = decodeURIComponent(item[1]);

    if (name.length) {
      args[name] = value;
    }
  }
  return args;
}

var debounce = function (action, delay) {
  var timer = null;
  return function () {
    var self = this,
      args = arguments;

    clearTimeout(timer);
    timer = setTimeout(function () {
      action.apply(self, args)
    }, delay);
  }
};

function getToken() {
  return {
    userid: Cookies.get('userid'),
    'Auth-Token': Cookies.get('Auth-Token'),
    channelCode: Cookies.get('channelCode')
  }
}

function setToken(data) {
  Cookies.set('channelCode', data.channelCode);
  Cookies.set('userid', data.userid);
  Cookies.set("Auth-Token", data['Auth-Token']);
}

function getToIndexToken() {
  return {
    channelCode: Cookies.get('toIndexChannelCode'),
    phone: Cookies.get('toIndexPhone'),
    token: Cookies.get('toIndexToken'),
    userId: Cookies.get('toIndexUserId'),
    redirectType: Cookies.get('toIndexRedirectType'),
  }
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}


var queryString = getQueryStringArgs();
