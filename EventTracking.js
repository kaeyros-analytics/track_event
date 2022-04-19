/**
 * Polyfill startsWith
 * Source: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
 */

 if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = (str) => {
    return this.indexOf(str) === 0;
  }
}

var EventTracking = EventTracking || {};

EventTracking.Hostname = window.location.host || window.location.hostname;
EventTracking.IsServer = false;

EventTracking.Init = () => {
  if (TrackerService !== null && typeof(TrackerService) === 'object') {
    EventTracking.IsServer = true;
    EventTracking.Tracker = TrackerService.getTracker();
    EventTracking._Init();
  } else {
    console.log("No TrackerService detected!");
  }
}

EventTracking._Init = () => {
  EventTracking.InitVisitor();
  EventTracking.RegisterLateEventData();
  EventTracking.RegisterDelayEventData();
  var Scroll = {"25": false, "75": false, "75": false};
  EventTracking.Scroll = Scroll
  EventTracking.InitScrollEvents();
  EventTracking.InitTextSelection();
  EventTracking.InitLinkClick();
}


EventTracking.RegisterNewVisitorCallback = (callback, delay) => {
  delay = typeof delay !== "undefined" ? delay : 25;
  if(!EventTracking.IsNewVisitor){
    setTimeout(callback, delay)
  }
}

EventTracking.RegisterReturingVisitorCallback = (callback, delay) => {
  delay = typeof delay !== "undefined" ? delay : 25;
  if(!EventTracking.IsNewVisitor){
    setTimeout(callback, delay);
  }
}


EventTracking.RegisterLateEventData = () =>{
  var hash = window.location.hash;

  if (hash.startsWith("#_ea_pwkdt_=")) {
    window.location.hash = "";

    var lateDt = hash.replace("#_ea_pwkdt_=", "").split(";");
    EventTracking.RegisterUIEvent(lateDt[0], lateDt[1], lateDt[2], lateDt[3]);
  }
}

EventTracking.RegisterDelayEventData = ()=> {
  var cookie = EventTracking.CookieStorage.read("_ea_pwkdt_");
  if (cookie !== null && cookie !== "") {
    var lateDt = cookie.split("|");
    EventTracking.RegisterUIEvent(lateDt[0], lateDt[1], lateDt[2], lateDt[3])
    EventTracking.CookieStorage.erase("_ea_pwkdt_");
  }
}

EventTracking.InitScrollEvents = ()=> {
  var scrollTop =  $(document).height() - $(window).height();
  $( window ).scroll(() => {
    if ($(window).scrollTop() > 25) {
      if ($(window).scrollTop() > 3*(scrollTop/4) && EventTracking.Scroll['75'] === false) {
         // Scrolled 75%
         EventTracking.Scroll['75'] = true;
         EventTracking.RegisterUIEvent("Window", "scroll", "scroll75");
      }else if( $(window).scrollTop() > 2*(scrollTop/4) && EventTracking.Scroll['50'] === false ){
        // Scrolled 50%
        EventTracking.Scroll['50'] = true;
        EventTracking.RegisterUIEvent("Window", "scroll", "scroll50");
    } else if( $(window).scrollTop() > (scrollTop/4) && EventTracking.Scroll['25'] === false ){
        // Scrolled 25%
        EventTracking.Scroll['25'] = true;
        EventTracking.RegisterUIEvent("Window", "scroll", "scroll25");
    }
    }
  })
}


EventTracking.InitVisitor = () => {
  if (EventTracking.IsServer) {
    EventTracking.InitVisitorServer();
  }
}

EventTracking.InitVisitorServer = () => {
    var VisitorInfo = EventTracking.Tracker.getVisitorInfo();

    EventTracking.IsNewVisitor = VisitorInfo[0];
    EventTracking.VisitorID = VisitorInfo[1];
    EventTracking.NumberOfVisits = VisitorInfo[2];
    EventTracking.CurrentVisitTimestamp = VisitorInfo[3];
    EventTracking.LastVisitTimestamp = VisitorInfo[4];
    // Use the NumberOfVisits to discover if the visitor
    // is new or NOT
    if( EventTracking.NumberOfVisits === 1 ){
      EventTracking.IsNewVisitor = 1;
    } else {
      EventTracking.IsNewVisitor = 0;
    }
}


