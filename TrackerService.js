var TrackerService = TrackerService || {};


TrackerService.getTracker = () => {
    /**
     * Get the visitor information (from first party cookie)
     *
     * @return array
     */
    TrackerService.getVisitorInfo = () => {

      return [true, "ID8OJ", 0, new Date(), new Date() ]
    }

    TrackerService.trackEvent = (cat, action, name, value) => {
      clearTimeout(TID);

      TID = setTimeout(()=> {
        var data = e.detail;
        linkData.push(data);

      }, 100)

      setInterval(() => {
        if (!linkData.length) {
          return;
        }

        const data = {cat: cat, action: action, name: name, value: value};
        console.log(data)
          // todo have to be dynamic 
          // please write the right IP-adresse of you computer
        fetch('http://192.168.1.11:5000/api/link-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(response => response.json()).then(data => {
          console.log('Success:', data);
        }).catch((error) => {
          console.error('Error:', error);
        });
      }, 1000)
    }

    TrackerService.setCustomDimension = (index, value) => {
      console.log(index, value)
    }


  return TrackerService;
}
