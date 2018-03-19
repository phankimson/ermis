;(function(undefined){
    "use strict";
 var Func,slice,arrayify,objToString,bitProto,ty;
     /**
     * Constructor.
     */
         slice = Array.prototype.slice;
    Func = function(list){
        this.m = 0;
        if (list) {
            list = arrayify.apply(this, arguments);
            this.set.apply(this, list);
        }
    };

 bitProto = Func.prototype;

 bitProto.Number = function($string){
   if($string){
    var check = $string.toString().indexOf(",")
    if ($string !== 0 && check !== -1) {
      return  $string = $string.replace(/\,/g, "")
    }
  }else{
    $string = 0
  }
    return $string
 }

    arrayify = function(list) {
        return objToString.call(list) === '[object Array]' ? list : slice.call(arguments);
    };

    if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Func;
    } else {
        this.Func = Func;
    }
}).call(this);