EventTracking.InitTextSelection = function(){
  EventTracking.Utils.StartListenSelectTextEvent( EventTracking._TextSelectCallBack );
}

EventTracking.InitLinkClick = () => {
  EventTracking.Utils.StartListenClickLinkEvent(EventTracking._LinkClickCallBack);
}

EventTracking._TextSelectCallBack = function( text ){
  EventTracking.RegisterUIEvent("document", "selection", "text", text);
}

EventTracking._LinkClickCallBack = (text, href) => {
  EventTracking.RegisterUIEvent("Link", "navigate", text, href)
}

EventTracking.RegisterUIEvent = function( category, action, name, value ){
  /* */
  var cat = "UI_"+category;
  if( EventTracking.IsServer ){
    EventTracking.Tracker.trackEvent(cat, action, name, value);
  }
}

EventTracking.RegisterCustomDimension = function( index, value ){
  if(EventTracking.IsServer){
    EventTracking.Tracker.setCustomDimension(index, value);
  }
}

EventTracking.ParseNameVariables = function( event, varname ){
  var element = $(event.target);
  var content = "unkwown";
  if( varname === "%content" ){
      content = element.text().trim();
  } else if( varname === "%title" ){
      content = element.attr("title").trim();
  } else if( varname === "%parentcontent" ){
      content = element.parent().text().trim();
  } else if( varname === "%parenttitle" ){
      content = element.parent().attr("title").trim();
  } else {
      content = varname;
  }
  return content;
}

EventTracking.RegisterDOMEvent = function( selector, bindevent, category, action, name, value){
  $(selector).on(bindevent, function(e){
      var content = EventTracking.ParseNameVariables(e, name);
      EventTracking.RegisterUIEvent(category, action, content, value);
  });
}

EventTracking.LateRegisterDOMEvent = function( selector, bindevent, category, action, name, value){
  $(selector).on(bindevent, function(e){
      var element = $(e.target);
      var content = EventTracking.ParseNameVariables(e, name);
      if( element.prop("tagName") === "A" ){
          var href = element.attr("href");
          /*
             Avoid to add a "storage hash" to links
             that has an hash yet in their HREF
             FEA1 request 25-10-2015
          */
          if( href.indexOf("#") === -1 ){
              element.attr("href", href+"#_ea_pwkdt_="+category+"_late;"+action+";"+content+";"+value);
          } else {
              // Here you could graceful
              // call DelayRegisterDOMEvent() with
              // all the same parameters as a backend
          }
      }
  });
}

EventTracking.DelayRegisterDOMEvent = function( selector, bindevent, category, action, name, value){
  $(selector).on(bindevent, function(e){
      var element = $(e.target);
      var content = EventTracking.ParseNameVariables(e, name);
      EventTracking.CookieStorage.create("_ea_pwkdt_", category+"_delay|"+action+"|"+content+"|"+value);
      if( element.prop("tagName") === "A" ){
          element.unbind("click");
          // setTimeout(function(){ window.location = $(element).attr("href"); }, 125);
          return false;
      } else if( element.prop("tagName") === "FORM" ) {
          element.unbind("submit");
          setTimeout(function(){ element.submit(); }, 125);
          return false;
      }
  });
}

EventTracking.TrackFormInteraction = function(){
  var form = $('form.EventTracking');
  if( form.size() === 1 ){
      // Track the interaction with
      // every single INPUT different
      // from type="hidden"
      form.find("input").each(function(index){
        EventTracking.RegisterInputFieldEvent(this);
      });
  } else {
      // Print a different message if there are
      // less or more than 1 form.EventTracking
      //console.log("You are allowed to track a single FULL form per page. If you need to track some other forms you should use the EventTracking.RegisterDOMEvent() using a selector for a FORM and a SUBMIT event binding");
  }
}

EventTracking.RegisterInputFieldEvent = function( input ){
  var InputType = $(input).attr("type");
  var InputName = $(input).attr("name");
  var InputId = $(input).attr("id");
  if( !InputId ){
      InputId = InputName;
  }
  if(InputType !== "hidden"){
      var InputPlaceholder;
      if( $(input).attr("placeholder") ){
          InputPlaceholder = $(input).attr("placeholder");
      } else {
          // Search for a label for="inputName"
          InputPlaceholder = $('label[for="'+InputId+'"]').text();
          //console.log(InputId);
          //console.log(InputPlaceholder);
      }
      $(input).attr("data-input-name", InputPlaceholder);
      $(input).on("focus", EventTracking.InputInteractionDetectorCallback);
      $(input).on("keyup", EventTracking.InputInteractionDetectorCallback);
  }
}

