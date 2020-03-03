//File scanned for 3PPs
// *****************************************************************************************
// Map polyline tool for creating bing custom map of campus. -- bcaulfield@keene.edu
// Copyright 2012, Keene State College 
// Released under MIT license: http://opensource.org/licenses/MIT 
// *****************************************************************************************

var maptool = {

    RuleManager: function (map) {
        // maptool.instance = map;
        // kindly change these credentials to your maps API key if repurposing script
        maptool.credentials = "Au4e43SXJE6JDqpqH94_GJs7JkEdtB_XpkFv3JAsVM8GVmr_CINL2Al84fe6KXhQ";//"AmY05j27qDvcW8z3__5bSPkX4vNLisClvmfdCsoz_w1F4VOxygCIm__0qpwZ82aG";
        maptool.instance = map;
        maptool.initial = {};
        maptool.initial.zoom = 18;
        maptool.initial.latitude = 42.926106;
        maptool.initial.longitude = -72.280276;
        maptool.controls = $('#controls');
        maptool.myMapContextMenu = $('#myMapContextMenu');
        maptool.distanceMeasure = { segmentLength1: 0, segmentLength1: 2, totalLength: 0 };
        maptool.isUpdatePin = false;
        maptool.mousedown = false;
        maptool.polygon = {};
        maptool.polygon.instance = undefined;
        maptool.polygon.points = [];
        maptool.polygon.properties = {
            fillColor: 'rgba(0, 0, 0, 0)',//new Microsoft.Maps.Color(0, 0, 0, 0),
            strokeColor: 'rgba(255, 206, 17, 38)',//new Microsoft.Maps.Color(255, 206, 17, 38),
            strokeThickness: 2
        };
        maptool.DistanceUnit = {};

        // var rulerLayer = new Microsoft.Maps.EntityCollection();
        var rulerLayer = new Microsoft.Maps.Layer();

        maptool.DistanceUnit = {
            meters: 'meters',
            km: 'km',
            miles: 'miles',
            feet: 'feett',
            yards: 'yards'
        };

        maptool.polygon.string_coordinates = function () {
            maptool.distanceMeasure.segmentLength1 = 0;
            maptool.distanceMeasure.segmentLength2 = 0;
            maptool.distanceMeasure.totalLength = 0;
            if (maptool.polygon.points.length > 1) {
                for (var i = 0; i < maptool.polygon.points.length - 1; i++) {

                    var point1 = maptool.polygon.points[i];
                    var point2 = maptool.polygon.points[i + 1];
                    maptool.distanceMeasure.segmentLength1 = maptool.MapMath.haversineDistance(point1, point2, maptool.DistanceUnit.km);
                    maptool.distanceMeasure.totalLength = maptool.distanceMeasure.totalLength + maptool.distanceMeasure.segmentLength1;

                    // var loc = maptool.calculateVisualMidpoint(point1, point2);

                    var loc = maptool.midpoint(point1, point2, maptool.distanceMeasure.segmentLength1);

                    //var pinDistanceLabel = new Microsoft.Maps.Pushpin(loc, {
                    //    htmlContent: '<span style="color:black; font-weight:bold;">' + parseFloat(maptool.distanceMeasure.segmentLength1).toFixed(2) + ' km</span>',
                    //    width: 90,
                    //    height: 20
                    //});
                    var pinDistanceLabel = new Microsoft.Maps.Pushpin(loc, {
                        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><circle cx="2" cy="2" r="2" stroke="red" stroke-width="4" fill="red" /></svg>',
                         title: parseFloat(maptool.distanceMeasure.segmentLength1).toFixed(2) + ' km'
                    });
                     rulerLayer.add(pinDistanceLabel);// push distance label on map
                   
                }
            }

            return '<span style="color:black; font-size: 11px;">Total Distance: ' + parseFloat(maptool.distanceMeasure.totalLength).toFixed(2) + ' km</span>';
        };

        // *****************************************************************************************

        maptool.calculateVisualMidpoint = function (loc1, loc2) {
            /// <summary>Calculates the visual midpoint between two locations.</summary>
            /// <param name='loc1' type='Microsoft.Maps.Location'/>
            /// <param name='loc2' type='Microsoft.Maps.Location'/>
            /// <returns type='Microsoft.Maps.Location'/>

            var pixels = maptool.instance.tryLocationToPixel([loc1, loc2]);
            var x2 = (pixels[0].x + pixels[1].x) / 2;
            var y2 = (pixels[0].y + pixels[1].y) / 2;

            return maptool.instance.tryPixelToLocation(new Microsoft.Maps.Point(x2, y2));
        };

        maptool.midpoint = function (latlong1, latlong2, arcLength) {
            // var arcLength = haversineDistance(latlong1, latlong2);
            var brng = maptool.calculateBearing(latlong1, latlong2);
            return maptool.calculateCoord(latlong1, brng, arcLength / 2);
        };

        maptool.calculateBearing = function (latlong1, latlong2) {
            var lat1 = maptool.DegtoRad(latlong1.latitude);
            var lon1 = latlong1.longitude;
            var lat2 = maptool.DegtoRad(latlong2.latitude);
            var lon2 = latlong2.longitude;
            var dLon = maptool.DegtoRad(lon2 - lon1);
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            var brng = (maptool.RadtoDeg(Math.atan2(y, x)) + 360) % 360;
            return brng;
        };
        maptool.DegtoRad = function (x) {
            return x * Math.PI / 180;
        };

        maptool.RadtoDeg = function (x) {
            return x * 180 / Math.PI;
        };

        var earthRadius = 6367; //radius in km
        maptool.calculateCoord = function (origin, brng, arcLength) {
            var lat1 = maptool.DegtoRad(origin.latitude);
            var lon1 = maptool.DegtoRad(origin.longitude);
            var centralAngle = arcLength / earthRadius;
            var lat2 = Math.asin(Math.sin(lat1) * Math.cos(centralAngle) + Math.cos(lat1) * Math.sin(centralAngle) * Math.cos(maptool.DegtoRad(brng)));
            var lon2 = lon1 + Math.atan2(Math.sin(maptool.DegtoRad(brng)) * Math.sin(centralAngle) * Math.cos(lat1), Math.cos(centralAngle) - Math.sin(lat1) * Math.sin(lat2));
            return new Microsoft.Maps.Location(maptool.RadtoDeg(lat2), maptool.RadtoDeg(lon2));
        };

        maptool.polygon.close = function () {
            var polygon_length = maptool.polygon.points.length;
            if (maptool.polygon.is_closed() == false && polygon_length > 2) {
                maptool.polygon.points.push(maptool.polygon.points[0]);
                maptool.polygon.edit();
            }



        };

        // *****************************************************************************************

        maptool.polygon.undo_last = function () {
            if (maptool.polygon.points.length > 0) {
                maptool.polygon.points.pop();
            }
            maptool.polygon.edit();
        };

        // *****************************************************************************************

        maptool.polygon.is_closed = function () {
            var polygon_length = maptool.polygon.points.length;
            if (polygon_length > 2 && maptool.polygon.points[0] == maptool.polygon.points[polygon_length - 1]) {
                return true;
            } else {
                return false;
            }
        };

        // *****************************************************************************************
        maptool.polygon.close1 = function () {
            maptool.polygon.clear();
            maptool.controls.hide();
        };
        maptool.polygon.render = function () {
            // draw entities and update controls
            var polygon_length = maptool.polygon.points.length;

            rulerLayer.clear();
            if (polygon_length > 0) {
                maptool.polygon.instance = new Microsoft.Maps.Polyline(maptool.polygon.points, maptool.polygon.properties);
                rulerLayer.add(maptool.polygon.instance); // push lines on map
            }


            
            maptool.controls.html($([
                '<div class="options">',
                    //'<a class="rounder_4" href="javascript:maptool.polygon.import();"><span class="shortcut_key">I</span>mport</a>',
                    '<a href="javascript:maptool.polygon.close1();" class="arrow"></a>',
                    polygon_length > 0 ? '<a class="rounder_4" href="javascript:maptool.polygon.clear();">Reset</a>' : '',
                    polygon_length > 0 ? '<a class="rounder_4" href="javascript:maptool.polygon.undo_last();">Undo Last Point</a>' : '',
                    //maptool.polygon.is_closed() == false && polygon_length > 2 ? '<a class="rounder_4" href="javascript:maptool.polygon.close();">Close <span class="shortcut_key">S</span>hape</a>' : '',
                '</div>',
                '<div class="clear"></div>',

                '<h3>Measure Distance</h3>',
                '<div class="information">', maptool.polygon.string_coordinates(), '</div>'
            ].join('')));
        };

        // *****************************************************************************************

        maptool.polygon.clear = function () {
            // remove entities
            maptool.polygon.points = [];

            var pointslenght = rulerLayer.getPrimitives().length;

            for (var i = 0; i < pointslenght ; i++) {
                var s = rulerLayer.getPrimitives()[i];
                rulerLayer.remove(s);
            }
            rulerLayer.clear();

            maptool.polygon.instance = undefined;
            maptool.polygon.renderClear();
        };
        maptool.polygon.renderClear = function () {
            // draw entities and update controls
            rulerLayer.clear();
            // maptool.polygon.instance = new Microsoft.Maps.Polyline(maptool.polygon.points, maptool.polygon.properties);
            // rulerLayer.add(maptool.polygon.instance); // push lines on map


            var polygon_length = maptool.polygon.points.length;
            maptool.controls.html($([
                '<div class="options">',
                    //'<a class="rounder_4" href="javascript:maptool.polygon.import();"><span class="shortcut_key">I</span>mport</a>',
                    '<a href="javascript:maptool.polygon.close1();" class="arrow"></a>',
                    polygon_length > 0 ? '<a class="rounder_4" href="javascript:maptool.polygon.clear();">Reset</a>' : '',
                    polygon_length > 0 ? '<a class="rounder_4" href="javascript:maptool.polygon.undo_last();">Undo Last Point</a>' : '',
                    //maptool.polygon.is_closed() == false && polygon_length > 2 ? '<a class="rounder_4" href="javascript:maptool.polygon.close();">Close <span class="shortcut_key">S</span>hape</a>' : '',
                '</div>',
                '<div class="clear"></div>',

                '<h3>Measure Distance</h3>',
                '<div class="information">', maptool.polygon.string_coordinates(), '</div>'
            ].join('')));
        };
        // *****************************************************************************************

        maptool.polygon.edit = function () {

            maptool.controls.show();

            var points_length = maptool.polygon.points.length;
          //  var next_point_location;
            var icon_width = 14;
            var icon_height = 14;

            var pin_options = {
                draggable: true,
                icon: 'https://eperf.ericssonperformance.com/ePerf/img/toolpin.png', // 'C:/Drive L/MAPS/Bing PolyLIne/Bing Maps Polygon_Polyline Tool_files/toolpin.png',
                height: icon_height,
                width: icon_width,
                anchor: new Microsoft.Maps.Point(icon_width / 2, icon_height / 2)
            }

            maptool.polygon.render();

            for (var i = 0; i < points_length; i++) {

                var point_location = maptool.polygon.points[i];
                var point_longitude = point_location.longitude;
                var point_latitude = point_location.latitude;

                // closed polyline has 2 identical points at 0 and length -1
                if (i > 1) {
                    var point0_location = maptool.polygon.points[0];
                    if (String(point0_location) === String(point_location)) {
                        continue;
                    }
                }

                var mm_location = new Microsoft.Maps.Location(point_latitude, point_longitude);
                var edit_pin = new Microsoft.Maps.Pushpin(mm_location, pin_options);
                //var edit_pin = new Microsoft.Maps.Pushpin(mm_location,null);
                edit_pin.entity.id = i;
               // map.entities.push(edit_pin);
                rulerLayer.add(edit_pin); // push starting and ending points on map

                Microsoft.Maps.Events.addHandler(edit_pin, 'dragend', maptool.polygon.edit_update_pin);
                Microsoft.Maps.Events.addHandler(edit_pin, 'mouseover', maptool.cursor.move);

               // var splitter_ref = i + 1;
               // var next_point_location = maptool.polygon.points[splitter_ref];
            }
        };

        // *****************************************************************************************

        maptool.polygon.edit_update_pin = function (e) {

            // only delete with shift key down
           /* if (e.originalEvent.shiftKey) {
                var point_ref = maptool.polygon.points[e.target.iref];
                var point_ref_latitude = point_ref.latitude;
                var point_ref_longitude = point_ref.longitude;
                var points = maptool.polygon.points;
                var points_length = points.length;

                // a shape close point can occupy 2 points, start and end - so loop
                for (var i = points_length - 1; i >= 0; i--) {
                    var point = points[i];
                    if (point.longitude == point_ref_longitude && point.latitude == point_ref_latitude) {
                        var spliced = maptool.polygon.points.splice(i, 1);
                    }
                }

            } else {
            */
                var pin_location = e.target.getLocation();
                var pin_longitude = pin_location.longitude;
                var pin_latitude = pin_location.latitude;
                var point_ref = e.target.entity.id;//e.target.iref;

                // maptool.polygon.points[point_ref is a reference, will update a close point
                maptool.polygon.points[point_ref].latitude = pin_latitude;
                maptool.polygon.points[point_ref].longitude = pin_longitude;

          //  }

            maptool.polygon.edit();

        };

        // *****************************************************************************************

        maptool.polygon.edit_update_splitter = function (e) {
            if (e.targetType == 'pushpin') {
                var pin_location = e.target.getLocation();
                var pin_longitude = pin_location.longitude;
                var pin_latitude = pin_location.latitude;
                var point_ref = e.target.entity.id;
                var mm_point = new Microsoft.Maps.Location(pin_latitude, pin_longitude)
                maptool.polygon.points.splice(point_ref, 0, mm_point);
                maptool.polygon.edit();

            }
        };

        // *****************************************************************************************

        maptool.cursor = {};

        maptool.cursor.crosshairs = function (e) {
            if (!(maptool.mousedown)) {
                $('.MicrosoftMap').css('cursor', 'crosshair');
            }
        };

        maptool.cursor.pointer = function (e) {
            if (!(maptool.mousedown)) {
                $('.MicrosoftMap').css('cursor', 'pointer');
            }
        };

        maptool.cursor.move = function (e) {
            if (!(maptool.mousedown)) {
                $('.MicrosoftMap').css('cursor', 'move');
            }
        };
        this.RemoveRulerLayer = function () {

            var s = map.layers.indexOf(rulerLayer);
            if (s > -1) {

                map.layers.removeAt(s);
                //  map.entities.push(shapeLayer);
            }
            var e = map.layers.indexOf(rulerLayer);
            if (e > -1) {

                map.layers.removeAt(s);
                //  map.entities.push(edittingLayer);
            }

        };
        // *****************************************************************************************

        /* maptool.keydown = function(e) {
            // shortcut keys cvcxcvdsasdfdsazxcvcxzZxzcfdsa
            switch(e.keyCode){
                case 83: // "S"
                    maptool.polygon.close();
                    break;
                case 73: // "I"
                    maptool.polygon.import();
                    break;
                case 85: // "U"
                    maptool.polygon.undo_last();
                    break;
                case 82: // "R"
                    maptool.polygon.clear();
                    break;
                default:
                    break;
            }
        }; */

        // *****************************************************************************************

        maptool.key_is_down = function (key_code) {
            if (key_code in maptool.keysdown && maptool.keysdown[key_code]) {
                return true;
            } else {
                return false;
            }
        };

        // *****************************************************************************************

        maptool.click = function (e) {

            // DO NOT DELETE may use for future refrence to add context menu to the map 

            /* maptool.instance.entities.clear();
             var pushpin = e.target;
             var point_location;
             var infoboxOptions = {width :200, height :100, showCloseButton: true, zIndex: 0, offset:new Microsoft.Maps.Point(10,0), showPointer: true}; 
             var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                try{
                    point_location = e.target.tryPixelToLocation(point);
                }catch(e){
                    console.error('could not resolve click point');
                    return;
                }
             var defaultInfobox = new Microsoft.Maps.Infobox(point_location, infoboxOptions );    
             maptool.instance.entities.push(defaultInfobox);
            defaultInfobox.setHtmlContent('<ul id="myMapContextMenu" class="contextMenu"><li class="edit"><a href="#measure_distance">Measure Distance</a></li></ul>  ');   */

            /////////////////////////////////////////////
            var point = new Microsoft.Maps.Point(e.getX(), e.getY());
            try {
                var point_location = e.target.tryPixelToLocation(point);
            } catch (e) {
                console.error('could not resolve click point');
                return;
            }
            var point_longitude = point_location.longitude;
            var point_latitude = point_location.latitude;

            // remove close point if polygon is closed
            if (maptool.polygon.is_closed()) {
                maptool.polygon.points.pop();
            }

            var mm_location = new Microsoft.Maps.Location(point_latitude, point_longitude);
            maptool.polygon.points.push(mm_location);
            maptool.polygon.edit();

        };

        function MapContextMenuHandler(action, src, pos) {
            if (action == "measure_distance") { alert("mes"); }
        };
        // *****************************************************************************************

        maptool.change = function () {
            // placeholder, perhaps useful in force polygon redraw on Chrome/FF?
        };

        // *****************************************************************************************

        maptool.polygon.import = function () {

            var import_form = $('#import_form');
            var input_textarea = $('#import_form_textarea');

            import_form.toggle();
            input_textarea.select();

            import_form.submit(function () {

                var input = input_textarea.val();
                var lines = $.trim(input).split("\n");

                if (lines == '') {
                    return false;
                }

                maptool.polygon.clear();
                maptool.polygon.points = [];


                for (var i = 0; i < lines.length; i++) {
                    var line = $.trim(lines[i]);
                    if (line == '') {
                        continue;
                    }
                    var dimensions = line.split(",");
                    var point_longitude = $.trim(dimensions[0]);
                    var point_latitude = $.trim(dimensions[1]);
                    if (isNaN(point_longitude) || isNaN(point_longitude)) {
                        continue;
                    }
                    var mm_location = new Microsoft.Maps.Location(point_latitude, point_longitude);
                    maptool.polygon.points.push(mm_location);

                }

                maptool.polygon.edit();
                import_form.hide();
                input_textarea.val('');

                maptool.instance.setView({ center: mm_location, animate: true });

                return false;

            });
        };
        init_map = function (map) {

            var s = map.layers.indexOf(rulerLayer);
            if (s == -1) {
                map.layers.insert(rulerLayer);
            }
            else {
                map.layers.removeAt(s);
                map.layers.insert(rulerLayer);
            }
            //var s = map.entities.indexOf(rulerLayer);
            //if (s == -1) {
            //    map.entities.push(rulerLayer);
            //}

        };
        init_map(map);
    },
    MapMath: {
        areLocationsEqual: function (loc1, loc2) {
            /// <summary>Checks to see if two location objects are equal at an accuracy of 5 decimal places.</summary>
            /// <param name='loc1' type='Microsoft.Maps.Location'/>
            /// <param name='loc2' type='Microsoft.Maps.Location'/>
            /// <returns type='Boolean'/>
            return Math.round(loc1.latitude * 10000) == Math.round(loc2.latitude * 10000) &&
                Math.round(loc1.longitude * 10000) == Math.round(loc2.longitude * 10000);
        },
        degToRad: function (angle) {
            /// <summary>Converts an angle in radians to degress.</summary>
            /// <param name='angle' type='Number'>Angle in radians.</param>
            /// <returns type='Number'>Angle in degress.</returns>
            return angle * Math.PI / 180;
        },
        radToDeg: function (angle) {
            /// <summary>Converts an angle in degress to radians.</summary>
            /// <param name='angle' type='Number'>Angle in degrees.</param>
            /// <returns type='Number'>Angle in radians.</returns>
            return angle * 180 / Math.PI;
        },
        /// <field>A set of spatial constants.</field>
        constants: {
            EARTH_RADIUS_METERS: 6378100,
            EARTH_RADIUS_KM: 6378.1,
            EARTH_RADIUS_MILES: 3963.1676,
            EARTH_RADIUS_FEET: 20925524.9,
        },
        convertDistance: function (distance, from, to) {
            /// <summary>Converts a distance value from one distance unit to another.</summary>
            /// <param name='distance' type='Number'></param>
            /// <param name='from' type='maptool.DistanceUnit'>The distance unit to convert from.</param>
            /// <param name='to' type='maptool.DistanceUnit'>The distance unit to convert to.</param>
            /// <returns type='Number'/>

            //Convert the distance to kilometers
            switch (from) {
                case maptool.DistanceUnit.meters:
                    distance /= 1000;
                    break;
                case maptool.DistanceUnit.feet:
                    distance /= 3288.839895;
                    break;
                case maptool.DistanceUnit.miles:
                    distance *= 1.609344;
                    break;
                case maptool.DistanceUnit.yards:
                    distance *= 0.0009144;
                    break;
                case maptool.DistanceUnit.km:
                    break;
            }

            //Convert from kilometers to output distance unit
            switch (to) {
                case maptool.DistanceUnit.meters:
                    distance *= 1000;
                    break;
                case maptool.DistanceUnit.feet:
                    distance *= 5280;
                    break;
                case maptool.DistanceUnit.miles:
                    distance /= 1.609344;
                    break;
                case maptool.DistanceUnit.yards:
                    distance *= 1093.6133;
                    break;
                case maptool.DistanceUnit.km:
                    break;
            }

            return distance;
        },
        getEarthRadius: function (distanceUnits) {
            /// <summary>Gets the earths radius for the specified distance units.</summary>
            /// <param name='distanceUnits' type='maptool.DistanceUnit'>The distance unit to get the earth radius for.</param>
            /// <returns type='Number'/>

            switch (distanceUnits) {
                case maptool.DistanceUnit.km:
                    return maptool.MapMath.constants.EARTH_RADIUS_KM;
                case maptool.DistanceUnit.meters:
                    return maptool.MapMath.constants.EARTH_RADIUS_METERS;
                case maptool.DistanceUnit.feet:
                    return maptool.MapMath.constants.EARTH_RADIUS_FEET;
                case maptool.DistanceUnit.miles:
                    return maptool.MapMath.constants.EARTH_RADIUS_MILES;
                case maptool.DistanceUnit.yards:
                    return maptool.MapMath.constants.EARTH_RADIUS_KM * 1093.6133;
                    break;
            }
        },
        calculateCoord: function (origin, brng, arcLength, distanceUnits) {
            /// <summary>Calcualtes a destination coordinate based on a starting location, bearing, and distance along the curvature of the earth.</summary>
            /// <param name='origin' type='Microsoft.Maps.Location'/>
            /// <param name='brng' type='Number'>The bearing from the orgin coordinate to the destination coordinate.</param>
            /// <param name='arcLength' type='Number'>The distance the destination coordinate is from the origin.</param>
            /// <param name='distanceUnits' type='maptool.DistanceUnit'>The distance unit that the arcLength is in.</param>
            /// <returns type='Number'/>

            var earthRadius = maptool.MapMath.getEarthRadius(distanceUnits);

            var lat1 = maptool.MapMath.degToRad(origin.latitude),
            lon1 = maptool.MapMath.degToRad(origin.longitude),
            centralAngle = arcLength / earthRadius;

            var lat2 = Math.asin(Math.sin(lat1) * Math.cos(centralAngle) + Math.cos(lat1) * Math.sin(centralAngle) * Math.cos(maptool.MapMath.degToRad(brng)));
            var lon2 = lon1 + Math.atan2(Math.sin(maptool.MapMath.degToRad(brng)) * Math.sin(centralAngle) * Math.cos(lat1), Math.cos(centralAngle) - Math.sin(lat1) * Math.sin(lat2));

            return new Microsoft.Maps.Location(maptool.MapMath.radToDeg(lat2), maptool.MapMath.radToDeg(lon2));
        },
        generateRegularPolygon: function (centerPoint, radius, distanceUnits, numberOfPoints, offset) {
            /// <summary>Calcualtes a points that make up a regular polygon. This method is often used with a lot of points to approximate the shape of a circle.</summary>
            /// <param name='centerPoint' type='Microsoft.Maps.Location'/>
            /// <param name='radius' type='Number'>Radius distance from the center to each data point.</param>
            /// <param name='distanceUnits' type='maptool.DistanceUnit'>The distance units that the radius is in.</param>
            /// <param name='radius' type='Number'>The number of data points to create the polygon.</param>
            /// <param name='offset' type='Number'>An angle in degrees to rotate the polygon by.</param>
            /// <returns type='Microsoft.Maps.Location[]'>An array of location coordinates that can be used to create a polygon</returns>

            var points = [],
            centralAngle = 360 / numberOfPoints;

            for (var i = 0; i <= numberOfPoints; i++) {
                points.push(maptool.MapMath.calculateCoord(centerPoint, (i * centralAngle + offset) % 360, radius, distanceUnits));
            }

            return points;
        },
        haversineDistance: function (loc1, loc2, distanceUnits) {
            /// <summary>Calcualtes the shorest distance between two locations on the curvature of the earth.</summary>
            /// <param name='loc1' type='Microsoft.Maps.Location'/>
            /// <param name='loc2' type='Microsoft.Maps.Location'/>
            /// <param name='distanceUnits' type='maptool.DistanceUnit'>The distance units to return distance in.</param>
            /// <returns type='Number'>The distance between two points in the specified distance units.</returns>

            if (loc1 && loc2) {
                var lat1 = maptool.MapMath.degToRad(loc1.latitude),
                lon1 = maptool.MapMath.degToRad(loc1.longitude),
                lat2 = maptool.MapMath.degToRad(loc2.latitude),
                lon2 = maptool.MapMath.degToRad(loc2.longitude);

                var dLat = lat2 - lat1,
                dLon = lon2 - lon1,
                cordLength = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2),
                centralAngle = 2 * Math.atan2(Math.sqrt(cordLength), Math.sqrt(1 - cordLength));

                var earthRadius = maptool.MapMath.getEarthRadius(distanceUnits);
                return earthRadius * centralAngle;
            }

            return 0;
        }
    }

};

// *****************************************************************************************

/****************************** 
    * Static Methods 
    *******************************/

/// <field>A set of spatial mathematic tools for use with the maptool module.</field>


//Call the Module Loaded method
Microsoft.Maps.moduleLoaded('RulerToolsModuleV8');
// *****************************************************************************************

//maptool.init_map = function (map) {

//    var s = map.layers.indexOf(rulerLayer);
//    if (s == -1) {
//        map.layers.insert(rulerLayer);
//    }

//};

// *****************************************************************************************

//maptool.init_map();