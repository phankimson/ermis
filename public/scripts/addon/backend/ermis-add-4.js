var ErmisAdd = function () {
  var $kGrid = jQuery('#grid');
  var initBlurDiscount = function(){
    jQuery('input[name="discount_percent"],input[name="discount"]').on('blur',function(){
      var total = calculatePriceAggregateDiscount();
      jQuery('#amount_total').text(total);
    })
  }

      calculatePriceAggregateDiscount = function () {
          var grid = $kGrid.data("kendoGrid");
          var data = grid.dataSource.data();
          var discount_percent = jQuery('input[name="discount_percent"]').val();
          var discount = jQuery('input[name="discount"]').val();
          if(discount_percent == null){
            discount_percent = 0;
          }
          if(discount == null){
            discount = 0;
          }
          var total = 0;
          for (var i = 0; i < data.length; i++) {
            if(data[i].discount_percent == null){
              data[i].discount_percent = 0;
            }
            if(data[i].discount == null){
              data[i].discount = 0;
            }
              if (data[i].quantity > 0 && data[i].price > 0) {
                  var check = data[i].price.toString().indexOf(",");
                  if (data[i].price !== 0 && check !== -1) {
                      data[i].price = data[i].price.replace(/\,/g, "");
                  }
                  total += data[i].quantity * data[i].price*(1-(data[i].discount_percent/100))-data[i].discount;
              }else if(data[i].quantity > 0 && data[i].purchase_price > 0){
                var check = data[i].purchase_price.toString().indexOf(",");
                if (data[i].purchase_price !== 0 && check !== -1) {
                    data[i].purchase_price = data[i].purchase_price.replace(/\,/g, "");
                }
                  total += (data[i].quantity * data[i].purchase_price)*(1-(data[i].discount_percent/100))-data[i].discount;
              }
          }
          total = total * (1-(discount_percent/100)) - discount
          return kendo.toString(total, 'n0');
      };
    var initKendoUiTextBoxNumber = function(){
      // create NumericTextBox from input HTML element
                 $("#numeric").kendoNumericTextBox({
                     format: "n0",
                      step: 1000,
                      min : 0
                 });

                 // create Curerncy NumericTextBox from input HTML element
                 $("#currency").kendoNumericTextBox({
                     format: "c",
                     decimals: 3
                 });

                 // create Percentage NumericTextBox from input HTML element
                 $("#percentage").kendoNumericTextBox({
                     format: "n0",
                     min: 0,
                     max: 100,
                     step: 1
                 });

                 // create NumericTextBox from input HTML element using custom format
                 $("#custom").kendoNumericTextBox({
                     format: "#.00 kg"
                 });
      }

    return {

        init: function () {
          initBlurDiscount();
          calculatePriceAggregateDiscount();
          initKendoUiTextBoxNumber();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd.init();
});