EventTracking.InputInteractionDetectorCallback = function( event ){
  var target = $(event.target);
  console.log(event.type);
  if( event.type === "keyup" ){
      if(target.val() !== ""){
          $(this).unbind(event.type);
          var content = $(this).attr("data-input-name");
          EventTracking.RegisterUIEvent("FormInput", event.type, content);
      }
  } else if( event.type !== "keyup" ) {
      $(this).unbind(event.type);
      var content = $(this).attr("data-input-name");
      EventTracking.RegisterUIEvent("FormInput", event.type, content);
  }
}


EventTracking.CookieStorage = EventTracking.CookieStorage || {};

EventTracking.CookieStorage.DefaultExpire = 2;

EventTracking.CookieStorage.create = function(name, value, minutes){
  if( minutes ){
      var date = new Date();
      date.setTime(date.getTime()+(minutes*60*1000));
      var expires = "; expires="+date.toGMTString();
  } else {
      var date = new Date();
      var expMinutes = EventTracking.CookieStorage.DefaultExpire*60*1000;
      date.setTime(date.getTime()+(expMinutes));
      var expires = "; expires="+date.toGMTString();
  }
  document.cookie = name+"="+value+expires+"; path=/";
}

EventTracking.CookieStorage.read = function(nameEQ){
  var nameEQ = nameEQ + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i].trim();
      if( c.startsWith(nameEQ) ){
          return c.split("=")[1];
      }
  }
  return null;
}

EventTracking.CookieStorage.erase = function(name){
  EventTracking.CookieStorage.create(name,"",-1);
}



EventTracking.Utils = EventTracking.Utils || {};

EventTracking.Utils.getSelectedText = function(){
    var ret = '';
    if (window.getSelection) {
        ret = window.getSelection().toString();
    } else if (document.selection) {
        ret = document.selection.createRange().text;
    }
    return ret;
}

EventTracking.Utils.getLinkContent = (element)=> {
  return EventTracking.ParseNameVariables(element, "%content")
}

EventTracking.Utils.LastSelectedText = false;
EventTracking.Utils.SelectTextEventFired = false;
EventTracking.SelectLinkEventFired = false;
EventTracking.LastLinkText = false;


EventTracking.Utils.StartListenSelectTextEvent = function( callback ){
  $("*").not("a").on("mouseup touchend onselectstart onselectend onselectionchange", function(e) {
      e.preventDefault();
      if( !EventTracking.Utils.SelectTextEventFired ){
          var text=EventTracking.Utils.getSelectedText();
          if (text !== '' && text !== EventTracking.Utils.LastSelectedText){
            EventTracking.Utils.LastSelectedText = text;
              callback( text );
          }
          EventTracking.Utils.SelectTextEventFired = true;
          setTimeout(function(){ EventTracking.Utils.SelectTextEventFired = false; }, 50);
      }
  });
}

EventTracking.Utils.StartListenClickLinkEvent = (callback) => {
  window.addEventListener("click", (e) => {
    e.preventDefault();
    if (!EventTracking.Utils.SelectLinkEventFired) {
      var href = $(e.target).attr("href") || $(e.target.parentNode).attr("href");
      if (href) {
        var content = EventTracking.Utils.getLinkContent(e);
        if (content !=='' && content !== EventTracking.Utils.LastLinkText ) {
          EventTracking.Utils.LastLinkText = content;
          callback( content, href );
        }
      } else  {

      }
      EventTracking.Utils.SelectLinkEventFired = true;
      setTimeout(function(){ EventTracking.Utils.SelectLinkEventFired = false; }, 50);
    }
  })
}

EventTracking.Utils.getMetadata = function(){
  var title = document.title;
  var description = $("meta[name='description']").attr("content");
  var keywords = $("meta[name='keywords']").attr("content");
  alert(title);
  alert(description);
  alert(keywords);
}
