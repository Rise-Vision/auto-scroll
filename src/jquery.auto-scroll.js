;(function ($, window, document, undefined) {
	"use strict";

	var pluginName = "auto-scroll",
		defaults = {
			scrollBy: "item",
			scrollSpeed: "medium",
			scrollResumes: 5
		},
		timeline = null,
		speed = 0;

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
			if (this.options.scrollBy === "continuous") {
				if (this.options.scrollSpeed === "fastest") {
					speed = 50;
				}
				else if (this.options.scrollSpeed === "fast") {
					speed = 40;
				}
				else if (this.options.scrollSpeed === "medium") {
					speed = 30;
				}
				else if (this.options.scrollSpeed === "slow") {
					speed = 20;
				}
				else {
					speed = 10;
				}
			}
		},
		// Check if content is larger than viewable area.
		canScroll: function() {
			return this.page.height() > $(this.element).height();
		},
		getDuration: function(pixelsPerSecond) {
			var duration = Math.abs((this.page.outerHeight(true) - $(this.element).outerHeight(true)) / pixelsPerSecond);

			return duration;
		},
		// Scroll items continuously without stopping.
		startContinuousScroll: function() {
			timeline = new TimelineMax({ repeat: -1 });

			//Scroll to end of content.
			timeline.to(this.page, this.getDuration(speed), {
				marginTop: -(this.page.outerHeight(true) - $(this.element).outerHeight(true)),
				delay: this.options.scrollResumes,
				ease: Linear.easeNone,
				onComplete: function() {
					$(this.element).trigger("onLastItemScrolled");
				}
			});

			//Scroll back to start.
			//timeline.to(this.page, this.getDuration(300), {
			timeline.to(this.page, 2, {
				marginTop: 0,
				delay: this.options.scrollResumes,
				ease: Linear.easeNone,
				onComplete: function() {
					$(this.element).trigger("onLastItemScrolled");
				}
			});
		}
	};

	Plugin.prototype.play = function() {
		if (this.canScroll() && (this.options.scrollBy !== "none")) {
			if (this.options.scrollBy === "continuous") {
				if (timeline) {
					timeline.resume();
				}
				else {
					this.startContinuousScroll();
				}
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
