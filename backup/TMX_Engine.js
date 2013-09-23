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
tmxloader.Map = function (width, height, tileWidth, tileHeight, layers, properties) {
    this.width = width;
    this.height = height;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tilesets = new Array();
    this.layers = new Array(layers);
    this.properties = properties;
}
tmxloader.Tileset = function (firstgid, name, tileWidth, tileHeight, src, width, height, properties) {
    this.firstGid = firstgid;
    this.name = name;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.src = src;
    this.width = width;
    this.height = height;
    this.properties = properties;
}
tmxloader.Layer = function (layerName, width, height, properties) {
    this.name = layerName;
    this.width = width;
    this.height = height;
    this.data = new Array(width);
    this.properties = properties;
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
tmxloader.Object = function (objectname, type, x, y, width, height, properties) {
    this.name = objectname;
    this.width = parseInt(width);
    this.height = parseInt(height);
    this.x = Number(x);
    this.y = Number(y);
    this.type = type;
    this.properties = properties;
}
tmxloader.ObjectGroup = function (groupname, width, height, properties) {
    this.name = groupname;
    this.width = width;
    this.height = height;
    this.objects = new Array();
    this.properties = properties;
}
//MAYBE NO FUNCTION
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
tmxloader.load = function (url) {
    var result;
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
    $version = $xml.find("map").attr("version");

    console.log('Parsing...' + $version);

    $width = $xml.find("map").attr("width");
    $height = $xml.find("map").attr("height");
    $tilewidth = $xml.find("map").attr("tilewidth");
    $tileheight = $xml.find("map").attr("tileheight");
    var properties = tmxloader.parseProperties($xml);
    tmxloader.map = new tmxloader.Map($width, $height, $tilewidth, $tileheight, $xml.find('layer').length, properties);

    console.log('Creating Map...' + tmxloader.map.width + " x " + tmxloader.map.height + " Tiles: " + tmxloader.map.tileWidth + " x " + tmxloader.map.tileHeight);
    console.log("Found " + $xml.find('layer').length + " Layers");

    var layerCount = 0;
    $xml.find('layer').each(function () {

        console.log("Processing Layer: " + $(this).attr("name"));

        $data = $(this).find("data");
        $lwidth = $(this).attr("width");
        $lheight = $(this).attr("height");
        var properties = tmxloader.parseProperties($(this));
        tmxloader.map.layers[layerCount] = new tmxloader.Layer($(this).attr("name"), $lwidth, $lheight, properties);
        if ($data.attr("encoding") == "csv") {

            console.log("Processing CSV");

            var eData = $data.text();
            tmxloader.map.layers[layerCount].loadCSV(eData);
        } else {
            console.log("Unsupported Encoding Scheme");
        }
        ++layerCount;
    });
    $xml.find('tileset').each(function () {
        $firstgid = $(this).attr("firstgid");
        $name = $(this).attr("name");
        $tilewidth = $(this).attr("tilewidth");
        $tileheight = $(this).attr("tileheight");
        $image = $(this).find('image');
        $src = $image.attr("source");
        $width = $image.attr("width");
        $height = $image.attr("height");
        var properties = tmxloader.parseProperties($(this));
        tmxloader.map.tilesets.push(new tmxloader.Tileset($firstgid, $name, $tilewidth, $tileheight, $src, $width, $height, properties));
    });
    tmxloader.map.objectgroup = new Object();
    $xml.find('objectgroup').each(function () {
        $lwidth = $(this).attr("width");
        $lheight = $(this).attr("height");
        $numobjects = $(this).find('object').length;

        console.log("Processing Object Group: " + $(this).attr("name") + " with " + $numobjects + " Objects");

        var properties = tmxloader.parseProperties($(this));
        tmxloader.map.objectgroup['' + $(this).attr("name") + ''] = new tmxloader.ObjectGroup($(this).attr("name"), $lwidth, $lheight, properties);
        $objectGroupName = $(this).attr("name");
        $(this).find('object').each(function () {
            $objectname = $(this).attr("name");
            $objecttype = $(this).attr("type");
            $objectx = $(this).attr("x");
            $objecty = $(this).attr("y");
            $objectwidth = $(this).attr("width");
            $objectheight = $(this).attr("height");

            console.log("Processing Object: " + $objectname);

            var properties = tmxloader.parseProperties($(this));
            tmxloader.map.objectgroup['' + $objectGroupName + ''].objects.push(new tmxloader.Object($objectname, $objecttype, $objectx, $objecty, $objectwidth, $objectheight, properties));
        });
    });
}