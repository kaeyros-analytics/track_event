var TrackerService = TrackerService || {};


TrackerService.getTracker = () => {

  configCookiesDisabled = false
  configCookieNamePrefix = '_pk_',
    configTrackerSiteId = '',
    domainHash = '',

    /**
     * Get the visitor information (from first party cookie)
     *
     * @return array
     */
    TrackerService.getVisitorInfo = () => {

      return [true, "ID8OJ", 0, new Date(), new Date() ]
    }

  TrackerService.trackEvent = (cat, action, name, value) => {
    console.log(cat, action, name, value)
  }

  TrackerService.setCustomDimension = (index, value) => {
    console.log(index, value)
  }

  getCookie = (cookieName) => {
    if (configCookiesDisabled) {
      return 0;
    }

    getCookieName = (baseName) => {
      return configCookieNamePrefix + baseName + '.' + configTrackerSiteId + '.' + domainHash;
    }



    var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'),
      cookieMatch = cookiePattern.exec(documentAlias.cookie);

    return cookieMatch ? decodeWrapper(cookieMatch[2]) : 0;
  }

  setVisitorIdCookie = (visitorIdCookieValues) =>{
    if(!configTrackerSiteId) {
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


  return TrackerService;
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
// window.addEventListener('link', notify);
