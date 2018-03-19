;(function(undefined){
    "use strict";
 var Bitmask,slice,arrayify,objToString,pow,bitProto;
 var permissions = {
      "v" : false, // view = 1
      "a" : false, // add = 2
      "e" : false, // edit =4
      "d" : false,  //delete =8
      "p" : false, // priority =16 Quyền ưu tiên
      "s" : false // special = 32 Quyền đặc biệt
 }
    pow = Math.pow;
    slice = Array.prototype.slice;
     /**
     * Constructor.
     */
    Bitmask = function(list){
        this.m = 0;
        if (list) {
            list = arrayify.apply(this, arguments);
            this.set.apply(this, list);
        }
    };
 bitProto = Bitmask.prototype;

bitProto.getPermissions = function(bitMask) {
    var i = 0
    for (var k in permissions){
       if (permissions.hasOwnProperty(k)) {
            permissions[k] = ((bitMask & pow(2,i)) != 0 ) ? true : false;
            i++
       }
   }
   return permissions;
};


bitProto.toBitmask = function (){
    var bitmask = 0 ;
    var i = 0 ;
       for (var k in permissions){
       if (permissions.hasOwnProperty(k)) {
            bitmask  += pow(2,i) ;
       }
       i++
   }
   return bitmask;
}
    arrayify = function(list) {
        return objToString.call(list) === '[object Array]' ? list : slice.call(arguments);
    };

    if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Bitmask;
    } else {
        this.Bitmask = Bitmask;
    }
}).call(this);
