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
tmxloader = {};
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
    var result;     //parsing xml result
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
    xmlText = xmlhttp.responseText;

    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlText, "text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlText);
    }

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
    var $layer = xmlDoc.getElementsByTagName("layer");
    for (i = 0; i < $layer.length; i++) {
        //$xml.find('layer').each(function () {

        console.log("Processing Layer: " + ($layer[i].getAttribute("name")));

        $data = $layer[i].getElementsByTagName("data")[0];
        $lwidth = $layer[i].getAttribute("width");
        $lheight = $layer[i].getAttribute("height");
        //var properties = tmxloader.parseProperties($(this));
        tmxloader.map.layers[layerCount] = new tmxloader.Layer($layer[i].getAttribute("name"), $lwidth, $lheight/*, properties*/);
        if ($data.getAttribute("encoding") == "csv") {

            console.log("Processing CSV");

            //because firefox xmlHttpRequest parse xml with maximum 4096 character,
            //this loop glue all the pieces together
            var eData = '';
            for (j = 0; j < $data.childNodes.length; j++) {
                eData = eData + $data.childNodes[j].nodeValue;
            }
            tmxloader.map.layers[layerCount].loadCSV(eData);
        } else {
            console.log("Unsupported Encoding Scheme");
        }
        ++layerCount;//REAPLACE THIS WITH I
    }
    //});
    var $tileset = xmlDoc.getElementsByTagName("tileset");
    for (i = 0; i < $tileset.length; i++) {
        //$xml.find('tileset').each(function () {
        $firstgid = $tileset[i].getAttribute("firstgid");
        $name = $tileset[i].getAttribute("name");
        $tilewidth = $tileset[i].getAttribute("tilewidth");
        $tileheight = $tileset[i].getAttribute("tileheight");
        $image = $tileset[i].getElementsByTagName("image")[0];
        $src = $image.getAttribute("source");
        $width = $image.getAttribute("width");
        $height = $image.getAttribute("height");
        //var properties = tmxloader.parseProperties($(this));
        tmxloader.map.tilesets.push(new tmxloader.Tileset($firstgid, $name, $tilewidth, $tileheight, $src, $width, $height/*, properties*/));
        //});
    }
    tmxloader.map.objectgroup = new Object();
    var $objectgroup = xmlDoc.getElementsByTagName("objectgroup");
    for (i = 0; i < $objectgroup.length; i++) {
        //$xml.find('objectgroup').each(function () {
        $lwidth = $objectgroup[i].getAttribute("width");
        $lheight = $objectgroup[i].getAttribute("height");
        $numobjects = $objectgroup[i].getElementsByTagName("object").length;
        $objectGroupName = $objectgroup[i].getAttribute("name");

        console.log("Processing Object Group: " + $objectGroupName + " with " + $numobjects + " Objects");

        //var properties = tmxloader.parseProperties($(this));
        tmxloader.map.objectgroup['' + $objectGroupName + ''] = new tmxloader.ObjectGroup($objectGroupName, $lwidth, $lheight/*, properties*/);
        var $object = $objectgroup[i].getElementsByTagName("object");
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