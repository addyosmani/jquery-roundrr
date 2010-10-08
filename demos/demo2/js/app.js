jQuery(document).ready(function()
{
	  
         var currentImage = "";
         var interfaceLock = false; 

	  	jQuery("#roundrr_container").roundrrwheel(
	  	{
			mode: 'standard', //mode can be pick or standard
			autoplay: false,
			autoplayDirection: 'anticlockwise',
			autoplayDuration: 4000,
			centerClass: 'roundrr_center',
			listClass: 'list', 
			itemClass: 'item', 
			radius: 220, 
			animSpeed:400, 
			centerX: 29, 
			centerY: 60, 
			animationEffect: 1, //(1:off, 5:light,10:heavy, 15:subtle)
			selectEvent: "click", 	
			centerImageSrc: "../../images/placeholder2.png",
			//on selecting/clicking an item on the wheel
			onSelect: function($selected)
			{  
			showLargeImage($selected, 'noanim');
			},
			//on beginning to spin/animate the wheel
			onNextBegin: function($m)
			{
			   
			   //interfaceLock = true;
			 
			},
			onPrevBegin: function($m)
			{
			   
			   //interfaceLock = true;
			 
			},
			//once an image has moved under the 'pick'
			onImageFocus: function($item)
			{

            showLargeImage($item, 'none');
		
			 
			},
			//once an image/image set is no longer under the 'pick'
			onImageBlur:  function($item)
			{
			   
			}, 
			//once the animation has completed
			onAnimationComplete: function($menu)
			{
			
			     jQuery('.centerImage').attr('src', currentImage);
			     jQuery('.centerImage').load(function()
			     {
			       
			        interfaceLock = false;
			     });
			
			 
			},
			angleOffset: Math.PI, 
			onShow: function($menuitems)
			{
				$menuitems.each(function(i)
				{
					var $this = jQuery(this);
					$this.delay(i*100).fadeIn(500);
				});
				
				
			}
			
		});
		
		
		
		
		
		jQuery("#roundrr_container").roundrrwheel("show");
		$('#next').bind('click', spinMenuRight);
		$('#prev').bind('click', spinMenuLeft);
		
		function showLargeImage($i, mode)
		{
		  
			interfaceLock = true;
		
			var thisImage   = $i.find('img');
            var imageCaption = thisImage.attr('alt');
            var speechBubble =  jQuery('.roundrr_speech');
            speechBubble.fadeIn();   
            getLatestTweet(imageCaption);
           
            jQuery('#roundrr_caption').fadeIn();
           
		}
		


String.prototype.parseURL = function() {
	return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(url) {
		return url.link(url);
	});
};

String.prototype.parseUsername = function() {
	return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
		var username = u.replace("@","")
		return u.link("http://twitter.com/"+username);
	});
};

String.prototype.parseHashtag = function() {
	return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
		var tag = t.replace("#","%23")
		return t.link("http://search.twitter.com/search?q="+tag);
	});
};		
		
function getLatestTweet(strUsername)
{
		
		
	  $.getJSON("http://twitter.com/statuses/user_timeline/" + strUsername + ".json?callback=?", function(data)
      {
     
       
       var returns =  (data[0].text).parseURL().parseUsername().parseHashtag();
       if(returns.length)
       {
       jQuery('#roundrr_caption').html(returns);
       }else{
         Query('#roundrr_caption').html('Error retrieving Tweet content. API Requests may have been used up.');
       }
       interfaceLock = false;
      

      });
      
}
		
		
		   /*Spin the menu to the left*/
			function spinMenuLeft()
			{
			   if(!(interfaceLock))
			  {
			   jQuery("#roundrr_container").roundrrwheel("prev");
			   }			   
			}
			
			/*Spin the menu to the right*/
			function spinMenuRight()
			{
		      if(!(interfaceLock))
			  {
			   jQuery("#roundrr_container").roundrrwheel("next");
			   } 
			}
			
			/*Keydown events*/
			$(window).keydown(function(event) 
			{
				var keycode = event.keyCode;
				switch(keycode)
				{
				  case 39:
           		  spinMenuLeft();
  				  break;
  				  case 37:
           		  spinMenuRight();
  				   break;
		     } });


	  });