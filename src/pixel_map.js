var jaws = (function(jaws) {
/**
* @class PixelPerfect collision map. Created from an image.
* @constructor
*  
* @property {string} image     the map
*/

jaws.PixelMap = function PixelMap(options) {
  if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

  this.options = options
  if(options.image) {
    this.setContext(options.image);

    if(options.scale_image) {
      this.setContext(  jaws.gfx.retroScaleImage(this.context.canvas, options.scale_image) )
    }

    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
  }
  else { console.log.warn("PixelMap needs an image to work with") }
  
  this.named_colors = [];
  this.update();
}

/*
* Initiates a drawable context from given image.
* @private
*/
jaws.PixelMap.prototype.setContext = function(image) {
  var image = jaws.isDrawable(image) ? image : jaws.assets.get(image)
  this.context = jaws.imageToCanvasContext(image)
} 

/**
* Updates internal datastructure from the canvas. If we modify the 'terrain' we'll need to call this again.
* Future idea: Only update parts of the array that's been modified.
*/
jaws.PixelMap.prototype.update = function(x, y, width, height) {
  if(x === undefined) x = 0;
  if(y === undefined) y = 0;
  if(width === undefined)   width = this.width;
  if(height === undefined)  height = this.height;
 
  console.log("getImageData", x, " ", y, " - ", width, " ", height);
  // No arguments? Read whole canvas, replace this.data
  if(arguments.length == 0) {
    this.data = this.context.getImageData(x, y, width, height).data
  }
  // Read a rectangle from the canvas, replacing relevant pixels in this.data
  else {
    var tmp = this.context.getImageData(x, y, width, height).data
    var offset = (y * this.sprite.width * 4) + (x*4)
    for(var i=0; i < tmp.length; i++) {
      this.data[offset + i] = tmp[i];
    }
  }
}

/**
* Draws pixelsmaps image like a sprite
*/ 
jaws.PixelMap.prototype.draw = function() {
  //jaws.context.drawImage(jaws.assets.get(this.options.image), 0, 0, this.width, this.height)
  jaws.context.drawImage(this.context.canvas, 0, 0, this.width, this.height)
  //this.sprite.draw();
}


/**
* Trace the outline of a Rect until a named color found. Returns found color.
*
* @return truish if color is found
*/
jaws.PixelMap.prototype.namedColorAtRect = function(color, rect) {
  var x = rect.x
  var y = rect.y

  for(; x < rect.right; x++)  if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y < rect.bottom; y++) if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; x > rect.x; x--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);
  for(; y > rect.y; y--)      if(this.namedColorAt(x, y) == color) return this.namedColorAt(x,y);

  return false;
}

/**
* Read current color at given coordinates X/Y 
* returns array of 4 numbers [R, G, B, A]
*/
jaws.PixelMap.prototype.at = function(x, y) {
  x = parseInt(x)
  y = parseInt(y)
  if(y < 0) y = 0;

  var start = (y * this.width * 4) + (x*4);
  var R = this.data[start];
  var G = this.data[start + 1];
  var B = this.data[start + 2];
  var A = this.data[start + 3];
  return [R, G, B, A];
}

/**
* Returns a previously named color if it exists at given x/y-coordinates.
*
*/
jaws.PixelMap.prototype.namedColorAt = function(x, y) {
  var a = this.at(x, y);
  for(var i=0; i < this.named_colors.length; i++) {
    var name = this.named_colors[i].name;
    var c = this.named_colors[i].color;
    if(c[0] == a[0] && c[1] == a[1] && c[2] == a[2] && c[3] == a[3]) return name;
  }
}

jaws.PixelMap.prototype.nameColor = function(name, color) {
  this.named_colors.push({name: name, color: color});
}

return jaws;
})(jaws || {});