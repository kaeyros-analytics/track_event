'use strict';

var ajax;


window.api = {
    getIp: () => {

        /**
         * Find ip adress of user
         *
         * @param
         * @public
        */


        ajax = new XMLHttpRequest();
        if(ajax!=null){
            // todo have to be dynamic 
          // please write the right IP-adresse of you computer
            ajax.open("GET","http://192.168.1.11:5000/api/ip",true);
            ajax.onreadystatechange = function() {
                if(this.readyState == 4) {
                    if(this.status == 200) {
                      console.log(this.responseText)
                      return this.responseText;
                    }
                }
            }
            ajax.send(null);
        }
    },


    trackClick: () => {

        /**
         * Track all button click in page
         *
         * @param
         * @param
         * @returns
        */

        Array.from(document.getElementsByTagName('a')).forEach((button) => {
            button.addEventListener('click', (e)=>{
                e.preventDefault();
                console.log(e);
            });
        })
    }

}

//window.api.getIp()
//window.api.trackClick()
