/**
 * blazy懒加载思路
 * 1.return一个Blazy函数
 *  函数中首先扩展默认的参数，同时暴露出一些方法(load,destroy,revalidate)
 *  revalidate:手动重新初始化
 *  destroy:手动自毁
 *  load:手动加载某个元素
 *  给判断并加载元素的函数加节流器
 *  给得到视框大小的函数加节流器
 *  执行得到视框大小的函数
 *  异步执行初始化
 * 2.初始化
 *  创建元素集
 *  计算元素集的个数
 *  绑定事件
 *  执行一遍判断并加载元素的函数
 * 3.validate 函数
 *  判断元素集里的元素是否符合加载条件，符合就加载并移除这个元素
 *  如果元素级里的元素都被加载完成，那就自毁
 */
/**
 * 使用方式
 * var bLazy = new Blazy({
    // Options
   });
 */
;
(function(root, blazy) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register bLazy as an anonymous module
        define(blazy);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = blazy();
    } else {
        // Browser globals. Register bLazy on window
        root.Blazy = blazy();
    }
})(this, function() {
    'use strict';

    //private vars
    var _source, _viewport, _isRetina, _supportClosest, _attrSrc = 'src', _attrSrcset = 'srcset';

    // constructor
    return function Blazy(options) {
        //IE7- fallback for missing querySelectorAll support
        //兼容querySelectorAll选择器
        if (!document.querySelectorAll) {
            var s = document.createStyleSheet();
            document.querySelectorAll = function(r, c, i, j, a) {
                a = document.all, c = [], r = r.replace(/\[for\b/gi, '[htmlFor').split(',');
                for (i = r.length; i--;) {
                    s.addRule(r[i], 'k:v');
                    for (j = a.length; j--;) a[j].currentStyle.k && c.push(a[j]);
                    s.removeRule(0);
                }
                return c;
            };
        }

        //options and helper vars
        var scope = this;
        var util = scope._util = {};
        util.elements = [];
        util.destroyed = true;
        //如果没有操作就为空
        scope.options = options || {};
        //失败后的回调函数
        scope.options.error = scope.options.error || false;
        //偏移量
        scope.options.offset = scope.options.offset || 100;
        //根
        scope.options.root = scope.options.root || document;
        //成功后的回调函数
        scope.options.success = scope.options.success || false;
        //选择器，b-lazy类的所有元素
        scope.options.selector = scope.options.selector || '.b-lazy';
        //分隔，应对<img class="b-lazy" data-src="image.jpg|retina-image.jpg" />
        scope.options.separator = scope.options.separator || '|';
        scope.options.containerClass = scope.options.container;
        scope.options.container = scope.options.containerClass ? document.querySelectorAll(scope.options.containerClass) : false;
        //加载失败后添加的类
        scope.options.errorClass = scope.options.errorClass || 'b-error';
        //设置断点
        scope.options.breakpoints = scope.options.breakpoints || false;
        scope.options.loadInvisible = scope.options.loadInvisible || false;
        //加载成功后添加的类
        scope.options.successClass = scope.options.successClass || 'b-loaded';
        //验证时的延迟，节流器的延迟
        scope.options.validateDelay = scope.options.validateDelay || 25;
        //保存屏幕大小的延迟，节流器的延迟
        scope.options.saveViewportOffsetDelay = scope.options.saveViewportOffsetDelay || 50;
        //data-srcset中带有不同分辨率的图片的路径 data-srcset="large.jpg 1024w, medium.jpg 640w, small.jpg 320w"
        scope.options.srcset = scope.options.srcset || 'data-srcset';
        //图片路径
        scope.options.src = _source = scope.options.src || 'data-src';
        _supportClosest = Element.prototype.closest;
        //判断是否Retina屏
        _isRetina = window.devicePixelRatio > 1;
        _viewport = {};
        //处理过偏移的位置
        _viewport.top = 0 - scope.options.offset;
        _viewport.left = 0 - scope.options.offset;


        /* public functions
         ************************************/

        //全局的函数
        //在这个例子中scope是var bLazy
        /**
         * 重新初始化
         */
        scope.revalidate = function() {
            initialize(scope);
        };
        /**
         * 加载某个元素
         *
         * @param elements
         * @param force 是否强制加载
         */
        scope.load = function(elements, force) {
            var opt = this.options;
            if (elements && elements.length === undefined) {
                loadElement(elements, force, opt);
            } else {
                each(elements, function(element) {
                    loadElement(element, force, opt);
                });
            }
        };

        /**
         * destroy 方法
         * 自毁
         */
        scope.destroy = function() {
            //缓存全局变量，加快访问
            var util = scope._util;
            //解绑所有事件
            if (scope.options.container) {
                each(scope.options.container, function(object) {
                    unbindEvent(object, 'scroll', util.validateT);
                });
            }
            unbindEvent(window, 'scroll', util.validateT);
            unbindEvent(window, 'resize', util.validateT);
            unbindEvent(window, 'resize', util.saveViewportOffsetT);
            util.count = 0;
            util.elements.length = 0;
            util.destroyed = true;
        };

        //throttle, ensures that we don't call the functions too often
        //throttle会返回一个函数，用来给事件来调用
        /**
         * validateT 方法
         * 被加上节流器的用于判断和机载元素的函数
         */
        util.validateT = throttle(function() {
            validate(scope);
        }, scope.options.validateDelay, scope);
        /**
         * saveViewportOffsetT
         * 被加上节流器的重新得到视框的函数
         */
        util.saveViewportOffsetT = throttle(function() {
            //得到视框
            saveViewportOffset(scope.options.offset);
        }, scope.options.saveViewportOffsetDelay, scope);
        //得到视框
        saveViewportOffset(scope.options.offset);

        //handle multi-served image src (obsolete)
        each(scope.options.breakpoints, function(object) {
            if (object.width >= window.screen.width) {
                _source = object.src;
                return false;
            }
        });

        // 异步地初始化
        setTimeout(function() {
            initialize(scope);
        });

    };


    /* Private helper functions
     ************************************/
    /**
     * initialize 初始化
     * 1.创建元素集
     * 2.计算元素集的个数
     * 3.绑定事件
     * 4.执行一遍判断并加载元素的函数
     *
     * @param self
     */
    function initialize(self) {
        //保存全局变量，提升性能
        var util = self._util;
        //得到.b-lazy类的元素
        util.elements = toArray(self.options);
        //得到元素
        util.count = util.elements.length;
        //如果是被自毁了，重新绑定函数
        if (util.destroyed) {
            util.destroyed = false;
            if (self.options.container) {
                //试想一个带滚动条的元素
                each(self.options.container, function(object) {
                    bindEvent(object, 'scroll', util.validateT);
                });
            }
            //resize后重新得到视框大小
            bindEvent(window, 'resize', util.saveViewportOffsetT);
            //resize后判断并加载元素
            bindEvent(window, 'resize', util.validateT);
            //scroll滚动后判断并加载元素
            bindEvent(window, 'scroll', util.validateT);
        }
        //执行一遍判断并加载元素
        validate(self);
    }

    /**
     * validate 函数
     * 判断元素集里的元素是否符合加载条件，符合就加载并移除这个元素
     * 如果元素级里的元素都被加载完成，那就自毁
     * @param self
     */
    function validate(self) {
        //缓存全局变量
        var util = self._util;
        //util.count是元素的个数，遍历元素
        for (var i = 0; i < util.count; i++) {
            //当前元素
            var element = util.elements[i];
            //如果元素在窗口中，或是有加载成功的类（在窗口中理应被加载，判断加载成功的类是为了加载预设定的和漏网之鱼）
            if (elementInView(element, self.options) || hasClass(element, self.options.successClass)) {
                //加载元素
                self.load(element);
                //移除这个元素，其他不在需加载的行列
                util.elements.splice(i, 1);
                util.count--;
                i--;
            }
        }
        //如果发现所有元素都完成了，那就破坏绑定，更优性能，垃圾被回收
        if (util.count === 0) {
            self.destroy();
        }
    }

    function elementInView(ele, options) {
        //得到元素相对于窗口的位置
        var rect = ele.getBoundingClientRect();
        //如果指明是相对于父框
        if(options.container && _supportClosest){
            // Is element inside a container?
            var elementContainer = ele.closest(options.containerClass);
            if(elementContainer){
                var containerRect = elementContainer.getBoundingClientRect();
                // Is container in view?
                if(inView(containerRect, _viewport)){
                    var top = containerRect.top - options.offset;
                    var right = containerRect.right + options.offset;
                    var bottom = containerRect.bottom + options.offset;
                    var left = containerRect.left - options.offset;
                    var containerRectWithOffset = {
                        top: top > _viewport.top ? top : _viewport.top,
                        right: right < _viewport.right ? right : _viewport.right,
                        bottom: bottom < _viewport.bottom ? bottom : _viewport.bottom,
                        left: left > _viewport.left ? left : _viewport.left
                    };
                    // Is element in view of container?
                    return inView(rect, containerRectWithOffset);
                } else {
                    return false;
                }
            }
        }      
        return inView(rect, _viewport);
    }

    /**
     * 判断是否完全在视框当中
     */
    function inView(rect, viewport){
        // Intersection
        return rect.right >= viewport.left &&
               rect.bottom >= viewport.top && 
               rect.left <= viewport.right && 
               rect.top <= viewport.bottom;
    }

    /**
     * 加载元素
     * @param ele
     * @param force
     * @param options
     */

    function loadElement(ele, force, options) {
        // if element is visible, not loaded or forced
        //如果没有被加载过，且满足强制加载，加载看不见的，元素是有大小的其中一条
        if (!hasClass(ele, options.successClass) && (force || options.loadInvisible || (ele.offsetWidth > 0 && ele.offsetHeight > 0))) {
            //得到data-src上的地址
            var dataSrc = getAttr(ele, _source) || getAttr(ele, options.src);
            //如果地址存在
            if (dataSrc) {
                var dataSrcSplitted = dataSrc.split(options.separator);
                var src = dataSrcSplitted[_isRetina && dataSrcSplitted.length > 1 ? 1 : 0];
                //得到不同分辨率的信息
                var srcset = getAttr(ele, options.srcset);
                //判断是不是img
                var isImage = equal(ele, 'img');
                //得到父节点
                var parent = ele.parentNode;
                //判断父元素是不是picture
                var isPicture = parent && equal(parent, 'picture');
                // Image or background image
                //如果是一个img标签或者是要添加背景图
                if (isImage || ele.src === undefined) {
                    //创建一个新img标签
                    var img = new Image();
                    // using EventListener instead of onerror and onload
                    // due to bug introduced in chrome v50 
                    // (https://productforums.google.com/forum/#!topic/chrome/p51Lk7vnP2o)
                    //说明加载失败时发生什么
                    var onErrorHandler = function() {
                        //失败的回调函数
                        if (options.error) options.error(ele, "invalid");
                        //添加失败的类
                        addClass(ele, options.errorClass);
                        unbindEvent(img, 'error', onErrorHandler);
                        unbindEvent(img, 'load', onLoadHandler);
                    };
                    //说明加载
                    var onLoadHandler = function() {
                        //如果是个img标签
                        if (isImage) {
                            if(!isPicture) {
                                handleSources(ele, src, srcset);
                            }

                        } else {
                            //如果不是个img那么就在背景上设置
                            ele.style.backgroundImage = 'url("' + src + '")';
                        }
                        //加载完成后的处理
                        itemLoaded(ele, options);
                        unbindEvent(img, 'load', onLoadHandler);
                        unbindEvent(img, 'error', onErrorHandler);
                    };
                    
                    // Picture element
                    if (isPicture) {
                        img = ele; // Image tag inside picture element wont get preloaded
                        each(parent.getElementsByTagName('source'), function(source) {
                            handleSource(source, _attrSrcset, options.srcset);
                        });
                    }
                    bindEvent(img, 'error', onErrorHandler);
                    bindEvent(img, 'load', onLoadHandler);
                    handleSources(img, src, srcset); // Preload

                } else {
                    //应对iframe,unity games, simpel video etc(他们也有src属性)
                    ele.src = src;
                    //加载完成后的处理
                    itemLoaded(ele, options);
                }
            } else {
                // video with child source
                if (equal(ele, 'video')) {
                    each(ele.getElementsByTagName('source'), function(source) {
                        handleSource(source, _attrSrc, options.src);
                    });
                    ele.load();
                    itemLoaded(ele, options);
                } else {
                    if (options.error) options.error(ele, "missing");
                    addClass(ele, options.errorClass);
                }
            }
        }
    }

    /**
     * itemLoaded 函数
     *
     * 元素加载成功后的操作
     *
     * @param ele   元素
     * @param options   操作
     */
    function itemLoaded(ele, options) {
        //添加load成功后的类
        addClass(ele, options.successClass);
        //如果有成功后的回调函数，调用回调
        if (options.success) {options.success(ele);}
        //移除src和srcset属性
        removeAttr(ele, options.src);
        removeAttr(ele, options.srcset);
        each(options.breakpoints, function(object) {
            removeAttr(ele, object.src);
        });
    }

    /**
     * 把dataAttr的值转移给attr，并删除dataArr属性
     *
     * @param ele 被操作的元素
     * @param attr 新设的属性名
     * @param dataAttr 旧的属性名
     */
    function handleSource(ele, attr, dataAttr) {
        var dataSrc = getAttr(ele, dataAttr);
        if (dataSrc) {
            setAttr(ele, attr, dataSrc);
            removeAttr(ele, dataAttr);
        }
    }

    /**
     * 应对是不同分辨率的情况
     * @param ele
     * @param src
     * @param srcset
     */
    function handleSources(ele, src, srcset){
        if(srcset) {
            setAttr(ele, _attrSrcset, srcset); //srcset
        }
        ele.src = src; //src 
    }
    //得到窗口大小
    function saveViewportOffset(offset) {
        //得到底边=窗口的大小+设定的偏差
        _viewport.bottom = (window.innerHeight || document.documentElement.clientHeight) + offset;
        //得到右边=窗口的宽度+设定的偏差
        _viewport.right = (window.innerWidth || document.documentElement.clientWidth) + offset;
    }



    /**
     * 普通工具函数
     */
    //设置属性
    function setAttr(ele, attr, value){
        ele.setAttribute(attr, value);
    }
    //得到属性
    function getAttr(ele, attr) {
        return ele.getAttribute(attr);
    }
    //移除属性
    function removeAttr(ele, attr){
        ele.removeAttribute(attr); 
    }
    //返回节点名称
    function equal(ele, str) {
        return ele.nodeName.toLowerCase() === str;
    }
    //判断是否有某个类
    function hasClass(ele, className) {
        return (' ' + ele.className + ' ').indexOf(' ' + className + ' ') !== -1;
    }
    //添加类
    function addClass(ele, className) {
        if (!hasClass(ele, className)) {
            ele.className += ' ' + className;
        }
    }
    //把dom集合变成真正意义的数组
    function toArray(options) {
        var array = [];
        //根下面的.b-lazy类
        var nodelist = (options.root).querySelectorAll(options.selector);
        for (var i = nodelist.length; i--; array.unshift(nodelist[i])) {}
        return array;
    }

    //绑定事件
    function bindEvent(ele, type, fn) {
        if (ele.attachEvent) {
            ele.attachEvent && ele.attachEvent('on' + type, fn);
        } else {
            ele.addEventListener(type, fn, { capture: false, passive: true });
        }
    }
    //解除绑定
    function unbindEvent(ele, type, fn) {
        if (ele.detachEvent) {
            ele.detachEvent && ele.detachEvent('on' + type, fn);
        } else {
            ele.removeEventListener(type, fn, { capture: false, passive: true });
        }
    }
    //让每个对象当参数，执行一遍
    function each(object, fn) {
        if (object && fn) {
            var l = object.length;
            for (var i = 0; i < l && fn(object[i], i) !== false; i++) {}
        }
    }

    //节流器
    function throttle(fn, minDelay, scope) {
        var lastCall = 0;
        //通过闭包保留lastcall的数字
        return function() {
            var now = +new Date();
            //如果时间间隔没到就返回
            if (now - lastCall < minDelay) {
                return;
            }
            //如果到了就保存新时间，执行函数
            lastCall = now;
            fn.apply(scope, arguments);
        };
    }
});
