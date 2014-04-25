;(function ($, window, document, undefined) {
	"use strict";

	var pluginName = "auto-scroll",
		defaults = {
			scrollBy: "item",
			scrollSpeed: "medium",
			scrollResumes: 5
		},
		timeline = null,
		scrollResumesTimer = null,
		speed = 0,
		previousDelta = 0;

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			var self = this;

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

			// Configure touch event handlers for swiping.
			if (this.canScroll()) {
				Hammer(this.element).on("dragstart", function() {
					self.pause();
				});

				Hammer(this.element).on("drag", function(event) {
					var swipeTimeline = new TimelineMax();	//Add this to the existing timeline so that the main timeline knows where to resume from?
					var currentDelta = event.gesture.deltaY;
					var margin = parseInt(self.page.css("margin-top"));
					var newMargin = margin + currentDelta - previousDelta;

					// Do nothing if we're already at the top and trying to scroll down.
					if ((margin === 0) && (currentDelta - previousDelta > 0)) {
						return;
					}
					// Do nothing if we're already at the bottom and trying to scroll up.
					else if (((margin + self.page.outerHeight()) === $(self.element).outerHeight(true)) &&
						(currentDelta - previousDelta < 0)) {
						return;
					}
					// Don't scroll past the top of the content.
					else if (newMargin > 0) {
						newMargin = 0;
					}
					// Don't scroll past the bottom of the content.
					else if (newMargin < ($(self.element).outerHeight(true) - self.page.outerHeight())) {
						newMargin = $(self.element).outerHeight(true) - self.page.outerHeight();
					}

					swipeTimeline.to(self.page, 0.01, {
						marginTop: newMargin,
						ease: Linear.easeNone
					});

					previousDelta = currentDelta;
				});

				Hammer(this.element).on("dragend", function() {
					// Resume scrolling after "Scroll Resumes" time has passed.
					clearTimeout(scrollResumesTimer);

					scrollResumesTimer = setTimeout(function() {
						self.play();
					}, self.options.scrollResumes * 1000);

					previousDelta = 0;
					$(self.element).trigger("onSwipeEnd");
				});
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
