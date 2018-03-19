var Ermis = function () {
    var data = [];
    var initGetColunm = function () {
        data = GetAllDataForm('#form-action');
        return data;
    };
    var bindData = function(v){
      jQuery(".uk-table tbody").find('tr').not('.load').remove();
      jQuery.each(v, function (k, d) {
        var copy = jQuery(".uk-table tbody").find('tr:eq(0)').clone(true);
        copy.removeClass('hidden').removeClass('load');
      if(d.type == 1){
        copy.find('td').eq(0).text(transText.receipt);
      }else if(d.type == 2){
        copy.find('td').eq(0).text(transText.issue);
      }else if(d.type == 3){
        copy.find('td').eq(0).text(transText.transfer);
      }else if(d.type == 4){
        copy.find('td').eq(0).text(transText.wholesale);
      }else if(d.type == 5){
        copy.find('td').eq(0).text(transText.sale);
      }else if(d.type == 6){
        copy.find('td').eq(0).text(transText.return);
      }else if(d.type == 7){
        copy.find('td').eq(0).text(transText.receipt_cash);
      }else{
        copy.find('td').eq(0).text('');
      }
        copy.find('td').eq(1).text(moment(d.date_voucher, "YYYY-MM-DD").add('days', 1).format('DD/MM/YYYY'));
        copy.find('td').eq(2).text(d.voucher);
        copy.find('td').eq(3).find('a').text(d.description);
        copy.find('td').eq(4).text(d.inventory_receipt);
        copy.find('td').eq(5).text(d.inventory_issue);
        copy.find('td').eq(6).text(FormatNumber(d.total_number));
        copy.find('td').eq(7).text(FormatNumber(d.total_amount));
        if(d.status == 0){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-muted">'+transText.not_accepted+'</span>');
        }else if(d.status == 1){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-info">'+transText.accepted+'</span>');
        }else if(d.status == 2){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-success">'+transText.completed+'</span>');
        }
        if(d.active == 1){
          copy.find('td').eq(9).html('<i class="material-icons md-color-light-blue-600 md-24"></i>');
        }else if(d.active == 0){
          copy.find('td').eq(9).html('');
        }
         if(d.status == 0){
          copy.find('td').eq(10).find('a').removeClass("disabled").attr('data-id',data.id);
        }
          jQuery(".uk-table").find('tbody').append(copy);
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
                bindData(result.data);
            } else {
                kendo.alert(result.message);
            }
        }, true);
    }
  var initApproved = function(e){
      var $this = jQuery(e.currentTarget)
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
          if (Ermis.per.p) {
            var dataId = $this.attr('data-id');
              var postdata = { data: dataId};
              RequestURLWaiting(Ermis.link+'-status', 'json', postdata, function (result) {
                    if (result.status === true) {
                        $this.addClass('disabled');
                        $this.off("click");
                        $this.closest('tr').find('.uk-badge').removeClass('uk-badge-muted').addClass('uk-badge-info');
                        $this.closest('tr').find('.uk-badge').text(transText.accepted);
                      }else {
                          kendo.alert(result.message);
                      }
                }, true);
          } else {
              kendo.alert(transText.you_not_permission_approved);
          }
      }
      jQuerylink.data('lockedAt', +new Date());
    }
    var initApprovedAll = function(){
        if (Ermis.per.p) {
          jQuery('.approved').not('.disabled').each(function(i,item){
            jQuery(item).click();
          })
         }else {
            kendo.alert(transText.you_not_permission_approved);
        }
    }

    var initStatus = function(){
      jQuery('.approved.disabled').off("click");
      jQuery('.approved').on("click",initApproved);
      jQuery('#filter').on("click",initFilter);
      jQuery('#approved_all').on("click",initApprovedAll);
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
