;(function ($, window, document, undefined) {
	var pluginName = "auto-scroll",
		defaults = {
			scrollBy: "item",
			speed: "medium",
			swipingTimeout: 5000
		},
		timeline = null;

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			this.page = $(this.element).find(".page");

			// Set scroll speed.
			if (this.options.scrollBy == "continuous") {
				if (this.options.speed == "fastest") {
					speed = 50;
				}
				else if (this.options.speed == "fast") {
					speed = 40;
				}
				else if (this.options.speed == "medium") {
					speed = 30;
				}
				else if (this.options.speed == "slow") {
					speed = 20;
				}
				else {
					speed = 10;
				}
			}
		},
		getDuration: function(pixelsPerSecond) {
			var duration = Math.abs((this.page.outerHeight(true) - $(this.element).outerHeight(true)) / pixelsPerSecond);
			console.log(duration);
			return duration;
		},
		/* Scroll items continuously without stopping. */
		startContinuousScroll: function() {
			timeline = new TimelineMax({ repeat: -1 });

			//Scroll to end of content.
			timeline.to(this.page, this.getDuration(speed), {
				marginTop: -(this.page.outerHeight(true) - $(this.element).outerHeight(true)),
				ease: Linear.easeNone,
				onComplete: function() {
					$(this.element).trigger("onLastItemScrolled");
				}
			});

			//Scroll back to start.
			timeline.to(this.page, this.getDuration(300), {
				marginTop: 0,
				ease: Linear.easeNone,
				onComplete: function() {
					$(this.element).trigger("onLastItemScrolled");
				}
			});
		}
	};

	Plugin.prototype.play = function() {
		if (this.options.scrollBy === "continuous") {
			if (timeline) {
				timeline.resume();
			}
			else {
				this.startContinuousScroll();
			}
		}
	};

	Plugin.prototype.pause = function() {
		if (timeline) {
			timeline.pause();
		}
	};

	Plugin.prototype.stop = function() {
		if (timeline) {
			timeline.kill();
		}

		this.element = null;
		this.page = null;
	};

	// A lightweight plugin wrapper around the constructor that prevents multiple instantiations.
	$.fn.autoScroll = function(options) {
		return this.each(function() {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);
