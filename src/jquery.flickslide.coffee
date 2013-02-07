###
jquery.flickslide.js v 1.4
Copyright (c) 2013 SHIFTBRAIN Inc.
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

## EVENT
slidestart(e, id)

## method
.FlickSlide({config})
.FlickSlide("init")
.FlickSlide("update")
.FlickSlide("resize")
.FlickSlide("destory")
.FlickSlide("setImage", [urls])

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
$("#slidearea").FlickSlide("init");

## example:replace image
JavaScript
$("#slidearea").FlickSlide({interval:500, resize:true, easing:"easeOutExpo"});
$("#slidearea").FlickSlide("setImage", [
	"img/cut1.jpg",
	"img/cut2.jpg",
	"img/cut3.jpg",
	"img/cut4.jpg",
	"img/cut5.jpg",
]);

###
$ = jQuery
pluginname = 'FlickSlide'

class FlickSlide
	defaults = 
		imagearea: '.imagearea'
		naviarea: '.naviarea'
		navibtn: '.navibtn'
		interval: 300
		duration: 500
		easing: "liner"
		width: 0
		"min-width": 0
		resize: false

	constructor: (config, callback, element)->
		@element = $(element)
		@options = $.extend(true, {}, defaults, config)
		if @setup()
			@_success = true
		@

	#----------------------------------------

	setOption: (config)->
		@options = $.extend(true, {}, FlickSlide.defaults, @options, config)

	setup: ->
		opt = @options

		if opt.imagearea instanceof jQuery.fn.init
			@imagearea = opt.imagearea
		else
			@imagearea = @element.find(opt.imagearea)

		if opt.naviarea instanceof jQuery.fn.init
			@naviarea = opt.naviarea
		else
			@naviarea = @element.find(opt.naviarea)

		if opt.navibtn instanceof jQuery.fn.init
			navibtn = opt.navibtn
		else
			navibtn = @element.find(opt.navibtn)

		@btn_base = navibtn.parent().html()
		@stage = @imagearea.find(".slidecontent")

		#----------------------------------------

		size1 = @imagearea.size()
		size2 = @naviarea.size()
		size3 = navibtn.size()
		if size1 != 1 or size2 != 1 or size3 < 1
			return false

		#----------------------------------------
		# imagearea
		style = 
			cursor: "pointer"
			position: 'relative'
			overflow: 'hidden'
		@imagearea.css(style)

		@isTouch = ("ontouchstart" of window)
		@imagearea.on(
			'touchstart mousedown': (e)=>
				if(@isTouch)						
					if e.touches?
						touch = e.touches[0]
					else
						touch = e.originalEvent.touches[0]						
					@pageX = touch.pageX
				else
					@pageX = e.pageX

				@startX = @pageX
				@x = parseInt @stage.css('left')
				@touched = true
				@waitTime = 0
				@stage.stop().queue([])
				if !@isTouch
					e.preventDefault()
					e.stopPropagation()

			'touchmove mousemove': (e)=>
				if !@touched
					return

				if(@isTouch)
					if e.touches?
						touch = e.touches[0]
					else
						touch = e.originalEvent.touches[0]						
					pX = touch.pageX
				else
					pX = e.pageX
				
				vx = pX - @pageX
				if vx < -2 or vx > 2
					@x = @x + pX - @pageX
					@pageX = pX
					@stage.css("left", @x)
					@updateNavi(@x)
					e.preventDefault()
					e.stopPropagation()

			'touchend mouseup mouseout': (e)=>
				if !@touched
					return

				@touched = false
				
				if(@isTouch)
					try 
						if e.touches?
							touch = e.touches[0]
						else
							touch = e.originalEvent.touches[0]
						pX = touch.pageX
					catch e
						pX = @pageX
					
				else
					pX = e.pageX

				x = @x + pX - @pageX
				@pageX = pX

				if @startX < @pageX
					x += @areaWidth * 0.5
				else if @startX > @pageX
					x -= @areaWidth * 0.5
				n = Math.round ((x * -1) / @areaWidth)
				l = @naviarea.find("a > *").size()
				if n > l - 1
					n = l - 1
				if n < 0
					n = 0
				@x = @areaWidth * n * -1
				nx = @stage.css("left").replace("px","")
				dis = @x - nx
				if dis < 0 
					dis *= -1

				t = @options.duration * (dis / @areaWidth)
				@stage.animate({left:@x}, t, @options.easing)
				@updateNavi(@x)

				e.preventDefault()
				e.stopPropagation()
		)
		#----------------------------------------
		if opt.resize
			if Util?
				Util.window.bindResize( =>
					@resize
				)
			else
				$(window).bind("resize", =>
					@resize
				)
		true

	#----------------------------------------

	init: ->
		@updateSize()
		@setImagesPosition()
		@setNavi()
		@updateNavi(@x)
		if @Timer?
			clearTime(@Timer)
		if @options.interval > 0
			l = @stage.find("li").size()
			if l > 1
				@waitTime = 0
				@Timer = setInterval =>
					@update
				, 1000/100

	update: ->
		if @imagearea? and @imagearea.size() > 0
			if !@touched
				@waitTime++
				if @waitTime > @options.interval
					@waitTime = 0
					x = @stage.position().left
					x *= -1
					n = Math.round( x / @areaWidth )
					l = @naviarea.find("a > *").size()
					next = (n + 1) % l
					x = next * @areaWidth * -1
					@stage.animate({left:x}, options.duration)
					@updateNavi(x)
					@x = x
		else
			@destory()

	destory: ->
		if Util?
			Util.window.unbindResize(@resize)
		else
			$(window).unbind("resize", @resize)					
		if @Timer?
			clearInterval(@Timer)
		@imagearea = null
		@naviarea = null
		@stage = null
		@resize = null
		@update = null

	resize: ->
		if @imagearea? and @imagearea.size() > 0
			@updateSize()
			@setImagesPosition()
			@updateNavi(@x)
		else
			@destory()

	setImage: (data)->
		if @Timer?
			clearInterval(@Timer)
		@naviarea.empty()
		@imagearea.empty()
		@imagearea.append '<ul class="slidecontent"></ul>'
		@stage = @imagearea.find(".slidecontent")
		l = data.length
		i = 0
		while i < l
			@stage.append('<li><img src="' + data[i] + '" ></li>')
			i++
		@init()

	#----------------------------------------

	updateSize: ->
		if @options.width > 0
			w = @options.width
		else
			w = @imagearea.width()
		if w < @options["min-width"]
			w = @options["min-width"]
		@areaWidth = w
		@areaHeight = @imagearea.height()

	setNavi: ->
		currentbtns = @naviarea.find("a > *").size()
		l = @imagearea.find("li").size()
		if l == 1
			@naviarea.css("display","none")
			return
		else
			@naviarea.css("display","block")

		if currentbtns < l
			i = currentbtns
			while i < l
				@naviarea.append @btn_base
				i++
		if $.fn.common?
			@naviarea.common("onoffButton")

		@naviarea.find("a > *").each (i, el)=>
			if i < l
				$(el).css("display", "block")
				$(el).click (e)=>
					@waitTime = 0
					@x = i * @areaWidth * -1
					@stage.animate({left:@x}, @options.duration, @options.easing)
					@updateNavi(@x)
					e.preventDefault()
					e.stopPropagation()
			else
				$(el).css("display","none")

	updateNavi: (x)->
		v = x * -1
		n = Math.round ((v) / @areaWidth)
		l = @naviarea.find("a > *").size()
		if n > l - 1
			n = l - 1
			
		if n < 0
			n = 0
		@naviarea.find("a > *").each (i, el)=>
			if n != i
				$(el).removeClass "active"
				$(el).trigger "mouseout"
			else
				if !$(el).hasClass("active") or !@touched
					@element.trigger("slidestart", n)
				$(el).trigger "mouseover"
				$(el).addClass "active"

	setImagesPosition: ->
		if @x?
			oldx = @x * -1
		else
			@x = 0
			oldx = -1

		l = @stage.find("li").size()
		oldw = @stage.find("li").width()
		@stage.width(@areaWidth * l)
		@stage.find("li").each (i, el)=>
			$(el).width(@areaWidth)
		n = Math.round (oldx / oldw)
		if n > l - 1
			n = l - 1
		if n < 0
			n = 0
		nx = @areaWidth * n
		if nx != oldx
			@x = nx * -1
			@stage.stop().queue([])
			d = 1
			if oldx >= 0
				d = @options.duration
			@stage.animate({left:@x}, d, @options.easing)

# ----------------------------------------------------------
$.fn[pluginname] = (config, args, callback) ->
	myclass = eval(pluginname)
	unless config?
		config = {}
	switch typeof config
		when 'string'
			@each ->
				instance = $.data(@, pluginname)
				unless instance? then return false
				if !$.isFunction(instance[config]) then return false
				instance[config].apply(instance, args);

		when 'object'
			@each ->
				instance = $.data(@, pluginname)
				if instance
					instance.setOption(config)
				else
					instance = new myclass(config, callback, @)
					if instance._success?
						$.data(@, pluginname, instance);