/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Tabs
5. Init Flickr
6. Init Gallery
7. Init Sidebar Slider
8. Init Parallax


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
	initTabs();
	initFlickr();
	initGallery();
	initSidebarSlider();
	initParallax();

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

	4. Init Tabs

	*/

	function initTabs()
	{
		if($('.tabs').length)
		{
			var tabs = $('.tabs li');
			var tabContainers = $('.tab_container');

			tabs.each(function()
			{
				var tab = $(this);
				var tab_id = tab.data('active-tab');

				tab.on('click', function()
				{
					if(!tab.hasClass('active'))
					{
						tabs.removeClass('active');
						tabContainers.removeClass('active');
						tab.addClass('active');
						$('#' + tab_id).addClass('active');
					}
				});
			});
		}
	}

	/* 

	5. Init Flickr

	*/

	function initFlickr()
	{
		if($('.flickr_gallery').length)
		{
			setTimeout(function()
			{
				$('.colorbox').colorbox();
				
			},1000);
		}
	}

	/* 

	6. Init Gallery

	*/

	function initGallery()
	{
		if($('.gallery_item').length)
		{
			$('.gallery_item a').colorbox();
		}
	}

	/* 

	7. Init Gallery

	*/

	function initSidebarSlider()
	{
		if($('.sidebar_slider').length)
		{
			var sidebarSlider = $('.sidebar_slider');
			sidebarSlider.owlCarousel({
				items:1,
				autoplay:true,
				loop:true,
				autoplaySpeed:500,
				dots:false,
				nav:false
			});
		}
	}

	/* 

	8. Init Parallax

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
});