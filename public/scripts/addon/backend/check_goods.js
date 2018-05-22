var Ermis = function () {
    var $kGrid = jQuery("#grid");
    var $kGridImport = jQuery('#grid_import');
    var myWindow = jQuery("#form-window-import");
    var $kWindow = '';
    var $export = '';var $import = '';  var a = []; var b;
    var data = [];
    var initGetColunm = function () {
        data = GetAllDataForm('#form-action');
        return data;
    };
    var initStatus = function (status) {
      if(status == 1){//
        jQuery(".load").on("click", initLoad);
        jQuery('.save,.cancel,.export,.processed').addClass('disabled');
        jQuery('.save,.cancel,.export,.processed').off('click');
        jQuery('.import').removeClass('disabled');
        jQuery(".import").on("click", initImport);
        jQuery(".cancel-window").on("click", initClose);
        jQuery('.load').removeClass('disabled');
      }else if(status == 2){
        jQuery('.import').addClass('disabled');
        jQuery('.import').off('click');
        jQuery('.save,.cancel,.export,.processed').removeClass('disabled');
        jQuery(".save").on("click", initSave);
        jQuery(".cancel").on("click", initCancel);
        jQuery(".import").on("click", initImport);
        jQuery(".export").on("click", initExport);
        jQuery(".processed").on("click", initFilterForm);
        jQuery('.load').off('click');
        jQuery('.load').addClass('disabled');
        $kGrid.removeAttr('style');
      }else if(status == 3){
        jQuery('.save,.cancel,.load,.processed').addClass('disabled');
        jQuery('.import').removeClass('disabled');
        jQuery('.export').removeClass('disabled');
        jQuery(".save").off("click");
        jQuery(".cancel").off("click");
        jQuery(".import").off("click");
        jQuery(".export").on("click", initExport);
        jQuery(".import").on("click", initImport);
        jQuery('.load').off('click');
        $kGrid.removeAttr('style');
      }
    }

    var initKendoUiDialogFilter = function () {
        $kWindow = myWindow.kendoWindow({
            width: "1000px",
            title: "",
            visible: false,
            actions: [
                "Pin",
                "Minimize",
                "Maximize",
                "Close"
            ],
            modal: true
        }).data("kendoWindow").center();
        $kWindow.title("Tìm kiếm import");
    };
    var initFilterForm = function () {
        $kWindow.open();
    };

    var initClose = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($kWindow.element.is(":hidden") === false) {
                $kWindow.close();
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initKendoStartEndDatePicker = function () {
      var todayDate = kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy');
      function startChange() {
            var startDate = start.value(),
                endDate = end.value();
                if (startDate) {
                startDate = new Date(startDate);
                startDate.setDate(startDate.getDate());
                end.min(startDate);
              } else if (endDate) {
                  start.max(new Date(endDate));
              } else {
                endDate = new Date();
                start.max(endDate);
                  end.min(endDate);
            }
      }

            function endChange() {
            var endDate = end.value(),
                startDate = start.value();

                if (endDate) {
                endDate = new Date(endDate);
                endDate.setDate(endDate.getDate());
                start.max(endDate);
              } else if (startDate) {
                end.min(new Date(startDate));
              } else {
                endDate = new Date();
                start.max(endDate);
                end.min(endDate);
                  }
              }
        var start = jQuery("#start").kendoDatePicker({
            change: startChange,
            format: "dd/MM/yyyy"
          }).data("kendoDatePicker");

        var end = jQuery("#end").kendoDatePicker({
            change: endChange,
            format: "dd/MM/yyyy"
          }).data("kendoDatePicker");
          start.max(end.value());
          end.min(start.value());

          jQuery("#fast_date").kendoDropDownList({
              filter: "contains",
              select: onSelect
          });
          function onSelect(e) {
              if (e.item) {
                  var dataItem = this.dataItem(e.item);
                  var year = ''; var result = '';
                  if (dataItem.value === "today") {
                      end.value(new Date);
                      start.value(new Date);
                  } else if (dataItem.value === "this_week") {
                      end.value(moment().endOf('week').format("DD/MM/YYYY"));
                      start.value(moment().startOf('week').format("DD/MM/YYYY"));
                  } else if (dataItem.value === "this_month") {
                      end.value(moment().endOf('month').format("DD/MM/YYYY"));
                      start.value(moment().startOf('month').format("DD/MM/YYYY"));
                  } else if (dataItem.value === "this_quarter") {
                      end.value(moment().endOf('quarter').format("DD/MM/YYYY"));
                      start.value(moment().startOf('quarter').format("DD/MM/YYYY"));
                  } else if (dataItem.value === "this_year") {
                      end.value(moment().endOf('year').format("DD/MM/YYYY"));
                      start.value(moment().startOf('year').format("DD/MM/YYYY"));
                  } else if (dataItem.value === "january") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "01");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "february") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "02");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "march") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "03");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "april") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "04");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "may") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "05");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "june") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "06");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "july") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "07");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "august") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "08");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "september") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "09");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "october") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "10");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "november") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "11");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "december") {
                      year = moment().format('YYYY');
                      result = getMonthDateRange(year, "12");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "the_1st_quarter") {
                      year = moment().format('YYYY');
                      result = getQuarterDateRange(year, "01");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "the_2nd_quarter") {
                      year = moment().format('YYYY');
                      result = getQuarterDateRange(year, "04");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "the_3rd_quarter") {
                      year = moment().format('YYYY');
                      result = getQuarterDateRange(year, "07");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  } else if (dataItem.value === "the_4th_quarter") {
                      year = moment().format('YYYY');
                      result = getQuarterDateRange(year, "10");
                      end.value(result.end.format("DD/MM/YYYY"));
                      start.value(result.start.format("DD/MM/YYYY"));
                  }
              }
          }
    };

    var initGetDataImport = function () {
      jQuery('#search_import').on('click', function () {
          var obj = {};
          var filter = GetAllDataForm('#form-window-import', 2);
          jQuery.each(filter.columns, function (k, col) {
              if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                  obj[col.field] = jQuery('#form-window-import').find('input[name="' + col.field + '"]').val();
              } else if (col.key === 'select' && jQuery('#form-window-barcode').find('select[name = ' + col.field + ']').hasClass("droplist")) {
                  obj[col.field] = jQuery('#form-window-import').find('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
              } else if (col.key === 'select' && jQuery('#form-window-barcode').find('select[name = ' + col.field + ']').hasClass("multiselect")) {
                  var arr = jQuery('#form-window-import').find('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                  obj[col.field] = arr.join();
              } else if (col.key === 'textarea') {
                  obj[col.field] = jQuery('#form-window-import').find('textarea[name="' + col.field + '"]').val();
              }  else if (col.key === 'checkbox') {
                  if (jQuery('#form-window-import').find('input[name="' + col.field + '"]').parent().hasClass('checked')) {
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
                  obj[col.field] = jQuery('#form-window-import').find('input[name="' + col.field + '"]:checked').val();
              }
          });
          var postdata = { data: JSON.stringify(obj) };
          RequestURLWaiting(Ermis.link+'-get', 'json', postdata, function (result) {
              if (result.status === true) {
                  var grid = $kGridImport.data("kendoGrid");
                  var ds = new kendo.data.DataSource({ data: result.data , pageSize: 6 });
                  grid.setDataSource(ds);
                  grid.dataSource.page(1);
              }else{
                kendo.alert(result.message);
              }
          }, true);
      });
    };

    var initKendoGridImport = function () {
       var grid = $kGridImport.kendoGrid({
            dataSource: {
                data: []
            },
            selectable: "multiple, row",
            height: jQuery(window).height() * 0.5,
            sortable: true,
            pageable: true,
            filterable: true,
            columns: Ermis.columns_import
       }).data("kendoGrid");
       grid.thead.kendoTooltip({
         filter: "th",
         content: function (e) {
             var target = e.target; // element for which the tooltip is shown
             return $(target).text();
         }
     });

       grid.table.on("click", ".k-checkbox", selectRow);
        //bind click event to the checkbox
        //grid.table.on("click", ".k-checkbox" , selectRow);
        jQuery('#header-chb-b').change(function(ev){
            var checked = ev.target.checked;
            $kGridImport.find('.k-checkbox').not("#header-chb-b").each(function (idx, item) {
                if(checked){
                    if(!$(item).closest('tr').is('.k-state-selected')){
                        $(item).click();
                    }
                } else {
                    if($(item).closest('tr').is('.k-state-selected')){
                        $(item).click();
                    }
                }
            });

        });

        jQuery(".choose_import").bind("click", function () {
            var postdata = { data: JSON.stringify(checkedData) };
          RequestURLWaiting(Ermis.link+'-processed', 'json', postdata, function (result) {
              if (result.status === true) {
                jQuery.each(result.data, function (k, i) {
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
                  }else{
                    grid.dataSource.insert(0 , i);
                  }
                });
              }else{
                  kendo.alert(result.message);
              }
            }, true);
            $kWindow.close();
            checkedData = [];
        });

        var checkedData = [];

        //on click of the checkbox:
        function selectRow() {
            var checked = this.checked,
                row = $(this).closest("tr"),
                grid = $kGridImport.data("kendoGrid"),
                dataItem = grid.dataItem(row);
            if (checked) {
               checkedData.push(dataItem.id)
                //-select the row
                row.addClass("k-state-selected");
            } else {
                checkedData = checkedData.filter(x => x.id != dataItem.id)
                //-remove selection
                row.removeClass("k-state-selected");
            }
        }


    };



    var initChange = function(e){
      $(".droplist").on("change", function(){
        initStatus(1);
        $kGrid.data('kendoGrid').dataSource.data([]);
      });

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
                        kendo.alert(results.message);
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


    var initSave = function (e) {
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
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
      jQuerylink.data('lockedAt', +new Date());
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
            initKendoUiDialogFilter();
            initKendoUiDropList();
            initKendoStartEndDatePicker();
            initGetDataImport();
            initKendoGridImport();
            //initGrid();
            initStatus(1);
            initMonthDate();
            initGetColunm();
            initKendoGrid();
            initChange();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
