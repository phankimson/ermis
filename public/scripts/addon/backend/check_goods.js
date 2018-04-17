var Ermis = function () {
    var $kGrid = jQuery("#grid");
    var $export = '';var $import = '';  var a = []; var b;
    var data = [];
    var initGetColunm = function () {
        data = GetAllDataForm('#form-action');
        return data;
    };
    var initStatus = function (status) {
      if(status == 1){//
        jQuery(".load").on("click", initLoad);
        jQuery('.save,.cancel,.import,.export').addClass('disabled');
        jQuery('.save,.cancel,.import,.export').off('click');
        jQuery('.load').removeClass('disabled');
      }else if(status == 2){
        jQuery('.save,.cancel,.import,.export').removeClass('disabled');
        jQuery(".save").on("click", initSave);
        jQuery(".cancel").on("click", initCancel);
        jQuery(".import").on("click", initImport);
        jQuery(".export").on("click", initExport);
        jQuery('.load').off('click');
        jQuery('.load').addClass('disabled');
        $kGrid.removeAttr('style');
      }else if(status == 3){
        jQuery('.save,.cancel,.import,.load').addClass('disabled');
        jQuery('.export').removeClass('disabled');
        jQuery(".save").off("click");
        jQuery(".cancel").off("click");
        jQuery(".import").off("click");
        jQuery(".export").on("click", initExport);
        jQuery('.load').off('click');
        $kGrid.removeAttr('style');
      }
    }
    var initExport = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($export) {
                $export.data("kendoDialog").open();
            } else {
                initKendoUiDialog(1);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initImport = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($import) {
                $import.data("kendoDialog").open();
            } else {
                initKendoUiDialog(2);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initKendoUiUpload = function () {
        jQuery("#files").kendoUpload({ "multiple": false });
    };

    var initBindData = function(){
      if(localStorage.dataId){
      var dataId = localStorage.dataId;
      var postdata = { data: JSON.stringify(dataId)};
      RequestURLWaiting(Ermis.link+'-bind', 'json', postdata, function (result) {
          if (result.status === true) {
            var grid = $kGrid.data("kendoGrid");
            ds = new kendo.data.DataSource({ data: result.data, pageSize: 10 , schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
            grid.setDataSource(ds);
            jQuery('input[name="date"]').val(FormatDate(result.general.date))
            jQuery('select[name="stock"]').data('kendoDropDownList').value(result.general.inventory)
            initStatus(3);
          }else{
            kendo.alert(result.message);
          }
      }, true);
    }
  }

    var initKendoUiDialog = function (type) {
      if (type === 1) {
         var grid = $kGrid.data("kendoGrid");
          $export = $("#export").kendoDialog({
              width: "400px",
              title: "Export",
              closable: true,
              modal: true,
              actions: [
                  { text: "Export Excel", action: onExcel },
                  { text: "Export PDF", action: onPDF },
                  { text: "Close", primary: true }
              ]
          });
      } else {
          $import = $("#import").kendoDialog({
              width: "400px",
              title: "Import",
              closable: true,
              content: '<form id="import-form" enctype="multipart/form-data" role="form" method="post"><input name="files" id="files" type="file" /></form>',
              modal: true,
              actions: [
                  { text: 'Import File', action: onImportFile },
                  { text: 'Download File', action: onDownloadFile },
                  { text: 'Close', primary: true }
              ]
          });
          initKendoUiUpload();
      }

            function onImportFile(e) {
                var a = jQuery('#import-form').get(0);
                var FileUpload = new FormData(a); // XXX: Neex AJAX2
                // You could show a loading image for example...
                RequestFileURLWaiting(Ermis.link+'-import', 'post', FileUpload, function (results) {
                    if (results.status === true) {
                      jQuery.each(results.data, function (k, i) {
                      var grid = $kGrid.data("kendoGrid");
                      var dataItem  = grid.dataSource.get(i.id);
                      if(dataItem){
                        var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
                        var selectedItem = grid.dataItem(row);
                        if(selectedItem){
                           selectedItem.set("check",  dataItem.check + i.check);
                         }else{
                           grid.dataSource.insert(0 , i);
                         }
                        }
                      });
                    }
                    jQuery(".k-upload-files.k-reset").find("li").remove();
                    kendo.alert(results.message);
                }, true);
            }
        function onDownloadFile(e) {
            var url = Ermis.link+'-DownloadExcel';
            window.open(url);
        }
        function onExcel(e) {
          grid.setOptions({
              excel: {
                  allPages: true
              }
            })
            grid.saveAsExcel();
        }
        function onPDF(e) {
          grid.setOptions({
            pdf: {
                 allPages: true,
                 repeatHeaders: true
             },
           });
            grid.saveAsPDF();
        }
    };

    calculatePriceAggregate = function () {
        var grid = $kGrid.data("kendoGrid");
        var data = grid.dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].check > 0 && data[i].price > 0) {
                var check = data[i].price.toString().indexOf(",");
                if (data[i].price !== 0 && check !== -1) {
                    data[i].price = data[i].price.replace(/\,/g, "");
                }
                total += data[i].check * data[i].price;
            }
        }
        return kendo.toString(total, 'n0');
    };

    calculatePriceAggregateDf = function () {
        var grid = $kGrid.data("kendoGrid");
        var data = grid.dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
                total += data[i].check - data[i].balance  ;
        }
        return kendo.toString(total, 'n0');
    };

    calculatePriceAggregateDfa = function () {
        var grid = $kGrid.data("kendoGrid");
        var data = grid.dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].check > 0 && data[i].price > 0) {
                var check = data[i].price.toString().indexOf(",");
                if (data[i].price !== 0 && check !== -1) {
                    data[i].price = data[i].price.replace(/\,/g, "");
                }
                total += data[i].check * data[i].price - data[i].balance_amount;
            }else{
                total += -data[i].balance_amount;
            }
        }
        return kendo.toString(total, 'n0');
    };

    var initKendoGrid = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data,
            batch: false,
            pageSize: 8,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field
                }
            },
              aggregate: Ermis.aggregate,
        });
        var grid = $kGrid.kendoGrid({
            dataSource: dataSource,
            save: function (data) {
                var grid = this;
                setTimeout(function () {
                    grid.refresh();
                });
            },
            editable: false,
            filterable: true,
            pageable: true,
            columns: Ermis.columns
        });

        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });

    };

    var initMonthDate = function () {
        $(".month-picker").kendoDatePicker({

            // display month and year in the input
            format: "dd/MM/yyyy",

            // specifies that DateInput is used for masking the input element
            dateInput: true
        });
    }

    var initLoad = function () {
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
        var postdata = { data: JSON.stringify(obj)};
        RequestURLWaiting(Ermis.link+'-load', 'json', postdata, function (result) {
            if (result.status === true) {
              var grid = $kGrid.data("kendoGrid");
              ds = new kendo.data.DataSource({ data: result.data, pageSize: 10 , schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
              grid.setDataSource(ds);
              initStatus(2);
            }else{
              kendo.alert(result.message);
            }
        }, true);
    }

    calculateAmount = function (quantity, price) {
        var check = price.toString().indexOf(",");
        if (price !== 0 && check !== -1) {
            price = price.replace(/\,/g, "");
        }
        amount = quantity * price;
        return kendo.toString(amount, 'n0');
    };

    calculateDiffirent = function (balance, check) {
        dif = check - balance ;
        return kendo.toString(dif, 'n0');
    };

    calculateDiffirentAmount = function (balance_amount, check , price) {
        dif = (check * price) - balance_amount;
        return kendo.toString(dif, 'n0');
    };


    var initSave = function () {
        var obj = {};
        obj.detail = $kGrid.data("kendoGrid").dataSource.data();
        obj.balance_total = ConvertNumber(jQuery("#balance_total").html());
        obj.balance_amount_total = ConvertNumber(jQuery("#balance_amount_total").html());
        obj.check_total = ConvertNumber(jQuery("#check_total").html());
        obj.check_amount_total = ConvertNumber(jQuery("#check_amount_total").html());
        obj.difference_total = ConvertNumber(jQuery("#difference_total").html());
        obj.difference_amount_total = ConvertNumber(jQuery("#difference_amount_total").html());
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
        var postdata = { data: JSON.stringify(obj)};
        RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
              kendo.alert(result.message);
        }, true);
    }
    var initCancel = function () {
      var grid = $kGrid.data("kendoGrid");
      ds = new kendo.data.DataSource({ data: [], pageSize: 10 , schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
      grid.setDataSource(ds);
      $kGrid.attr('style','display :none');
      initStatus(1);
    }
    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains"
        });

    };

    getItemName = function (ID, data, field) {
        var value = '';
        b = field;
        a[b] = data;
        if (ID > 0 || ID != "") {
            var result = $.grep(eval(a[b]), function (n, i) {
                return n.id === ID;
            });
            if (result.length > 0) {
                value = result[0].code;
            }
        } else {
            value = '----SELECT-----';
        }
        return value;
    };


    return {
        //main function to initiate the module
        init: function () {
            initBindData();
            initKendoUiDropList();
            //initGrid();
            initStatus(1);
            initMonthDate();
            initGetColunm();
            initKendoGrid();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
