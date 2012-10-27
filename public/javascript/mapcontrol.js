    /*An example of using the MQA.EventUtil to hook into the window load event and execute defined function 
    passed in as the last parameter. You could alternatively create a plain function here and have it 
    executed whenever you like (e.g. <body onload="yourfunction">).*/ 

    MQA.EventUtil.observe(window, 'load', function() {
	
      /*Create an object for options*/ 
      var options={
        elt:document.getElementById('map'),       /*ID of element on the page where you want the map added*/ 
        zoom:10,                                  /*initial zoom level of the map*/ 
        latLng:{lat:39.743943, lng:-105.020089},  /*center of map in latitude/longitude */ 
        mtype:'map',                              /*map type (map)*/ 
        bestFitMargin:0,                          /*margin offset from the map viewport when applying a bestfit on shapes*/ 
        zoomOnDoubleClick:true                    /*zoom in when double-clicking on map*/ 
      };

      /*Construct an instance of MQA.TileMap with the options object*/ 
      window.map = new MQA.TileMap(options);
    });
