/*
 *  Project: Auto-Scroll
 *  Description: Auto-scroll plugin for use with Rise Vision Widgets
 *  Author: @donnapep
 *  License: MIT
 */

;(function ($, window, document, undefined) {
	"use strict";

	var pluginName = "autoScroll",
		defaults = {
			scrollBy: "continuous",
			scrollSpeed: "medium",
			scrollResumes: 5
		},
		isLoading = true,
		draggable = null,
		tween = null,
		resumeTween = null;

	function Plugin(element, options) {
		this.element = element;
		this.page = $(element).find(".page");
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			var speed, duration;
			var self = this;
			var calculateProgress = null;
			var scrollComplete = null;
			var pageComplete = null;
			var elementHeight = $(this.element).outerHeight(true);
			var pauseHeight = elementHeight;
			var max = this.element.scrollHeight - this.element.offsetHeight;

			if (this.canScroll()) {
				// Set scroll speed.
				if (this.options.scrollBy === "page") {
					if (this.options.scrollSpeed === "fastest") {
						speed = 0.4;
					}
					else if (this.options.scrollSpeed === "fast") {
						speed = 0.8;
					}
					else if (this.options.scrollSpeed === "medium") {
						speed = 1.2;
					}
					else if (this.options.scrollSpeed === "slow") {
						speed = 1.6;
					}
					else {
						speed = 2;
					}

					duration = this.page.outerHeight(true) / $(this.element).outerHeight(true) * speed;
				}
				else {	// Continuous or by item
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

					duration = Math.abs((this.page.outerHeight(true) - $(this.element).outerHeight(true)) / speed);
				}

				Draggable.create(this.element, {
					type: "scrollTop",
					throwProps: true,
					edgeResistance: 0.75,
					onPress: function() {
						tween.pause();

						TweenLite.killDelayedCallsTo(calculateProgress);
						TweenLite.killDelayedCallsTo(scrollComplete);
						TweenLite.killDelayedCallsTo(resumeTween);
						// Only used when scrolling by page.
						TweenLite.killDelayedCallsTo(pageComplete);
					},
					onRelease: function() {
						// Figure out what the new scroll position is and translate that
						// into the progress of the tween (0-1) so that we can calibrate it;
						// otherwise it'd jump back to where it paused when we resume().
						TweenLite.delayedCall(self.options.scrollResumes, calculateProgress = function() {
							tween.progress($(self.element).scrollTop() / max).play();
						});
					}
				});

				draggable = Draggable.get(this.element);

				tween = TweenLite.to(draggable.scrollProxy, duration, {
					scrollTop: max,
					ease: Linear.easeNone,
					delay: this.options.scrollResumes,
					paused: true,
					onUpdate: (this.options.scrollBy === "page" ? function() {
						if (Math.abs(draggable.scrollProxy.top()) >= pauseHeight) {
							tween.pause();

							// Next height at which to pause scrolling.
							pauseHeight += elementHeight;

							TweenLite.delayedCall(self.options.scrollResumes, pageComplete = function() {
								tween.resume();
							});
						}
					} : undefined),
					onComplete: function() {
						TweenLite.delayedCall(self.options.scrollResumes, scrollComplete = function() {
							TweenLite.to(self.page, 1, {
								autoAlpha: 0,
								onComplete: function() {
									tween.seek(0).pause();

									TweenLite.to(self.page, 1, {
										autoAlpha: 1,
										onComplete: function() {
											if (self.options.scrollBy === "page") {
												pauseHeight = elementHeight;
											}

											// TODO: Trigger an event instead and let the Widget decide how to handle it?
											doneEvent();
										}
									});
								}
							});
						});
					}
				});

				// Hide scrollbar.
				TweenLite.set(this.element, { clearProps:"overflowY" });
			}
		},
		// Check if content is larger than viewable area.
		canScroll: function() {
			return this.page.height() > $(this.element).height();
		}
	};

	Plugin.prototype.play = function() {
		if (this.canScroll() && (this.options.scrollBy !== "none")) {
			if (tween) {
				if (isLoading) {
					tween.play();
					isLoading = false;
				}
				else {
					TweenLite.delayedCall(this.options.scrollResumes, resumeTween = function() {
						tween.play();
					});
				}
			}
		}
	};

	Plugin.prototype.pause = function() {
		if (tween) {
			tween.pause();
		}
	};

	Plugin.prototype.stop = function() {
		if (tween) {
			tween.kill();
		}

		this.element = null;
		this.page = null;
	};

	// A lightweight plugin wrapper around the constructor that prevents multiple instantiations.
	$.fn.autoScroll = function(options) {
		return this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);
