jQuery(document).ready(function()
{
	  
         var currentImage = "";
         var interfaceLock = false; 
         var imageCaption = "";
		 var imageSrc = "";
		 var largerImage = "";
		 var speechBubble = "";
      

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
			   
			   interfaceLock = true;
			 
			},
			onPrevBegin: function($m)
			{
			   
			   interfaceLock = true;
			 
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
			
			imageSrc = thisImage.attr('src');
            largerImage = imageSrc.replace('_bigger', '');	
            imageCaption = thisImage.attr('alt');
            speechBubble =  jQuery('.roundrr_speech');
            
            
            var captionObject = jQuery('#roundrr_caption');
            var centeredImage = jQuery('.centerImage');
            var centerObject  = jQuery('.roundrr_center');
            
            speechBubble.fadeIn();   
            currentImage = largerImage;
            
            captionObject.fadeIn();
			captionObject.html(imageCaption);
			
			
			/*center area: utilize the slimbox API for lightbox triggering*/
			centerObject.bind('click', function()
			{
			
			  showLightbox();
			  
			});
			
			
			/*hover case for central image*/
			centeredImage.hover( function()
			{
			 $(this).css('opacity','0.5');
			
			}, function()
			{
			$(this).css('opacity','1');
			});
			
            
            if(mode=='noanim')
            {
                 centeredImage.attr('src', currentImage);
			     centeredImage.load(function()
			     {
			        interfaceLock = false;
			        
			     });
            }
            
   
		}
		
		
		  /*Show lightbox for current image*/
		  function showLightbox()
		  {
		  jQuery.slimbox(largerImage, imageCaption, { overlayOpacity:0});
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
  				   case 32:
  				   if(largerImage.length)
  				   {
  				   showLightbox();
  				   }
  				   break;
  				  
		     } });


	  });