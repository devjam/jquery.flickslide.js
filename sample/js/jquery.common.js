(function() {
  if (typeof console === "undefined" || console === null) {
    console = { log: function() {} };
  }

  if(jQuery){
    init(jQuery);
  }else{
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.onload = function(){init(jQuery.noConflict(true));};
    s.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
    document.body.appendChild(s);
    s = null;
  }

  //スマホ振り分け
  if($.ua.isSmartPhone){
    var url = location.href;
    if(url.indexOf("/map/") == -1 && url.indexOf("/guide/") == -1 && url.indexOf("/banner/") == -1 && (url.indexOf("index.html") != -1 || url.indexOf(".html") == -1)) {
      var redirect = url.replace("/onsen/", "/onsen/m/");
      if(redirect != url.href){
        location.replace(redirect);
      }
    }
  }


  function init($) {
    var ua = navigator.userAgent.toLowerCase();
    //？$にua足して良いか
    $.ua = {
      // IE
      isIE: /msie (\d+)/.test(ua),
      // IE6
      isIE6: /msie (\d+)/.test(ua) && RegExp.$1 == 6,
      // IE7
      isIE7: /msie (\d+)/.test(ua) && RegExp.$1 == 7,
      // IE8
      isIE8: /msie (\d+)/.test(ua) && RegExp.$1 == 8,
      // IE9
      isIE9: /msie (\d+)/.test(ua) && RegExp.$1 == 9,
      // IE9未満
      isLtIE9: /msie (\d+)/.test(ua) && RegExp.$1 < 9,
      // iOS
      isIOS: /i(phone|pod|pad)/.test(ua),
      // iPhone、iPod touch
      isIPhone: /i(phone|pod)/.test(ua),
      // iPad
      isIPad: /ipad/.test(ua),
      // iPhone4
      isIPhone4: (/i(phone|pod)/.test(ua)&&window.devicePixelRatio == 2),
      // iPad3
      isIPad3: (/ipad/.test(ua)&&window.devicePixelRatio == 2),
      // Android
      isAndroid: /android/.test(ua),
      // モバイル版Android
      isAndroidMobile: /android(.+)?mobile/.test(ua)
    };
    $.ua.isPC = (!$.ua.isIOS && !$.ua.isAndroid)? true : false;
    $.ua.isTablet = ($.ua.isIPad || ($.ua.isAndroid && !$.ua.isAndroidMobile))? true : false;
    $.ua.isSmartPhone = ($.ua.isIPhone || $.ua.isAndroidMobile)? true : false;
    //IE8 msie 7.0 'Trident/4.0'
    if($.ua.isIE7 && ua.indexOf('trident/4.0') != -1){
      $.ua.isIE7 = false;
      $.ua.isIE8 = true;
    }

    $.fn.common = function(options) {
      options = $.extend({
        duration: 200,
        ease: "linear"
      }, options);
      return this.each(function() {

        //Button & PNG fix
        /*
        crossFadeButton($(this).find("img[src*='_off.'], :image[src*='_off.']"), options);
        if ($.fn.fixPng != null && $.ua.isLtIE9) {
          pngImgToBackground($(this).find("img[src$='.png'], :image[src$='.png']"));
          $(this).find("*").each(function(){
            var bg = $(this).css("background-image");
            if(bg && /\.png/.test(bg)){
              $(this).fixPng();
            }
          });
        }
        */
        // IE6対応のみ
        $(this).find("img[src*='_on']").addClass("current");
        $(this).find("img,:image").mouseover(function(){
          if($(this).hasClass('active')) return;
          if ($(this).attr("src").match(/_off./)){
            $(this).attr("src",$(this).attr("src").replace("_off.", "_on."));
            return;
          }
        }).mouseout(function(){
          if($(this).hasClass('active')) return;
          if ($(this).attr("src").match(/_on./)){
            $(this).attr("src",$(this).attr("src").replace("_on.", "_off."));
            return;
          }
        }).click(function(){
          if($(this).hasClass('active')) return;
          if ($(this).attr("src").match(/_on./)){
            $(this).attr("src",$(this).attr("src").replace("_on.", "_off."));
            return;
          }
        });
        //preload images
        var images = [];
        $(this).find("img,:image").each(function(index){
          if($(this).attr("src").match(/_off./)){
           images[index]= new Image();
            images[index].src = $(this).attr("src").replace("_off.", "_on.");
          }
          if($(this).attr("src").match(/_on./)){
            images[index]= new Image();
            images[index].src = $(this).attr("src").replace("_on.", "_off.");
          }
        });
        //PNG fix
        if ($(this).fixPng != null) {
          $(this).find("img[src$='png']").fixPng();
          $(this).find("*").each(function(index,elem){
            var $elem = $(elem);
            if($elem.css("background-image") && $elem.css("background-image").indexOf("png") > -1){
              $elem.fixPng();
            }
          });
        }

        //PositionFix
        positionFixed($(this));

        //ここまでは$this使わない

        var $this = $(this);

        // popup
        // class="popup400x600" -> window.open(this.href,"popup","width=400,height=600,...)
        $this.find("a[class^='popup']").click(function(){
          if($.browser.safari){
            window.open(this.href,"_blank");
            return false;
          }
          $(this).attr("class").match(/^popup([1-9]+[0-9]*)x([1-9]+[0-9]*)/);
          var width = RegExp.$1;
          var height = RegExp.$2;
          var state = "";
          var notHasSize = "yes";
          if(width!=null && height!=null) {
            state += "width="+width+",height="+height+",";
            notHasSize = "no";
          }
          state += "location="+notHasSize+",toolbar="+notHasSize+",directories="+notHasSize+",";
          state += "status=yes,menubar=no,scrollbars=yes,resizable=yes,alwaysRaised=yes";
          window.name = document.domain + "root";
          window.open(this.href,"popup"+(new Date()).getTime().toString(),state);
          return false;
        });
        // open in popup parent window.
        // add class="openParentWin" on a-tag in a popup window.
        $this.find("a.openParentWin").click(function(){
          window.open(this.href,document.domain + "root");
          return false;
        });

        //Smooth Scroll
        function smoothScroll() {
          var target = $(this.hash); 
          if(target.size()) { 
            var top = target.offset().top;
            $(ua.indexOf('webkit/')!=-1 ? 'body' : 'html').animate({scrollTop:top}, 800, 'swing'); 
          } 
          return false; 
        }

        $this.find('a[href^=#]').each(function(){
          if(!$(this).attr("target")) $(this).bind("click", smoothScroll);
        });

        //body class
        if($.ua.isPC) {
          $('body').addClass('pc');
        } else if($.ua.isTablet) {
          $('body').addClass('tablet');
        } else {
          $('body').addClass('smartphone');
        }

        if($.ua.isIOS) {
          $('body').addClass('ios');
        } else if($.ua.isAndroid) {
          $('body').addClass('android');
        }
      });
    };

    function crossFadeButton(jq, options) {
      var elStyle, btnStyle;
      options = $.extend({
        duration: 200,
        ease: "linear"
      }, options);

      elStyle = {
        display: "block",
        position: "relative",
        width: 0,
        height: 0
      };

      btnStyle = {
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        backgroundPositionX: 0,
        backgroundPositionY: 0,
        backgroundRepeat: "no-repeat"
      };

      return jq.each(function() {
        var img = $(this),
        src = img.attr("src");

        if (!src.match(/_o(ff|n)\./)) return;

        var el = $('<span class="cfb" />').appendTo(img.parent()),
        onBtn = $("<span />").appendTo(el),
        offBtn = $("<span />").appendTo(el);

        elStyle.width = btnStyle.width = img.width();
        elStyle.height = btnStyle.height = img.height();

        el.css(elStyle);
        onBtn.css(btnStyle).css("background-image", "url(" + src.replace("_off.", "_on.") + ")");
        offBtn.css(btnStyle).css("background-image", "url(" + src.replace("_on.", "_off.") + ")");

        if (src.match(/_on\./)) {
          offBtn.css({opacity: 0});
          el.addClass("current");
        } else {
          onBtn.css({opacity: 0});
        }
        el.hover(function() {
          if($(this).hasClass('active')) return;
          onBtn.stop().clearQueue().fadeTo(options.duration, 0.9999999999, options.ease);
          offBtn.stop().clearQueue().fadeTo(options.duration * 1.1, 0, options.ease);
          return true;
        },
        function() {
          if($(this).hasClass('active')) return;
          offBtn.stop().clearQueue().fadeTo(options.duration, 0.9999999999, options.ease);
          onBtn.stop().clearQueue().fadeTo(options.duration * 1.1, 0, options.ease);
          return true;
        });
        if (img.is(':image')) {
          var onclick = img.get(0).onclick;
          var form = img.get(0).form;
          el.click(function() {
            if(onclick != null){
              if(onclick(e) !== false)
                if(form) form.submit();
            }else{
              if(form) form.submit();
            }
            return false;
          });
        }
        img.remove();
      });
    }

    function pngImgToBackground(jq) {
      return jq.each(function() {
        var img = $(this),
        src = img.attr("src");

        if (!src.match(/\.png$/)) return;

        bg = $('<span />').appendTo(img.parent()).css({
          display: "inline-block",
          width: img.width(),
          height: img.height(),
          backgroundImage: 'url("' + src + '")',
          backgroundPositionX: 0,
          backgroundPositionY: 0,
          backgroundRepeat: "no-repeat"
        });
        if (img.is(':image')) {
          var onclick = img.get(0).onclick;
          var form = img.get(0).form;
          bg.click(function() {
            if(onclick != null){
              if(onclick(e) !== false)
                if(form) form.submit();
            }else{
              if(form) form.submit();
            }
            return false;
          });
        }
        img.remove();
      });
    }

    function positionFixed(jq) {
      if (!Util.UA.isIE6) {
        return;
      }
      jq.find("*").each(function() {
        var el, _bottom, _left, _right, _top;
        el = $(this);
        if (el.css("position") !== "fixed") {
          return;
        }
        _top = el.css("top");
        _bottom = el.css("bottom");
        _left = el.css("left");
        _right = el.css("right");
        if ((_top === "0px" || _bottom === "0px") && (_left === "0px" || _right === "0px")) {
          el.css({
            "position": "absolute",
            "top": "auto",
            "bottom": "auto",
            "left": "auto",
            "right": "auto"
          });
          el = $(this).get(0);
          if (_top === "0px") {
            el.style.setExpression('top', 'eval(0+(document.body.scrollTop||document.documentElement.scrollTop))');
          } else {
            el.style.setExpression('bottom', 0);
            el.style.setExpression('', 'this.style.filter=""');
          }
          if (_left === "0px") {
            el.style.setExpression('left', 'eval(0+(document.body.scrollLeft||document.documentElement.scrollLeft))');
          } else {
            el.style.setExpression('right', 0);
            if (_top === "0px") {
              el.style.setExpression('', 'this.style.filter=""');
            }
          }
        }
      });
    }
  }
})();

