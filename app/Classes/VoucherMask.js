'use strict'


class VoucherMask {

  Convert (data) {
    var char = '0'; var voucher = "";
    var number = data.length_number;
    if (data.value) {
      if(data.suffixed == undefined){
        data.suffixed = '';
      };
        voucher = data.prefix + char.repeat(number - (data.value+"").length) + data.value + data.suffixed;
    } else {
        voucher = char.repeat(number);
    }
    return voucher
  }

}

module.exports = VoucherMask
