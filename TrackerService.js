var TrackerService = TrackerService || {};

TrackerService.configCookiesDisabled = false
TrackerService.configCookieNamePrefix = '_pk_',
TrackerService.configTrackerSiteId = '',
TrackerService.domainHash = '',


TrackerService.getTracker = () => {
  return this;
}

/**
  * Get the visitor information (from first party cookie)
  *
  * @return array
*/
TrackerService.getVisitorInfo = () => {

  return [True, "ID8OJ", 0, new Date(), new Date() ]
}

TrackerService.trackEvent = (cat, action, name, value) => {

}

TrackerService.setCustomDimension = (index, value) => {

}

TrackerService.getCookie = (cookieName) => {
  if (TrackerService.configCookiesDisabled) {
    return 0;
  }

  TrackerService.getCookieName = (baseName) => {
    return TrackerService.configCookieNamePrefix + baseName + '.' + TrackerService.configTrackerSiteId + '.' + TrackerService.domainHash;
  }



  var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'),
  cookieMatch = cookiePattern.exec(documentAlias.cookie);

  return cookieMatch ? decodeWrapper(cookieMatch[2]) : 0;
}

TrackerService.setVisitorIdCookie = (visitorIdCookieValues) =>{
  if(!TrackerService.configTrackerSiteId) {
    // when called before Site ID was set
    return;
  }

  var now = new Date(),
  nowTs = Math.round(now.getTime() / 1000);

  if(!isDefined(visitorIdCookieValues)) {
      visitorIdCookieValues = getValuesFromVisitorIdCookie();
  }

  var cookieValue = visitorIdCookieValues.uuid + '.' +
  visitorIdCookieValues.createTs + '.';

   setCookie(getCookieName('id'), 
      cookieValue, getRemainingVisitorCookieTimeout(), 
      configCookiePath, configCookieDomain, configCookieIsSecure, configCookieSameSite);
}

var ajax;

var linkData = [];
var TID = null;
/*
Log that we received the message.
which we read from the message.
*/
function notify(e) {
  clearTimeout(TID);

  TID = setTimeout(()=> {
    var data = e.detail;
    linkData.push(data);

  }, 100)

  setInterval(() => {
    if (!linkData.length) {
      return;
    }

    const data = { links: linkData };

    fetch('http://192.168.1.11:5000/api/link-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(response => response.json()).then(data => {
      linkData = []
        console.log('Success:', data);
      }).catch((error) => {
        console.error('Error:', error);
      });
  }, 1000)
}

/*
Assign `notify()` as a listener to messages from the content script.
*/
window.addEventListener('link', notify);
