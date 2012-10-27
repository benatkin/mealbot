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

      MQA.withModule('largezoom','traffictoggle','viewoptions','geolocationcontrol','insetmapcontrol','mousewheel', function() {
  
        map.addControl(
          new MQA.LargeZoom(),
          new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5))
        );

        map.addControl(new MQA.TrafficToggle());

        map.addControl(new MQA.ViewOptions());

        map.addControl(
          new MQA.GeolocationControl(),
          new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(10,50))
        );

        /*Inset Map Control options*/ 
        var options={
          size:{width:150, height:125},
          zoom:3,
          mapType:'map',
          minimized:true };

        map.addControl(
          new MQA.InsetMapControl(options),
          new MQA.MapCornerPlacement(MQA.MapCorner.BOTTOM_RIGHT)
        );

        map.enableMouseWheelZoom();
      });
      
    });


