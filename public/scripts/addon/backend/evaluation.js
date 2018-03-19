var Ermis = function () {
    var data = [];
    var initGetColunm = function () {
        data = GetAllDataForm('#form-action');
        return data;
    };
    var bindData = function(v,f){
      jQuery(".uk-table tbody").find('tr').not('.load').remove();
      jQuery.each(v, function (k, d) {
        var search = true
        jQuery.each(f, function (r, x) {
        if(d.retail>x.quantity && search == true && d.quantity > x.balance ){
          var copy = jQuery(".uk-table tbody").find('tr:eq(0)').clone(true);
          copy.removeClass('hidden').removeClass('load');
          copy.attr('style','background-color:'+x.color+'; color :white');
          copy.find('td').eq(0).text(d.barcode);
          copy.find('td').eq(1).find('a').text(d.name);
          copy.find('td').eq(2).text(d.unit);
          copy.find('td').eq(3).text(d.size);
          copy.find('td').eq(4).text(FormatNumber(d.price));
          copy.find('td').eq(5).text(FormatNumber(d.purchase_price));
          copy.find('td').eq(6).text(d.quantity);
          copy.find('td').eq(7).text(d.retail);
          copy.find('td').eq(8).text(d.wholesale);
          copy.find('td').eq(9).text(d.description);
          jQuery(".uk-table").find('tbody').append(copy);
          search == false
          return false
        }else if(search == true){
          var copy = jQuery(".uk-table tbody").find('tr:eq(0)').clone(true);
          copy.removeClass('hidden').removeClass('load');
          copy.find('td').eq(0).text(d.barcode);
          copy.find('td').eq(1).find('a').text(d.name);
          copy.find('td').eq(2).text(d.unit);
          copy.find('td').eq(3).text(d.size);
          copy.find('td').eq(4).text(FormatNumber(d.price));
          copy.find('td').eq(5).text(FormatNumber(d.purchase_price));
          copy.find('td').eq(6).text(d.quantity);
          copy.find('td').eq(7).text(d.retail);
          copy.find('td').eq(8).text(d.wholesale);
          copy.find('td').eq(9).text(d.description);
          jQuery(".uk-table").find('tbody').append(copy);
          search == false;
          return false
        }

           })
      })
    }
    var initPaging = function(){
      jQuery('[data-uk-pagination]').on('select.uk.pagination', function(e, pageIndex){
        var postdata = { data: JSON.stringify(pageIndex+1) };
        RequestURLWaiting(Ermis.link+'-page', 'json', postdata, function (result) {
            if (result.status === true) {
                bindData(result.data);
            } else {
                kendo.alert(result.message);
            }
        }, true);
    });
    }
    var initFilter = function(){
        var obj = {};
        jQuery.each(data.columns, function (k, col) {
          if(col.field != undefined){
            if (col.null === true && !jQuery('input[name="' + col.field + '"]').val()) {
                crit = false;
                return false;
            } else {
                crit = true;
            }

            if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                if (jQuery('input[name="' + col.field + '"]').hasClass('number-price') || jQuery('input[name="' + col.field + '"]').hasClass('number')) {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
                } else {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
                    if (col.type === 'date') {
                        obj[col.field] = formatDateDefault(obj[col.field]);
                    }
                }

            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                obj[col.field] = arr.join();
            } else if (col.key === 'textarea') {
                obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val().trim();
            } else if (col.key === 'checkbox') {
                if (jQuery('input[name="' + col.field + '"]').parent().hasClass('checked')) {
                    if (col.type === 'boolean') {
                        obj[col.field] = true;
                    } else if (col.type === 'number'){
                        obj[col.field] = 1;
                    }else {
                        obj[col.field] = '1';
                    }
                } else {
                    if (col.type === 'boolean') {
                        obj[col.field] = false;
                    }else if (col.type === 'number'){
                        obj[col.field] =  0;
                    } else {
                        obj[col.field] = '0';
                    }
                }
            } else if (col.key === 'radio') {
                obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
            }else if (col.key === 'select' && jQuery('select[name="' + col.field + '"]').hasClass('selectized')) {
                  obj[col.field]  = jQuery('#'+col.field).val()
            }
          }
        });
        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-filter', 'json', postdata, function (result) {
            if (result.status === true) {
                bindData(result.data,result.warning);
            } else {
                kendo.alert(result.message);
            }
        }, true);
    }


    var initStatus = function(){
      jQuery('#filter').on("click",initFilter);
    }

    return {
        //main function to initiate the module
        init: function () {
          initGetColunm();
          initPaging();
          initStatus();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
