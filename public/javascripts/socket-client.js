$(document).ready(function() {  
  
    var Chapter = (function(container, newChapter, chapterInfo) {
        var chapDiv;
        var chapInfo = chapterInfo || { 'title': null, 'url': null };

        function createNewChapterMode(container) {
          var btnNew;

          $(container).empty();
          
          btnNew = document.createElement('input');
          $(btnNew).attr({'type': 'button', 'value': 'New chapter...'});
          $(chapDiv).append(btnNew);
          
          $(chapDiv).trigger('chapterModeChanged', ['new']);
          
          $(btnNew).click(function(event) {
            createEditChapterMode(chapDiv);
          });
        }
        
        function createEditChapterMode(container) {
          var label;
          var url;
          var btnSave;
          var btnCancel;
          
          $(container).empty();
          label = document.createElement('label');
          $(label).attr('for', 'txtUrl');
          $(label).text('URL:');
          url = document.createElement('input');
          $(url).attr({'id': 'txtUrl', 'type': 'url', 'placeholder': 'Input URL of article'});
          btnSave = document.createElement('input');
          $(btnSave).attr({'type': 'button', 'value': 'Save'});
          btnCancel = document.createElement('input');
          $(btnCancel).attr({'type': 'button', 'value': 'Cancel'});
          $(container).append(label);
          $(container).append(url);
          $(container).append(btnSave);
          $(container).append(btnCancel);
          $(url).focus();
          
          $(chapDiv).trigger('chapterModeChanged', ['edit']);

          $(url).keypress(function(event) {
            if (event.keyCode == '13') {
              $(btnSave).trigger('click');
              event.preventDefault();
            }
          });

          $(btnSave).click(function(event) {
              if ($(url).val().length > 0) {
                 var imgWait = document.createElement('img');
                 $(imgWait).attr('src', '/images/ajax-loader.gif');
                 $(container).append(imgWait);
                 $(btnSave).attr('disabled', 'disabled');
                 $(btnCancel).attr('disabled', 'disabled');

                 // Trigger Pre-Save validation
                  chapDiv.chapterInfo.url = $(url).val().toLowerCase();
                  var e = jQuery.Event('chapterPreSave');
                  $(chapDiv).trigger(e);
                  if (!e.isDefaultPrevented()) {
                     $.getJSON("http://viewtext.org/api/text?url=" + $(url).val() + "&callback=?",
                      function (data, err) {
                        // Data contains: 
                        // callback: callback ID
                        // content: the extracted text (HTML)
                        // responseUrl: the url containing the extracted text
                        // title: the title of the article
                        // url: the source url
                        if (data.content) {
                          createDisplayMode(container, data);
                        } else {
                          createEditChapterMode(container);
                        }
                      });  
                  } else {
                    window.alert('This URL has already been added to this book.');
                    createEditChapterMode(container);
                  }
              }
          });
          
          $(btnCancel).click(function(event) {
              createNewChapterMode(container);
          });
        }
        
        function createDisplayMode(container, data) {
          var hdr;
          var divPrev;
          var clickTitle;
          
          $(container).empty();
          
          // Create the title which toggles the content preview
          chapDiv.chapterInfo.title = data.title;
          chapDiv.chapterInfo.url = data.url.toLowerCase();
          
          clickTitle = document.createElement('a');
          $(clickTitle).attr('href', '#');
          hdr = document.createElement('h3');
          $(hdr).text(data.title);
          $(clickTitle).append(hdr);
          
          // Create the content preview
          divPrev = document.createElement('div');
          $(divPrev).addClass('content-preview');
          $(divPrev).toggleClass('hidden');
          $(divPrev).html(data.content);
          $(container).append(clickTitle);
          $(container).append(divPrev);

          $(chapDiv).trigger('chapterModeChanged', ['display']);
          
          $(clickTitle).click(function(event) {
              $(divPrev).toggleClass('hidden');
              event.preventDefault();
          });
        }
        
        chapDiv = document.createElement('div');
        $(chapDiv).addClass('chapter');
        $(container).append(chapDiv);
        if (newChapter) {
          createNewChapterMode(chapDiv);
        }
        chapDiv.chapterInfo = chapInfo;
        
        return chapDiv;
    });
    
    socketInit = (function() {
      // Create SocketIO instance, connect
      var socket = new io.Socket('localhost',{
        port: 9346
      });
      socket.connect(); 
      
      // Add a connect listener
      socket.on('connect',function() {
        $('#msgs').prepend('<p>Client has connected to the server!</p>');
      });
      // Add a connect listener
      socket.on('message',function(data) {
        $('#msgs').prepend('<p>' + data + '</p>');
      });
      // Add a disconnect listener
      socket.on('disconnect',function() {
        $('#msgs').prepend('<p>The client has disconnected!</p>');
      });
      
      // Sends a message to the server via sockets
      function sendMessageToServer(message) {
        socket.send(message);
      }
      
      $('#title').keypress(function(event) {
        if (event.keyCode == '13') {
          sendMessageToServer(this.value);
          event.preventDefault();
        }
      });
      
      $('window').unload(function(event) {
          socket.disconnect();
          $('.callviewtext').die('click');
      });
    });
    
    swipeInit = (function() {
        // TOUCH-EVENTS SINGLE-FINGER SWIPE-SENSING JAVASCRIPT
        // Courtesy of PADILICIOUS.COM and MACOSXAUTOMATION.COM
	
        // this script can be used with one or more page elements to perform actions based on them being swiped with a single finger

        var triggerElementID = null; // this variable is used to identity the triggering element
        var fingerCount = 0;
        var startX = 0;
        var startY = 0;
        var curX = 0;
        var curY = 0;
        var deltaX = 0;
        var deltaY = 0;
        var horzDiff = 0;
        var vertDiff = 0;
        var minLength = 72; // the shortest distance the user may swipe
        var swipeLength = 0;
        var swipeAngle = null;
        var swipeDirection = null;
	
        // The 4 Touch Event Handlers
        
        // NOTE: the touchStart handler should also receive the ID of the triggering element
        // make sure its ID is passed in the event call placed in the element declaration, like:
        // <div id="picture-frame" ontouchstart="touchStart(event,'picture-frame');"  ontouchend="touchEnd(event);" ontouchmove="touchMove(event);" ontouchcancel="touchCancel(event);">
      
        function touchStart(event,passedName) {
          // disable the standard ability to select the touched object
          event.preventDefault();
          // get the total number of fingers touching the screen
          fingerCount = event.touches.length;
          // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
          // check that only one finger was used
          if ( fingerCount == 1 ) {
            // get the coordinates of the touch
            startX = event.touches[0].pageX;
            startY = event.touches[0].pageY;
            // store the triggering element ID
            triggerElementID = passedName;
          } else {
            // more than one finger touched so cancel
            touchCancel(event);
          }
        }
      
        function touchMove(event) {
          event.preventDefault();
          if ( event.touches.length == 1 ) {
            curX = event.touches[0].pageX;
            curY = event.touches[0].pageY;
          } else {
            touchCancel(event);
          }
        }
        
        function touchEnd(event) {
          event.preventDefault();
          // check to see if more than one finger was used and that there is an ending coordinate
          if ( fingerCount == 1 && curX != 0 ) {
            // use the Distance Formula to determine the length of the swipe
            swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
            // if the user swiped more than the minimum length, perform the appropriate action
            if ( swipeLength >= minLength ) {
              caluculateAngle();
              determineSwipeDirection();
              processingRoutine();
              touchCancel(event); // reset the variables
            } else {
              touchCancel(event);
            }	
          } else {
            touchCancel(event);
          }
        }
      
        function touchCancel(event) {
          // reset the variables back to default values
          fingerCount = 0;
          startX = 0;
          startY = 0;
          curX = 0;
          curY = 0;
          deltaX = 0;
          deltaY = 0;
          horzDiff = 0;
          vertDiff = 0;
          swipeLength = 0;
          swipeAngle = null;
          swipeDirection = null;
          triggerElementID = null;
        }
        
        function caluculateAngle() {
          var X = startX-curX;
          var Y = curY-startY;
          var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
          var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
          swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
          if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); }
        }
        
        function determineSwipeDirection() {
          if ( (swipeAngle <= 45) && (swipeAngle >= 0) ) {
            swipeDirection = 'left';
          } else if ( (swipeAngle <= 360) && (swipeAngle >= 315) ) {
            swipeDirection = 'left';
          } else if ( (swipeAngle >= 135) && (swipeAngle <= 225) ) {
            swipeDirection = 'right';
          } else if ( (swipeAngle > 45) && (swipeAngle < 135) ) {
            swipeDirection = 'down';
          } else {
            swipeDirection = 'up';
          }
        }
        
        function processingRoutine() {
          var swipedElement = document.getElementById(triggerElementID);
          if ( swipeDirection == 'left' ) {
            // REPLACE WITH YOUR ROUTINES
            swipedElement.style.backgroundColor = 'orange';
          } else if ( swipeDirection == 'right' ) {
            // REPLACE WITH YOUR ROUTINES
            swipedElement.style.backgroundColor = 'green';
          } else if ( swipeDirection == 'up' ) {
            // REPLACE WITH YOUR ROUTINES
            swipedElement.style.backgroundColor = 'maroon';
          } else if ( swipeDirection == 'down' ) {
            // REPLACE WITH YOUR ROUTINES
            swipedElement.style.backgroundColor = 'purple';
          }
        }
    });
	  
    socketInit();
    var lastChap = new Chapter($('#chapters'), true);
    $('.chapter').live('chapterModeChanged', function(event, newMode) {
        if (event.target === lastChap && newMode === 'display') {
          lastChap = new Chapter($('#chapters'), true);
        }
    });
    $('.chapter').live('chapterPreSave', function(event) {
        $('.chapter').each(function() {
            if (this !== event.target) {
              if (this.chapterInfo.url === event.target.chapterInfo.url) {
                event.preventDefault();
                return;
              }
            }
        });
    });
});

