/*!
 * jQuery Roundrr Plugin (2010)
 *
 * This version written by Addy Osmani extending Nirvana Tikku's RadMenu
 *
 * Roundrr is a plugin for plotting interactive image or multimedia content
 * around a circle. It is based on RadMenu with an extended model for events
 * occurring in the pre and post animation phases. It also contains further
 * configuration for automated playback of a wheel of content and support for
 * 'pick' interfaces which allow you to perform an action when an object 
 * falls between two other objects of fixed known position. 
 *
 * For further documentation please see addyosmani.com or Roundrr on github
 * at http://github.com/legacye/jquery-roundrr.
 *
 * This is an initial release and further forks/bug-patches are more than welcome
 * for any behaviour you feel may require some fixing or improvement.
 *
 * For further information about plotting items in a circle or oval outside of this
 * plugin, I recommend checking out my minimalist javascript library ShapeLib. 
 *
 */

;(function($){
	
	
	var roundrrwheel = ".roundrrwheel", 
		OPTS = "options"+roundrrwheel,
		PREVOPTS = "prevoptions"+roundrrwheel; 
		
	// private :: defaults
	var defaults = {
	    mode: 'standard',
	    autoplay: false,
	    autoplayDirection: 'clockwise',
	    autoplayDuration: 5000,
	    centerClass: "roundrr_center",
		listClass: "list",
		itemClass: "item",
		activeItemClass: "active",
		selectEvent: null, // click, mouseenter etc
		onSelect: function($selected){},
		onImageFocus: function($selected){}, //when the image is under the pick/viewer
		onImageBlur: function($selected){}, //when the image is not under the pick/viewer
		onNextBegin: function($selected){}, //called before the animation moves to next
        onPrevBegin: function($selected){}, //called before the animation moves to prev
		radius: 10, // in pixels
		animationEffect:1,
		initialScale: 1,
		angleOffset: 0, // in radians
		centerImageSrc: 'images/placeholder2.png',
		centerX: 0,
		centerY: 0, 
		requiredLeftA:'-55.1904px', // override for positioning: main image n-1's left position
		requiredTopA:'-143.253px',  // main image n-1's top 
		requiredLeftB:'113.19px',   //main image n+1's left
		requiredTopB:'-143.253px', //main image n+1's top
		animSpeed: 500,
		scaleAnimSpeed: 400,
		scaleAnimOpts: {},
		onAnimationComplete: function($m){},
		onShow: function($items){$items.show();},
		onHide: function($items){$items.hide();}
	};
	
	// set default valeus
	$.roundrrwheel = {
		container: {
			clz: "roundrr_div",
			itemClz: "roundrr_div_item",
			html: "<div></div>",
			css: { "position": "relative" }
		}
	};
	
	/**
	 * jQuery roundrrwheel Plugin
	 * 	@params 
	 * 		> input, dealt with by type
	 * 	if empty - assumes initialization
	 * 	if object - assumes initialization
	 * 	if string - assumes trigger method
	 * 	if number - select a particular menu item
	 */ 
	$.fn.roundrrwheel = function(input, param){
		try {
			var $this = $(this);
			var type = typeof input;
			if(arguments.length==0 || type=="object") 
				return init($this, input);
			else if(type=="string")
				return input=="items" ?
					$this.triggerHandler(input+roundrrwheel) :
					$this.trigger(input+roundrrwheel, param||null);
			else if(type=="number"){
				return $this.trigger("select"+roundrrwheel,input);
			}
		} catch (e){ return "error : "+e; }
	};
	
	/**
	 * private :: init fn
	 * @params
	 * 	$menu - the jQuery obj / array w/ menu target
	 *  opts - options object, to be merged with defaults
	 */
	function init($menu, opts){
		var o = $.extend({}, defaults, opts);
		
		//inner-wrap the center class
		
		jQuery('.' + o.centerClass).wrapInner("<img class='centerImage' src='" + o.centerImageSrc + "'></img>");
	
		return $menu.each(function(m){
			var $this = $(this);

			var $list = $this.find("."+o.listClass);
			$list.find("."+o.itemClass).hide(); // ensure its hidden
			// set the options within the data for the elem & bind evts
			$this.data(OPTS, updateRadius(o, o.initialScale, o.radius));
			for(e in MENU) $this.bind(e+roundrrwheel, $this, MENU[e]);
			
			
		});
	};

	/**
	 * selectMenuitem
	 * @param 
	 * 	evt - the event object
	 * triggers select event on roundrrwheel container
	 * 	using the index of the 'target object'
	 */
	function selectMenuitem(evt){ 
		var $this = $(this);
		var $element = $(evt.target);
		var container = $.roundrrwheel.container;
		if(!$element.hasClass(container.itemClz))
			$element = $element.closest("."+container.itemClz);
		var isInNested = $element.parents("."+container.itemClz).length>0;
		var index = $element.index();
		if(!isInNested)$this.parents("."+container.clz).roundrrwheel(index);
		else $this.roundrrwheel(index);
		cancelBubble(evt);
	};
	
	/**
	 * cancel event bubbling - x-browser friendly
	 * @param
	 * 	evt - the event object
	 */
	function cancelBubble(evt){
		if(!$.support.opacity) window.event.cancelBubble = true;
		else evt.stopPropagation();
	};
	
	/**
	 * All the MENU events to be bound to the radial menu
	 */
	var MENU = {
		show: function(evt, fn){ // fn = user input onshow
			var $m = getMenu(evt);
			var container = $.roundrrwheel.container;
			// clear any existing radial menus within the menu
			$m.menu.find("."+container.clz).remove();
			// grab the desired menu items to be used in building the roundrrwheel
			var $menuitems = $m.menu.find("."+$m.opts.itemClass);
			// create a div that will be the roundrrwheel & create the HTML for the items
			var $radialMenu = $(container.html)
				.addClass(container.clz).css(container.css)
				.html(buildMenuHTML($menuitems, $m.opts));
			// assign a selection event if the user has specified something
			var $menuitems = $radialMenu.find("."+container.itemClz);
			
			
			
			
			if($m.opts.selectEvent!=null)
				$menuitems.bind($m.opts.selectEvent,selectMenuitem);
			// append the roundrrwheel items inside the menu 
			$radialMenu.appendTo($m.menu);
			
			//
			var doAutoplay = $m.opts.autoplay;
			
			if(doAutoplay)
			{
			switch($m.opts.autoplayDirection)
			{
			 case 'clockwise':
			 
			setInterval(function()
			{
			switchItems($m, $m.raditems().length-1, 0, $m.opts.animationEffect, 'next');
			
			}, $m.opts.autoplayDuration);
			
			 break;
			 
			 case 'anticlockwise':
			 setInterval(function()
			{
			switchItems($m, 0, $m.raditems().length-1, 1, 'prev');
			
			}, $m.opts.autoplayDuration);
			 break;
			
			}
			
			
			}
			
			
			if(typeof(fn) == "function") fn($menuitems);
			else $m.opts.onShow($menuitems); // user can do what they want
			cancelBubble(evt);
			
			
			
			
		},
		hide: function(evt){ 
			var $m = getMenu(evt);
			// remove the roundrrwheel that was built and appended inside the menu
			var $menu = $m.menu.find("."+$.roundrrwheel.container.clz);
			$m.opts.onHide($menu.find("."+$.roundrrwheel.container.itemClz));
			$menu.remove();
			cancelBubble(evt);
		},
		select: function(evt, selectIndex){
			var $m = getMenu(evt);
			// with a specific index specified, grab the item
			var $selected = $($m.raditems().get(selectIndex));
			// remove the active class on the elements siblings
			$selected.siblings().removeClass($m.opts.activeItemClass);
			// add the active class on the selected item
			$selected.addClass($m.opts.activeItemClass);
			// pass the selected item to a customizable function
			$m.opts.onSelect($selected);
			cancelBubble(evt);
		},
		next: function(evt){ // clockwise
			var $m = getMenu(evt);
			$m.opts.onNextBegin($m);
			// switch the first and last items and then animate
			switchItems($m, $m.raditems().length-1, 0, $m.opts.animationEffect, 'next');
			
			
			
		},
		prev: function(evt){ // anticlockwise
			var $m = getMenu(evt);
			$m.opts.onPrevBegin($m);
			// switch the last and first items and then animate
			switchItems($m, 0, $m.raditems().length-1, 1, 'prev');
		},
		shuffle: function(evt,rndOffset){
			var $m = getMenu(evt);
			var len = $m.raditems().length;
			// swap some random item with another random item, and add some shuffling effects
			switchItems($m, rnd(len), rnd(len), rnd(rndOffset||15));
		},
		destroy: function(evt){
			var $m = getMenu(evt);
			$m.menu.data(OPTS, null).data(PREVOPTS, null).unbind(roundrrwheel);
			return $m.menu;
		},
		items: function(evt){return getMenu(evt).raditems();}
	};
	
	function updateRadius(opts, radius, factor){
		return $.extend({},opts,{radius:(factor*radius)});
	};
	
	// random int offset 
	function rnd(i){return parseInt(Math.random()*i);};
	
	/**
	 * getMenu 
	 * @params
	 * 	evt - the event object
	 * @return
	 * 	Object
	 * 		> menu - jQueryfied menu
	 * 		> opts - the options
	 * 		> raditems - the radial menu items
	 */
	function getMenu(evt){
		var $menu = evt.data;
		return {
			menu: $menu, 
			opts: $menu.data(OPTS),
			raditems: function(){
				// you will want to trigger raditems() if the contents get modified
				return $menu.find("."+$.roundrrwheel.container.itemClz);
			}
		};
	};
	
	/**
	 * switchItems
	 * @params
	 * 	$m - the menu package
	 * 	remove - the index of the menuitem to replace in the swap
	 * 	add - the index of the menuitem to use in the swap (a placeholder)
	 * direction - the direction in which the user wishes to animate 'prev' (right)
	 * or 'next' (left)
	 */
	function switchItems($m, remove, add, posOffset, direction){
		if(remove==add) add = remove - 1; // ensure that we don't lose any items
		var $remove = $($m.raditems()[remove]); // grab the replacement item
		var toAddto = $m.raditems()[add]; // grab the placeholder 
		// insertion is dependent on index of items
		if(remove>add) $remove.insertBefore(toAddto);
		else $remove.insertAfter(toAddto);
		animateWheel($m,posOffset, direction); // posOffset = 5:neat, 10:fireworksesque, 15:subtleish
	};
	
	/**
	 * buildMenuHTML - returns string instead of objects
	 * 		for performance 
	 * @params
	 * 	$menuitems - the jQueryified menu items
	 * 	opts - the radial menu's options
	 * @return
	 * 	String
	 * 		> each item is wrapped with an 
	 * 			absolute positioned div at an
	 * 			offset determined by it's location
	 * 			on a circle
	 */
	function buildMenuHTML($menuitems, opts){
		var ret = "";
		$menuitems.each(function(i){ // for each item we will want to build the HTML
			var $this = $(this);
			var coords = getCoords(i+1, $menuitems.length, opts); // each item has a position
			ret += "<div class='"+$.roundrrwheel.container.itemClz+"' "; // outer container for the div
			// after getting the coordinates, absolute position element at (x,y)
			ret += "style='position:absolute;left:"+coords.x+"px;top:"+coords.y+"px;display:none;'>";
			ret += $this.html(); // append the HTML _within_ the user's defined 'item'
			ret += "</div>";
		});
		return ret;
	};
	
	/**
	 * getCoords - returns coordinates for menuitems
	 * 	@params
	 * 		idx - the instance index (1st, 2nd, 3rd, etc..)
	 * 		num - the number of menuitems to spread
	 * 		opts - the options provided by the user customizations
	 * 	@return
	 * 		Object - (x, y) coords
	 */
	function getCoords(idx, num, opts){
		var radius = opts.radius; // user specified radius
		var angleOffset = opts.angleOffset; // provide flexibility of angle
		var angle = 2 * Math.PI * (parseFloat(idx/num)); // radians
		//	assuming: hypotenuse (hyp) = radius
		//
		//	opposite	|\	hypotenuse
		//			| \
		//		90deg	|__\	(*theta* - angle)
		//			adjacent
		//
		//	x-axis offset: cos(theta) = adjacent / hypotenuse
		//		==> adjacent = left = cos(theta) * radius
		//	y-axis offset: sin(theta) = opposite / hypotenuse
		//		==> opposite = top = sin(theta) * radius
		
		var l = opts.centerX + (Math.cos(angle + angleOffset) * radius), // "left"
			t = opts.centerY + (Math.sin(angle + angleOffset) * radius); // "top"
		
	
			
		return {x: l, y: t}; // return the x,y coords
	};
	
	/**
	 * animateWheel - performs animation
	 * @params
	 * 	$m - object holding menu & options
	 * 	posOffset - the position offset for the initial menuitem
	 * direction - the direction in which the user wishes to animate 'prev' (right)
	 * or 'next' (left)
	 */
	function animateWheel($m, posOffset, direction){
		// get the menu from the $m menu package
		var $menuitems = $m.menu.find("."+$.roundrrwheel.container.itemClz);
		// get a handle on the number of items
		var len = $menuitems.length;
		// for each item, we're going to animate left/top attributes
		
		
		/*Retrieve the desired positions of the n+1,n-1 elements if custom-values provided */
		
	    var reqLeftA = Math.floor($m.opts.requiredLeftA.replace('px',''));
		var reqTopA = Math.floor($m.opts.requiredTopA.replace('px',''));
		var reqLeftB = Math.floor($m.opts.requiredLeftB.replace('px',''));
		var reqTopB = Math.floor($m.opts.requiredTopB.replace('px',''));
		
					
		    $menuitems.each(function(i)
		    {
		    
			var $this = $(this);
			
			//left and top coordinates of this particular element
			var thisLeft = Math.floor($this.css('left').replace('px',''));
			var thisTop = Math.floor($this.css('top').replace('px',''));
			
			if($m.opts.mode == 'standard')
			{
			if(i==0)
			{
			  $m.opts.onImageFocus($this);
			  $this.find('img').addClass('selected');
			 
			}else{
			  $this.find('img').removeClass('selected');
			}
			}
			
			
			// establish the new coordinates with a customizable offset; len*(Math.PI+(Math.sqrt(5)))
			var coords = getCoords(i+posOffset, len, $m.opts);
			
			
			if($m.opts.mode == 'pick')
			{
	
			
			//attempt to override custom case positions by extracting them from the
			//array
			switch(i)
			{
			  case 2:
			  reqLeftA = Math.floor(coords.x);
			  reqTopA = Math.floor(coords.y);
			  break;
			  case 4:
			  reqLeftB = Math.floor(coords.x);
			  reqTopB = Math.floor(coords.y);
			  break;			  
			}
			
			
			//effectively check the the switch of image position for n+1, n-1
			//for the current element and handle accordingly.
			switch(direction)
			{
			  case 'next':
			  
			if( (thisLeft == reqLeftA &&  thisTop == reqTopA))
			{
			  $m.opts.onImageFocus($this);
			}
			else{
			  $m.opts.onImageBlur($this);
			}
			
			  break;
			  
			  case 'prev':
			  
			 if( (thisLeft == reqLeftB &&  thisTop == reqTopB))
			{
			  $m.opts.onImageFocus($this);
			}
			else{
			  $m.opts.onImageBlur($this);
			}
			  
			  break;
			 
			}
			
			}
	

			
			// playing with this is fun - this basically just
			// performs the animation with new coordinates 
			$this.animate({
				left: coords.x, top: coords.y
			}, $m.opts.animSpeed, i==(len-1)?function(){
				// allow the user to do something after completing an animation
				
				$m.opts.onAnimationComplete($m);
				
			}:undefined);
			
			
		});
	};
	
})(jQuery);