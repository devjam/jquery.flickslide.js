(function() {

  require(["jquery"], function() {
    return require(["util", "jquery.easing.1.3", "jquery.flickslide"], function() {
      return require(["jquery.common"], function() {
        return (function(jQuery) {
          return $(function() {
            $("#slidearea").FlickSlide({
              interval: 500,
              resize: true,
              easing: "easeOutExpo"
            });
            return $("#slidearea").FlickSlide("init");
          });
        })(jQuery);
      });
    });
  });

}).call(this);
