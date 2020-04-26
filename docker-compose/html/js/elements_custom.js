/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Parallax
5. Init Progress Bars
6. Init Accordions
7. Init Loaders
8. Init Milestones


******************************/

$(document).ready(function()
{
	"use strict";

	/* 

	1. Vars and Inits

	*/

	var ctrl = new ScrollMagic.Controller();
	var header = $('.header');
	var menuActive = false;
	var hamb = $('.hamburger_container');
	var menu = $('.fs_menu_container');
	var hambIcon = $('.hamburger_icon');

	setHeader();

	$(window).on('resize', function()
	{
		setHeader();
	});

	$(document).on('scroll', function()
	{
		setHeader();
	});

	initMenu();
	initParallax();
	initProgressBars();
	initAccordions();
	initLoaders();
	initMilestones();

	/* 

	2. Set Header

	*/

	function setHeader()
	{
		if(window.innerWidth < 992)
		{
			if($(window).scrollTop() > 100)
			{
				header.css({'height':"80"});
			}
			else
			{
				header.css({'height':"110"});
			}
		}
		else
		{
			if($(window).scrollTop() > 100)
			{
				header.css({'height':"80"});
			}
			else
			{
				header.css({'height':"110"});
			}
		}
		if(window.innerWidth > 991 && menuActive)
		{
			closeMenu();
		}
	}

	/* 

	3. Init Menu

	*/

	function initMenu()
	{
		if($('.hamburger_container').length)
		{
			hamb.on('click', function()
			{
				if(!menuActive)
				{
					openMenu();
				}
				else
				{
					closeMenu();
				}
			});
		}
	}

	function openMenu()
	{
		menu.addClass('active');
		setTimeout(function()
		{
			hambIcon.addClass('active');
		},500);
		menuActive = true;
	}

	function closeMenu()
	{
		menu.removeClass('active');
		setTimeout(function()
		{
			hambIcon.removeClass('active');
		},500);
		menuActive = false;
	}

	/* 

	4. Init Parallax

	*/

	function initParallax()
	{
		if($('.prlx_parent').length && $('.prlx').length)
		{
			var elements = $('.prlx_parent');

			elements.each(function()
			{
				var ele = this;
				var bcg = $(ele).find('.prlx');

				var slideParallaxScene = new ScrollMagic.Scene({
			        triggerElement: ele,
			        triggerHook: 1,
			        duration: "200%"
			    })
			    .setTween(TweenMax.from(bcg, 1, {y: '-30%', ease:Power0.easeNone}))
			    .addTo(ctrl);
			});
		}
	}

	/* 

	5. Init Progress Bars

	*/

	function initProgressBars()
	{
		if($('.skill_bars').length)
		{
			var bars = $('.skill_bars');

			bars.each(function()
			{
				var ele = $(this);
	    		var elePerc = ele.data('perc');
	    		var eleName = '#' + ele.attr('id');

	    		var statsScene = new ScrollMagic.Scene({
		    		triggerElement: this,
		    		triggerHook: 'onEnter',
		    		reverse:false
		    	})
		    	.on('start', function()
		    	{
		    		var pbar = new ProgressBar.Line(eleName, 
		    		{
		    			strokeWidth: 0.5,
						easing: 'easeInOut',
						duration: 1400,
						color: '#ff4200',
						trailColor: '#f0f0f0',
						trailWidth: 1,
						svgStyle: {display: 'block', width: '100%', height: '100%'},
						text: {
							style: {
								// Text color.
								// Default: same as stroke color (options.color)
								fontFamily: 'Open Sans',
								letterSpacing: '0.3em',
								textAlign: 'right',
								fontSize: '11px',
								width: '48px',
								color: '#1c1c1c',
								position: 'absolute',
								left: 'calc' + '(' + (elePerc * 100) + '% - 48px' + ')',
								top: '17px',
								padding: 0,
								margin: 0,
								transform: null
								},
								autoStyleContainer: false
						},
						from: {color: '#00bcd5'},
						to: {color: '#00bcd5'},
						step: function(state, bar) {
						bar.setText(Math.round(bar.value() * 100) + ' %');
						}
		    		});
		    		pbar.animate(elePerc);
		    	})
		    	.addTo(ctrl);
			})
		}
	}

	/* 

	6. Init Accordions

	*/

	function initAccordions()
	{
		if($('.accordion').length)
		{
			var accs = $('.accordion');

			accs.each(function()
			{
				var acc = $(this);

				acc.on('click', function()
				{
					acc.toggleClass('active');
					
					var panel = $(acc.next());
					var panelH = panel.prop('scrollHeight') + "px";
					
					if(panel.css('max-height') == "0px")
					{
						panel.css('max-height', panel.prop('scrollHeight') + "px");
					}
					else
					{
						panel.css('max-height', "0px");
						
					} 
				});
			});
		}
	}

	/* 

	7. Init Loaders

	*/

	function initLoaders()
	{
		if($('.loader').length)
		{
			var loaders = $('.loader');

			loaders.each(function()
			{
				var loader = this;
				var endValue = $(loader).data('perc');

				var loaderScene = new ScrollMagic.Scene({
		    		triggerElement: this,
		    		triggerHook: 'onEnter',
		    		reverse:false
		    	})
		    	.on('start', function()
		    	{
		    		var bar = new ProgressBar.Circle(loader,
					{
						color: '#aaa',
						// This has to be the same size as the maximum width to
						// prevent clipping
						strokeWidth: 4,
						trailWidth: 1.6,
						easing: 'easeInOut',
						duration: 1400,
						text:
						{
							autoStyleContainer: false
						},
						from:{ color: '#ff4200', width: 2 },
						to: { color: '#ff4200', width: 2 },
						// Set default step function for all animate calls
						step: function(state, circle)
						{
							circle.path.setAttribute('stroke', state.color);
							circle.path.setAttribute('stroke-width', state.width);

							var value = Math.round(circle.value() * 100);
							if (value === 0)
							{
								circle.setText('0%');
							}
							else
							{
								circle.setText(value + "%");
							}
						}
					});
					bar.text.style.fontFamily = '"Open Sans", sans-serif';
					bar.text.style.fontSize = '36px';
					bar.text.style.fontWeight = '600';
					bar.text.style.color = "#1c1c1c";


					bar.animate(endValue);  // Number from 0.0 to 1.0
		    	})
			    .addTo(ctrl);
			});
		}
	}

	/* 

	8. Init Milestones

	*/

	function initMilestones()
	{
		if($('.milestone_counter').length)
		{
			var milestoneItems = $('.milestone_counter');

	    	milestoneItems.each(function(i)
	    	{
	    		var ele = $(this);
	    		var endValue = ele.data('end-value');
	    		var eleValue = ele.text();

	    		var milestoneScene = new ScrollMagic.Scene({
		    		triggerElement: this,
		    		triggerHook: 'onEnter',
		    		reverse:false
		    	})
		    	.on('start', function()
		    	{
		    		var counter = {value:eleValue};
		    		var counterTween = TweenMax.to(counter, 4,
		    		{
		    			value: endValue,
		    			roundProps:"value", 
						ease: Circ.easeOut, 
						onUpdate:function()
						{
							document.getElementsByClassName('milestone_counter')[i].innerHTML = counter.value;
						}
		    		});
		    	})
			    .addTo(ctrl);
	    	});
		}
	}
});