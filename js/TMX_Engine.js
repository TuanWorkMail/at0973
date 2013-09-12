/**
 * tmx-loader.js  - A Javascript loader for the TMX File Format.
 *
 * 	Currenty Supports: 
 *						- Map
 *						- Layers
 *						- Tile Data (CSV only)
 *
 * 	Depends on: Jquery for file loading and XML parsing
 *
 */
tmxloader.trim = function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
tmxloader.Map = function (width, height, tileWidth, tileHeight, layers/*, properties*/) {
    this.width = width;
    this.height = height;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tilesets = new Array();
    this.layers = new Array(layers);
    //this.properties = properties;
}
tmxloader.Tileset = function (firstgid, name, tileWidth, tileHeight, src, width, height/*, properties*/) {
    this.firstGid = firstgid;
    this.name = name;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.src = src;
    this.width = width;
    this.height = height;
    //this.properties = properties;
}
tmxloader.Layer = function (layerName, width, height/*, properties*/) {
    this.name = layerName;
    this.width = width;
    this.height = height;
    this.data = new Array(width);
    //this.properties = properties;
    //THIS ONE HAS BEEN FIXED A LOT
    for (var d = 0; d < width; ++d) {
        this.data[d] = new Array(height);
    }
    this.loadCSV = function (data) {
        //array hold each row
        var layerData = tmxloader.trim(data).split('\n');
        //each row
        for (var y = 0; y < layerData.length; ++y) {
            var line = tmxloader.trim(layerData[y]);
            //array hold every tile in a row
            var entries = line.split(',');
            //each tile
            for (var x = 0; x < width; ++x) {
                //tile at x,y have gid 
                this.data[x][y] = entries[x];
            }
        }
    }
}
tmxloader.Object = function (objectname, type, x, y, width, height/*, properties*/) {
    this.name = objectname;
    this.width = parseInt(width);
    this.height = parseInt(height);
    this.x = Number(x);
    this.y = Number(y);
    this.type = type;
    //this.properties = properties;
}
tmxloader.ObjectGroup = function (groupname, width, height/*, properties*/) {
    this.name = groupname;
    this.width = width;
    this.height = height;
    this.objects = new Array();
    //this.properties = properties;
}
//MAYBE NO FUNCTION
/*
tmxloader.parseProperties = function ($xml) {
    var properties = new Array();
    $xml.find('properties:first ').each(function () {
        $xml.find('property').each(function () {

            console.log("Processing Property: " + $(this).attr("name") + " =  " + $(this).attr("value"));

            properties['' + $(this).attr("name") + ''] = $(this).attr("value");
        });
    });
    return properties;
}
*/
tmxloader.load = function (url) {
    var result,     //parsing xml result
        tagList;    //result from getElementsByTagName
    /*
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = data;
        }
    });
    var xmlDoc = jQuery.parseXML(result);
    $xml = $(xmlDoc);
    */
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET", url, false);
    //xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //xmlhttp.setRequestHeader("Content-length", 4096);
    //xmlhttp.setRequestHeader("Connection", "close");
    xmlhttp.send();
    xmlDoc = parseXML(xmlhttp.responseText);


    $version = xmlDoc.getElementsByTagName("map")[0].getAttribute("version");

    console.log('Parsing...' + $version);

    $width = xmlDoc.getElementsByTagName("map")[0].getAttribute("width");
    $height = xmlDoc.getElementsByTagName("map")[0].getAttribute("height");
    $tilewidth = xmlDoc.getElementsByTagName("map")[0].getAttribute("tilewidth");
    $tileheight = xmlDoc.getElementsByTagName("map")[0].getAttribute("tileheight");
    //var properties = tmxloader.parseProperties($xml);
    tmxloader.map = new tmxloader.Map($width, $height, $tilewidth, $tileheight, xmlDoc.getElementsByTagName("map").length/*, properties*/);

    console.log('Creating Map...' + tmxloader.map.width + " x " + tmxloader.map.height + " Tiles: " + tmxloader.map.tileWidth + " x " + tmxloader.map.tileHeight);
    console.log("Found " + xmlDoc.getElementsByTagName("layer").length + " Layers");

    var layerCount = 0;
    tagList = xmlDoc.getElementsByTagName("layer");
    for (i = 0; i < tagList.length; i++) {
        //$xml.find('layer').each(function () {

        console.log("Processing Layer: " + (tagList[i].getAttribute("name")));

        $data = tagList[i].getElementsByTagName("data")[0];
        $lwidth = tagList[i].getAttribute("width");
        $lheight = tagList[i].getAttribute("height");
        //var properties = tmxloader.parseProperties($(this));
        tmxloader.map.layers[layerCount] = new tmxloader.Layer(tagList[i].getAttribute("name"), $lwidth, $lheight/*, properties*/);
        if ($data.getAttribute("encoding") == "csv") {

            console.log("Processing CSV");

            var eData = $data.childNodes[0].nodeValue;
            tmxloader.map.layers[layerCount].loadCSV(eData);
        } else {
            console.log("Unsupported Encoding Scheme");
        }
        ++layerCount;//REAPLACE THIS WITH I
    }
    //});
    tagList = xmlDoc.getElementsByTagName("tileset");
    for (i = 0; i < tagList.length; i++) {
        //$xml.find('tileset').each(function () {
        $firstgid = tagList[i].getAttribute("firstgid");
        $name = tagList[i].getAttribute("name");
        $tilewidth = tagList[i].getAttribute("tilewidth");
        $tileheight = tagList[i].getAttribute("tileheight");
        $image = tagList[i].getElementsByTagName("image")[0];
        $src = $image.getAttribute("source");
        $width = $image.getAttribute("width");
        $height = $image.getAttribute("height");
        //var properties = tmxloader.parseProperties($(this));
        tmxloader.map.tilesets.push(new tmxloader.Tileset($firstgid, $name, $tilewidth, $tileheight, $src, $width, $height/*, properties*/));
        //});
    }
    tmxloader.map.objectgroup = new Object();
    tagList = xmlDoc.getElementsByTagName("objectgroup");
    for (i = 0; i < tagList.length; i++) {
        //$xml.find('objectgroup').each(function () {
        $lwidth = tagList[i].getAttribute("width");
        $lheight = tagList[i].getAttribute("height");
        $numobjects = tagList[i].getElementsByTagName("object").length;
        $objectGroupName = tagList[i].getAttribute("name");

        console.log("Processing Object Group: " + $objectGroupName + " with " + $numobjects + " Objects");

        //var properties = tmxloader.parseProperties($(this));
        tmxloader.map.objectgroup['' + $objectGroupName + ''] = new tmxloader.ObjectGroup($objectGroupName, $lwidth, $lheight/*, properties*/);
        var $object = xmlDoc.getElementsByTagName("object");
        for (j = 0; j < $object.length; j++) {
            //$(this).find('object').each(function () {
            $objectname = $object[j].getAttribute("name");
            $objecttype = $object[j].getAttribute("type");
            $objectx = $object[j].getAttribute("x");
            $objecty = $object[j].getAttribute("y");
            $objectwidth = $object[j].getAttribute("width");
            $objectheight = $object[j].getAttribute("height");

            console.log("Processing Object: " + $objectname);

            //var properties = tmxloader.parseProperties($(this));
            tmxloader.map.objectgroup['' + $objectGroupName + ''].objects.push(new tmxloader.Object($objectname, $objecttype, $objectx, $objecty, $objectwidth, $objectheight/*, properties*/));
            //});
        }
        //});
    }
}

function parseXML( data ) {
    var xml, tmp;
    if ( !data || typeof data !== "string" ) {
        return null;
    }
    try {
        if ( window.DOMParser ) { // Standard
            tmp = new DOMParser();
            xml = tmp.parseFromString( data , "text/xml" );
        } else { // IE
            xml = new ActiveXObject( "Microsoft.XMLDOM" );
            xml.async = "false";
            xml.loadXML( data );
        }
    } catch( e ) {
        xml = undefined;
    }
    if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
        jQuery.error( "Invalid XML: " + data );
    }
    return xml;
}
