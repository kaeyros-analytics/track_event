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
