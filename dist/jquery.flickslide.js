/*
jquery.flickslide.js v 1.2
Copyright (c) 2012 SHIFTBRAIN Inc.
Licensed under the MIT license.

https://github.com/devjam

## OPTION
imagearea: '.imagearea'		:String("selector") or Jquery Object
naviarea: '.naviarea'			:String("selector") or Jquery Object
navibtn: '.navibtn'				:String("selector") or Jquery Object
interval: 300							:Integer	Auto slide Interval. 0 is kill auto slide
duration: 500							:Number 	duration of slide animete
easing: "liner"						:String(jquery.easing.js)		easing of slide animete
width: 0									:Integer	view area width. 0 is fit image width
"min-width": 0						:Integer	view area min width
resize: false							:Bool			window.bind "resize"

## USAGE
need
slidearea: total container
imagearea: image view area
slidecontent: image container
naviarea: navi container
1 navibtn code

## example:basic
html
<div id="slidearea"><!-- slidearea: total container -->
	<div class="imagearea"><!-- imagearea: image view area -->
		<ul class="slidecontent"><!-- slidecontent: image container -->
			<li><img src="img/cut1.jpg" alt="" /></li>
			<li><img src="img/cut2.jpg" alt="" /></li>
			<li><img src="img/cut3.jpg" alt="" /></li>
			<li><img src="img/cut4.jpg" alt="" /></li>
			<li><img src="img/cut5.jpg" alt="" /></li>
		</ul>
	</div><!-- /imagearea -->
	<ul class="naviarea"><!-- naviarea: navi container -->
		<li class="navibtn"><a href="javascript:void(0);" onclick="return false;"><img src="img/btn_slide_off.gif" width="17" height="16" /></a></li><!--
	</ul>
</div><!-- /slidearea -->

JavaScript
$("#slidearea").FlickSlide({interval:500, resize:true, easing:"easeOutExpo"});
$("#slidearea").FlickSlide.initSlide();

## example:replace image
JavaScript
$("#slidearea").FlickSlide({interval:500, resize:true, easing:"easeOutExpo"});
$("#slidearea").FlickSlide.setImage([
	"img/cut1.jpg",
	"img/cut2.jpg",
	"img/cut3.jpg",
	"img/cut4.jpg",
	"img/cut5.jpg",
]);
*/
(function() {

  (function(jQuery) {
    var $;
    $ = jQuery;
    return $.fn.FlickSlide = function(config) {
      var defaultConfig, options;
      defaultConfig = {
        imagearea: '.imagearea',
        naviarea: '.naviarea',
        navibtn: '.navibtn',
        interval: 300,
        duration: 500,
        easing: "liner",
        width: 0,
        "min-width": 0,
        resize: false
      };
      options = $.extend(true, {}, defaultConfig, config);
      return this.each(function() {
        var navibtn, size1, size2, size3, style,
          _this = this;
        if (options.imagearea instanceof jQuery.fn.init) {
          this.imagearea = options.imagearea;
        } else {
          this.imagearea = $(this).find(options.imagearea);
        }
        if (options.naviarea instanceof jQuery.fn.init) {
          this.naviarea = options.naviarea;
        } else {
          this.naviarea = $(this).find(options.naviarea);
        }
        if (options.navibtn instanceof jQuery.fn.init) {
          navibtn = options.navibtn;
        } else {
          navibtn = $(this).find(options.navibtn);
        }
        this.btn_base = navibtn.parent().html();
        this.stage = this.imagearea.find(".slidecontent");
        size1 = this.imagearea.size();
        size2 = this.naviarea.size();
        size3 = navibtn.size();
        if (size1 !== 1 || size2 !== 1 || size3 < 1) {
          $.fn.FlickSlide.initSlide = function() {
            return false;
          };
          return;
        }
        $.fn.FlickSlide.setImage = function(data) {
          var i, l;
          if (_this.Timer != null) {
            clearInterval(_this.Timer);
          }
          _this.naviarea.empty();
          _this.imagearea.empty();
          _this.imagearea.append('<ul class="slidecontent"></ul>');
          _this.stage = _this.imagearea.find(".slidecontent");
          l = data.length;
          i = 0;
          while (i < l) {
            _this.stage.append('<li><img src="' + data[i] + '" ></li>');
            i++;
          }
          return $(_this).FlickSlide.initSlide();
        };
        $.fn.FlickSlide.setImagesPosition = function() {
          var d, l, n, nx, oldw, oldx;
          if (_this.x != null) {
            oldx = _this.x * -1;
          } else {
            _this.x = 0;
            oldx = -1;
          }
          l = _this.stage.find("li").size();
          oldw = _this.stage.find("li").width();
          _this.stage.width(_this.areaWidth * l);
          _this.stage.find("li").each(function(i, el) {
            return $(el).width(_this.areaWidth);
          });
          n = Math.round(oldx / oldw);
          if (n > l - 1) {
            n = l - 1;
          }
          if (n < 0) {
            n = 0;
          }
          nx = _this.areaWidth * n;
          if (nx !== oldx) {
            _this.x = nx * -1;
            _this.stage.stop().queue([]);
            d = 1;
            if (oldx >= 0) {
              d = options.duration;
            }
            return _this.stage.animate({
              left: _this.x
            }, d, options.easing);
          }
        };
        $.fn.FlickSlide.initSlide = function() {
          var l;
          $(_this).FlickSlide.updateSize();
          $(_this).FlickSlide.setImagesPosition();
          $(_this).FlickSlide.setNavi();
          $(_this).FlickSlide.updateNavi(_this.x);
          if (_this.Timer != null) {
            clearInterval(_this.Timer);
          }
          if (options.interval > 0) {
            l = _this.stage.find("li").size();
            if (l > 1) {
              _this.waitTime = 0;
              return _this.Timer = setInterval(function() {
                var n, next, x;
                if (!_this.touched) {
                  _this.waitTime++;
                  if (_this.waitTime > options.interval) {
                    _this.waitTime = 0;
                    x = _this.stage.position().left;
                    x *= -1;
                    n = Math.round(x / _this.areaWidth);
                    l = _this.naviarea.find("a > *").size();
                    next = (n + 1) % l;
                    x = next * _this.areaWidth * -1;
                    _this.stage.animate({
                      left: x
                    }, options.duration);
                    $(_this).FlickSlide.updateNavi(x);
                    return _this.x = x;
                  }
                }
              }, 1000 / 100);
            }
          }
        };
        $.fn.FlickSlide.resize = function() {
          if (_this.imagearea.size() > 0) {
            $(_this).FlickSlide.updateSize();
            $(_this).FlickSlide.setImagesPosition();
            return $(_this).FlickSlide.updateNavi(_this.x);
          } else {
            if (typeof Util !== "undefined" && Util !== null) {
              return Util.window.unbindResize($(_this).FlickSlide.resize);
            } else {
              return $(window).unbind("resize", $(_this).FlickSlide.resize);
            }
          }
        };
        $.fn.FlickSlide.updateSize = function() {
          var w;
          if (options.width > 0) {
            w = options.width;
          } else {
            w = _this.imagearea.width();
          }
          if (w < options["min-width"]) {
            w = options["min-width"];
          }
          _this.areaWidth = w;
          return _this.areaHeight = _this.imagearea.height();
        };
        $.fn.FlickSlide.setNavi = function() {
          var currentbtns, i, l, _base;
          currentbtns = _this.naviarea.find("a > *").size();
          l = _this.imagearea.find("li").size();
          if (l === 1) {
            _this.naviarea.css("display", "none");
            return;
          } else {
            _this.naviarea.css("display", "block");
          }
          if (currentbtns < l) {
            i = currentbtns;
            while (i < l) {
              _this.naviarea.append(_this.btn_base);
              i++;
            }
          }
          if (typeof (_base = _this.naviarea).common === "function") {
            _base.common({
              duration: 0
            });
          }
          return _this.naviarea.find("a > *").each(function(i, el) {
            if (i < l) {
              return $(el).css("display", "block").click(function(e) {
                _this.waitTime = 0;
                _this.x = i * _this.areaWidth * -1;
                _this.stage.animate({
                  left: _this.x
                }, options.duration, options.easing);
                $(_this).FlickSlide.updateNavi(_this.x);
                e.preventDefault();
                return e.stopPropagation();
              });
            } else {
              return $(el).css("display", "none");
            }
          });
        };
        $.fn.FlickSlide.updateNavi = function(x) {
          var l, n, v;
          v = x * -1;
          n = Math.round(v / _this.areaWidth);
          l = _this.naviarea.find("a > *").size();
          if (n > l - 1) {
            n = l - 1;
          }
          if (n < 0) {
            n = 0;
          }
          _this.naviarea.find("a > *").each(function(i) {
            $(this).removeClass("active");
            if (n !== i) {
              return $(this).trigger("mouseout");
            } else {
              $(this).trigger("mouseover");
              return $(this).addClass("active");
            }
          });
          return _this.options = options;
        };
        style = {
          cursor: "pointer",
          position: 'relative',
          overflow: 'hidden'
        };
        this.imagearea.css(style);
        this.isTouch = "ontouchstart" in window;
        this.imagearea.bind({
          'touchstart mousedown': function(e) {
            var touch;
            if (_this.isTouch) {
              if (e.touches != null) {
                touch = e.touches[0];
              } else {
                touch = e.originalEvent.touches[0];
              }
              _this.pageX = touch.pageX;
            } else {
              _this.pageX = e.pageX;
            }
            _this.startX = _this.pageX;
            _this.x = parseInt(_this.stage.css('left'));
            _this.touched = true;
            _this.waitTime = 0;
            _this.stage.stop().queue([]);
            e.preventDefault();
            return e.stopPropagation();
          },
          'touchmove mousemove': function(e) {
            var pX, touch;
            if (!_this.touched) {
              return;
            }
            if (_this.isTouch) {
              if (e.touches != null) {
                touch = e.touches[0];
              } else {
                touch = e.originalEvent.touches[0];
              }
              pX = touch.pageX;
            } else {
              pX = e.pageX;
            }
            _this.x = _this.x + pX - _this.pageX;
            _this.pageX = pX;
            _this.stage.css("left", _this.x);
            $(_this).FlickSlide.updateNavi(_this.x);
            e.preventDefault();
            return e.stopPropagation();
          },
          'touchend mouseup mouseout': function(e) {
            var dis, l, n, nx, pX, t, touch, x;
            if (!_this.touched) {
              return;
            }
            _this.touched = false;
            if (_this.isTouch) {
              try {
                if (e.touches != null) {
                  touch = e.touches[0];
                } else {
                  touch = e.originalEvent.touches[0];
                }
                pX = touch.pageX;
              } catch (e) {
                pX = _this.pageX;
              }
            } else {
              pX = e.pageX;
            }
            x = _this.x + pX - _this.pageX;
            _this.pageX = pX;
            if (_this.startX < _this.pageX) {
              x += _this.areaWidth * 0.5;
            } else if (_this.startX > _this.pageX) {
              x -= _this.areaWidth * 0.5;
            }
            n = Math.round((x * -1) / _this.areaWidth);
            l = _this.naviarea.find("a > *").size();
            if (n > l - 1) {
              n = l - 1;
            }
            if (n < 0) {
              n = 0;
            }
            _this.x = _this.areaWidth * n * -1;
            nx = _this.stage.css("left").replace("px", "");
            dis = _this.x - nx;
            if (dis < 0) {
              dis *= -1;
            }
            t = options.duration * (dis / _this.areaWidth);
            _this.stage.animate({
              left: _this.x
            }, t, options.easing);
            $(_this).FlickSlide.updateNavi(_this.x);
            e.preventDefault();
            return e.stopPropagation();
          }
        });
        if (options.resize) {
          if (typeof Util !== "undefined" && Util !== null) {
            return Util.window.bindResize($(this).FlickSlide.resize);
          } else {
            return $(window).bind("resize", $(this).FlickSlide.resize);
          }
        }
      });
    };
  })(jQuery);

}).call(this);
