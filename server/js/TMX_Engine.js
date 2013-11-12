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
var fs = require('fs'),
    xml2js = require('xml2js'),
    util = require("util");
var tmxloader = {};
var trim = function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};
var Map = function (width, height, tileWidth, tileHeight, layersLength) {
    this.width = width;
    this.height = height;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tilesets = [];
    this.layers = new Array(layersLength);

};
var Tileset = function (firstgid, name, tileWidth, tileHeight, src, width, height) {
    this.firstGid = firstgid;
    this.name = name;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.src = src;
    this.width = width;
    this.height = height;

};
var Layer = function (layerName, width, height) {
    this.name = layerName;
    this.width = width;
    this.height = height;
    this.data = new Array(width);

    //THIS ONE HAS BEEN FIXED A LOT
    for (var d = 0; d < width; ++d) {
        this.data[d] = new Array(height);
    }
    this.loadCSV = function (data) {
        //array hold each row
        var layerData = trim(data).split('\n');
        //each row
        for (var y = 0; y < layerData.length; ++y) {
            var line = trim(layerData[y]);
            //array hold every tile in a row
            var entries = line.split(',');
            //each tile
            for (var x = 0; x < width; ++x) {
                //tile at x,y have gid 
                this.data[x][y] = entries[x];
            }
        }
    }
};
var TmxObject = function (objectname, type, x, y, width, height) {
    this.name = objectname;
    this.width = parseInt(width);
    this.height = parseInt(height);
    this.x = Number(x);
    this.y = Number(y);
    this.type = type;

};
var ObjectGroup = function (groupname, width, height) {
    this.name = groupname;
    this.width = width;
    this.height = height;
    this.objects = [];

};
///classic2.tmx
tmxloader.load = function (url) {
    var parser = new xml2js.Parser();
    fs.readFile(url, function(err, data) {
        parser.parseString(data, function (err, result) {
            loadCallback(result);
        });
    });
};
function loadCallback(result) {
    //console.log('Parsing...' + result.map.$.version);

    var $width = result.map.$.width;
    var $height = result.map.$.height;
    var $tilewidth = result.map.$.tilewidth;
    var $tileheight = result.map.$.tileheight;
    tmxloader.map = new Map($width, $height, $tilewidth, $tileheight, result.map.layer.length);

    //console.log('Creating Map...' + tmxloader.map.width + " x " + tmxloader.map.height + " Tiles: " + tmxloader.map.tileWidth + " x " + tmxloader.map.tileHeight);
    //console.log("Found " + result.map.layer.length + " Layers");

    var $layer = result.map.layer;
    for (i = 0; i < $layer.length; i++) {

        //console.log("Processing Layer: " + ($layer[i].$.name));

        var $data = $layer[i].data[0];
        var $lwidth = $layer[i].$.width;
        var $lheight = $layer[i].$.height;
        tmxloader.map.layers[i] = new Layer($layer[i].$.name, $lwidth, $lheight);
        if ($data.$.encoding == "csv") {

            //console.log("Processing CSV");

            tmxloader.map.layers[i].loadCSV($data._);
        } else {
            //console.log("Unsupported Encoding Scheme");
        }
    }
    var $tileset = result.map.tileset;
    for (i = 0; i < $tileset.length; i++) {
        var $firstgid = $tileset[i].$.firstgid;
        var $name = $tileset[i].$.name;
        var $tilewidth = $tileset[i].$.tilewidth;
        var $tileheight = $tileset[i].$.tileheight;
        var $image = $tileset[i].image[0];
        var $src = $image.$.source;
        var $width = $image.$.width;
        var $height = $image.$.height;
        tmxloader.map.tilesets.push(new Tileset($firstgid, $name, $tilewidth, $tileheight, $src, $width, $height));
    }
    tmxloader.map.objectgroup = {};
    var $objectgroup = result.map.objectgroup;
    for (var i = 0; i < $objectgroup.length; i++) {
        var $lwidth = $objectgroup[i].$.width;
        var $lheight = $objectgroup[i].$.height;
        var $numobjects = $objectgroup[i].object.length;
        var $objectGroupName = $objectgroup[i].$.name;

        //console.log("Processing Object Group: " + $objectGroupName + " with " + $numobjects + " Objects");

        tmxloader.map.objectgroup['' + $objectGroupName + ''] = new ObjectGroup($objectGroupName, $lwidth, $lheight);
        var $objects = $objectgroup[i].object;
        for (var j = 0; j < $objects.length; j++) {
            var $objectname = $objects[j].$.name;
            var $objecttype = $objects[j].$.type;
            var $objectx = $objects[j].$.x;
            var $objecty = $objects[j].$.y;
            var $objectwidth = $objects[j].$.width;
            var $objectheight = $objects[j].$.height;

            //console.log("Processing Object: " + $objectname);

            tmxloader.map.objectgroup['' + $objectGroupName + ''].objects.push(new TmxObject($objectname, $objecttype, $objectx, $objecty, $objectwidth, $objectheight));
        }
    }
    util.log('map loaded');
}
exports.layerByName = function(name) {
    for (var i = 0; i < tmxloader.map.layers.length; i++) {
        if (tmxloader.map.layers[i].name == name) {
            return tmxloader.map.layers[i];
        }
    }
    return false;
}
exports.tmxloader = tmxloader;