var ErmisAdd2 = function () {
    initLoadBarcode = function(){
      var group_value = '',style_value = '', model_value = '', style_name = '' , item_value = '',model_name ='';
      var group = $("select[name='group']").data("kendoDropDownList");
      group.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       group_value = dataItem.text.split(" - ",1);
       jQuery.post( Ermis.link+'-load', function( result ) {
          item_value = (initBarcodeMasker(result.data))
          jQuery("input[name='code']").val(item_value)
        });
          if(group_value != '' && style_value != '' && model_value != ''){
            jQuery("input[name='barcode']").val(group_value+model_value+style_value)
          }else{
            group_value = jQuery("select[name='group']").data("kendoDropDownList").text().split(" - ",1);
            style_value = jQuery("select[name='style']").data("kendoDropDownList").text().split(" - ",1);
            model_value = jQuery("select[name='model']").data("kendoDropDownList").text().split(" - ",1);
            if(group_value && style_value && model_value){
            jQuery("input[name='barcode']").val(group_value[0]+model_value[0]+style_value[0])
            }
          }
      });
      //var origin = $("select[name='origin']").data("kendoDropDownList");
      //origin.bind('change', function (e) {
       //var dataItem = e.sender.dataItem();
       //origin_value = dataItem.text.split(" - ",1);
       //jQuery.post( Ermis.link+'-load', function( result ) {
        //item_value = (initBarcodeMasker(result.data))
        //});
          //jQuery("input[name='code']").val(item_value)
        //if(group_value != '' && origin_value != '' && style_value != '' && model_value != ''){
          //jQuery("input[name='barcode']").val(group_value+origin_value+model_value+style_value)
        //}
      //});
      var style = $("select[name='style']").data("kendoDropDownList");
      style.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       style_value = dataItem.text.split(" - ",1);
       style_name = dataItem.text.split(" - ",2);
       jQuery.post( Ermis.link+'-load', function( result ) {
        item_value = (initBarcodeMasker(result.data));
          jQuery("input[name='code']").val(item_value)
        });

        if( style_value != '' && model_value != ''){
        jQuery("input[name='name'],input[name='name_en']").val(model_name[1]+' - '+style_name[1])
        }else if(model_value == ''){
          model_name =  jQuery("select[name='model']").data("kendoDropDownList").text().split(" - ",2);
          jQuery("input[name='name'],input[name='name_en']").val(model_name[1]+' - '+style_name[1])
        }

        if(group_value != '' && style_value != '' && model_value != ''){
          jQuery("input[name='barcode']").val(group_value+model_value+style_value)
        }else{
          group_value = jQuery("select[name='group']").data("kendoDropDownList").text().split(" - ",1);
          style_value = jQuery("select[name='style']").data("kendoDropDownList").text().split(" - ",1);
          model_value = jQuery("select[name='model']").data("kendoDropDownList").text().split(" - ",1);
          if(group_value && style_value && model_value){
          jQuery("input[name='barcode']").val(group_value[0]+model_value[0]+style_value[0])
          }
        }
      });

      var model = $("select[name='model']").data("kendoDropDownList");
      model.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       model_value = dataItem.text.split(" - ",1);
       model_name = dataItem.text.split(" - ",2);
       jQuery.post( Ermis.link+'-load', function( result ) {
          item_value = (initBarcodeMasker(result.data));
          jQuery("input[name='code']").val(item_value);
          });
        if( style_value != '' && model_value != ''){
        jQuery("input[name='name'],input[name='name_en']").val(model_name[1]+' - '+style_name[1])
        }
        if(group_value != '' && style_value != '' && model_value != ''){
          jQuery("input[name='barcode']").val(group_value+model_value+style_value)
        }else{
          group_value = jQuery("select[name='group']").data("kendoDropDownList").text().split(" - ",1);
          style_value = jQuery("select[name='style']").data("kendoDropDownList").text().split(" - ",1);
          model_value = jQuery("select[name='model']").data("kendoDropDownList").text().split(" - ",1);
          if(group_value && style_value && model_value){
          jQuery("input[name='barcode']").val(group_value[0]+model_value[0]+style_value[0])
          }
        }
      });

    }
    initImage = function(){
       $("#image").kendoUpload({ "multiple": false });
    }
    initToolTip = function(){
      var template = kendo.template($("#toolTipTemplate").html());
      //initialize tooltip to grid tbody with filter cells with given CSS class
       tooltip = $("#grid tbody").kendoTooltip({
           filter: "tr",
           position: "right",
           width: 150,
           show: function (e) {
              //get current target row
              var currentRow = this.target().closest("tr");
              var grid = $("#grid").data("kendoGrid");
              //get current row dataItem
              var dataItem = grid.dataItem(currentRow);

              //pass the dataItem to the template
              var generatedTemplate = template(dataItem);
              //set the generated template to the content of the tooltip
              this.content.html(generatedTemplate);
          },
      }).data("kendoTooltip");
    }

    return {

        init: function () {
            initLoadBarcode();
            initImage();
            initToolTip();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd2.init();
});
