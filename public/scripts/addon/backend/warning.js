var Warning = function () {
  var initKendoUiDatePicker = function () {
      jQuery(".date").kendoDatePicker({
          format: "dd/MM/yyyy"
      });
  };

  var bindData = function(a){
      jQuery.each(a, function (k, d) {
      var copy = jQuery('.uk-grid').find('.hidden').clone(true);
      copy.removeClass('hidden');
      copy.attr('data-uk-filter','filter-'+d.inventory);
      copy.find('.heading_c').text(d.inventory_name);
      copy.find('.content').text(d.content);
      jQuery(".uk-grid").append(copy);
    });
  }

  var initChangeDate = function(){
    var i = 0
      jQuery('.date').on('change',function(){
      var search = jQuery(this).val();
      var postdata = { data: JSON.stringify(search) };
      RequestURLWaiting(Warning.link+'-get', 'json', postdata, function (result) {
          if (result.status === true) {
            if(i%2==0){
                jQuery('.uk-grid').find('.item').not('.hidden').remove();
            }
              bindData(result.data);
          }else{
            kendo.alert(result.message);
          }
          i++
      }, true);
    })
  }


    var initStatus = function (e) {

    };
    return {
        //main function to initiate the module
        init: function () {
            initKendoUiDatePicker();
            initChangeDate();
            initStatus();
        }
    };
}();

jQuery(document).ready(function () {
    Warning.init();
});
