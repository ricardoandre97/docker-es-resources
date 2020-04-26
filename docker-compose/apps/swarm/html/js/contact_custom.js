/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Parallax
5. Init Google Map


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
	var map;

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
	initGoogleMap();

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

	5. Init Google Map

	*/

	function initGoogleMap()
	{
		var myLatlng = new google.maps.LatLng(36.138101,-5.355313);
    	var mapOptions = 
    	{
    		center: myLatlng,
	       	zoom: 17,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			draggable: true,
			scrollwheel: false,
			zoomControl: true,
			zoomControlOptions:
			{
				position: google.maps.ControlPosition.RIGHT_CENTER
			},
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
			rotateControl: false,
			fullscreenControl: true,
			styles:[]
    	}

    	// Initialize a map with options
    	map = new google.maps.Map(document.getElementById('map'), mapOptions);

    	// Use an image for a marker
		var image = 'images/map_marker.png';
		var marker = new google.maps.Marker(
		{
			position: new google.maps.LatLng(36.138101,-5.355313),
			map: map,
			icon: image
		});

		// Re-center map after window resize
		google.maps.event.addDomListener(window, 'resize', function()
		{
			setTimeout(function()
			{
				google.maps.event.trigger(map, "resize");
				map.setCenter(myLatlng);
			}, 1400);
		});
	}
});