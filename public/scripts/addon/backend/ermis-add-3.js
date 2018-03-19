var ErmisAdd3 = function () {
    initLoadBarcode = function(){
      var goods_value  = ''; var size_value = '';

      var goods = $("select[name='goods']").data("kendoDropDownList");
      goods.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       goods_value = dataItem.text.split(" - ",1);
          if(goods_value != '' && size_value != ''){
            jQuery("input[name='barcode']").val(goods_value+size_value)
          }
      });
      var size = $("select[name='size']").data("kendoDropDownList");
      size.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       size_value = dataItem.text.split(" - ",1);
       if(goods_value != '' && size_value != ''){
         jQuery("input[name='barcode']").val(goods_value+size_value)
       }
      });

    }

    return {

        init: function () {
            initLoadBarcode();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd3.init();
});
