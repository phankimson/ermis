var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var $kGridList = jQuery('#list');
    var $kGridItem = jQuery('#grid_item');
    var myWindow = jQuery("#form-window-item");
    var $kWindow = '';
    var end; var start;
    var data = [];
    var dataSource = '';
    var $table = jQuery('#table');


    var initGetColunm = function () {
        data = GetAllDataForm('#form-search');
        return data;
    };

    var initHideShow = function () {
        jQuery('.btn-hide').on('click', function () {
            jQuery('#btn-show').show(1000);
            jQuery('#form-search').hide(1000);
        });
        jQuery('.btn-show').on('click', function () {
            jQuery('#btn-show').hide(1000);
            jQuery('#form-search').show(1000);
        });
    };
    var initStatus = function(){
      jQuery('.choose').on('click', initChoose);
      jQuery('.cancel-window').on('click', initClose);
      jQuery('.search_item').on('click',initFilterForm);
      jQuery('#search_item').on('click',initGetDataItem);
    }

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

    var initGetDataItem = function () {
          var obj = {};
          var filter = GetAllDataForm('#form-window-item', 2);
          jQuery.each(filter.columns, function (k, col) {
              if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                  obj[col.field] = myWindow.find('input[name="' + col.field + '"]').val().trim();
              } else if (col.key === 'select' && myWindow.find('select[name = ' + col.field + ']').hasClass("droplist")) {
                  obj[col.field] = myWindow.find('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
              } else if (col.key === 'select' && myWindow.find('select[name = ' + col.field + ']').hasClass("multiselect")) {
                  var arr = myWindow.find('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                  obj[col.field] = arr.join();
              } else if (col.key === 'textarea') {
                  obj[col.field] = myWindow.find('textarea[name="' + col.field + '"]').val();
              }  else if (col.key === 'checkbox') {
                  if (myWindow.find('input[name="' + col.field + '"]').parent().hasClass('checked')) {
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
                  obj[col.field] = myWindow.find('input[name="' + col.field + '"]:checked').val();
              }
          });
          var postdata = { data: JSON.stringify(obj) };
          RequestURLWaiting(Ermis.link+'-load', 'json', postdata, function (result) {
              if (result.status === true) {
                  var grid = $kGridItem.data("kendoGrid");
                  var ds = new kendo.data.DataSource({ data: result.data , pageSize: 6 });
                  grid.setDataSource(ds);
                  grid.dataSource.page(1);
              }else{
                kendo.alert(result.message);
              }
          }, true);
    };

    var initKendoUiDialog = function () {
      if(myWindow.length>0){
        $kWindow = myWindow.kendoWindow({
            width: "600px",
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

        $kWindow.title("Tìm kiếm hàng hóa");
      }
    };
    var initFilterForm = function () {
        $kWindow.open();
    };


    var initKendoGridItem = function () {
      if($kGridItem.length>0){
        var grid = $kGridItem.kendoGrid({
              dataSource: {
                  data: []
              },
              selectable: "row",
              height: jQuery(window).height() * 0.5,
              sortable: true,
              pageable: true,
              filterable: true,
              columns: Ermis.columns_item,
              dataBound: function () {
                  var rows = this.items();
                  $(rows).each(function () {
                      var index = $(this).index() + 1;
                      var rowLabel = $(this).find(".row-number");
                      $(rowLabel).html(index);
                  });
              }
          });
          grid.data("kendoGrid").thead.kendoTooltip({
            filter: "th",
            content: function (e) {
                var target = e.target; // element for which the tooltip is shown
                return $(target).text();
            }
        });
          $kGridItem.dblclick(function (e) {
              initChoose(e);
          });
      }

    };

    var initChoose = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($kGridItem.find('tr.k-state-selected').length > 0) {
                var grid = $kGridItem.data("kendoGrid");
                var dataItem = grid.dataItem($kGridItem.find('tr.k-state-selected'));
                $kWindow.close();
                jQuery('input[name=item_name]').val(dataItem.code+' | '+ dataItem.name + ' | '+dataItem.size )
                jQuery('input[name=item]').val(dataItem.id)
            } else {
                kendo.alert(transText.please_select_line_choose);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };


    var initKendoUiContextMenu = function () {
        jQuery("#context-menu").kendoContextMenu({
            target: ".md-card-content"
        });
    };

    var initUpdate = function (e) {
      if (Ermis.per.e) {
        jQuery('.update').on('click', function () {
            var obj = {};
            jQuery.each(data.columns, function (k, col) {
                if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                    if (jQuery('input[name="' + col.field + '"]').hasClass('number-price') || jQuery('input[name="' + col.field + '"]').hasClass('number')) {
                        obj[col.field] = jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
                    } else {
                        obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
                        if (col.type === 'date') {
                            obj[col.field] = formatDateDefault(obj[col.field]);
                        } else if (col.type === 'datetime') {
                            obj[col.field] = formatDateTimeDefault(obj[col.field]);
                        }
                    }

                } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                    obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
                } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                    var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                    obj[col.field] = arr.join();
                } else if (col.key === 'textarea') {
                    obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val();
                }  else if (col.key === 'checkbox') {
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
                }
            });
            var postdata = { data: JSON.stringify(obj) };
            RequestURLWaiting(Ermis.link+'-update', 'json', postdata, function (result) {
                if(result.status == true){
                  jQuery('#notification').EPosMessage('success', result.message);
                }else{
                  jQuery('#notification').EPosMessage('error', result.message);
                }
            }, true);
        })
      } else {
          kendo.alert(transText.you_not_permission_edit);
      }
    };


    var initSearchData = function (e) {
        jQuery('.get_data').on('click', function () {
            var obj = {};
            jQuery.each(data.columns, function (k, col) {
                if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                    if (jQuery('input[name="' + col.field + '"]').hasClass('number-price') || jQuery('input[name="' + col.field + '"]').hasClass('number')) {
                        obj[col.field] = jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
                    } else {
                        obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
                        if (col.type === 'date') {
                            obj[col.field] = formatDateDefault(obj[col.field]);
                        } else if (col.type === 'datetime') {
                            obj[col.field] = formatDateTimeDefault(obj[col.field]);
                        }
                    }

                } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                    obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
                } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                    var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                    obj[col.field] = arr.join();
                } else if (col.key === 'textarea') {
                    obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val();
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
                }else if (col.key === 'radio') {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
                }
            });
            var postdata = { data: JSON.stringify(obj) };
            RequestURLWaiting(Ermis.link+'-Get', 'json', postdata, function (result) {
                if (result.status === true) {
                    if (jQuery('#grid').attr('id') === 'grid') {
                        dataSource = new kendo.data.DataSource({ data: result.data, aggregate: Ermis.aggregate, schema: { model: { fields: Ermis.field } } });
                        var grid = $kGrid.data("kendoGrid");
                        grid.setDataSource(dataSource);
                        $kGrid.show(1000);
                    } else if (jQuery('#list').attr('id') === 'list') {
                        dataSource = new kendo.data.TreeListDataSource({
                            data: result.data,
                            schema: {
                                model: {
                                    id: "id",
                                    parentId: "parent_id",
                                    fields: Ermis.field,
                                    expanded: true
                                },

                            }
                        });
                        var grid_list = $kGridList.data("kendoTreeList");
                        grid_list.setDataSource(dataSource);
                        $kGridList.show(1000);
                    }
                    jQuery('#report').hide(1000);
                }else{
                  kendo.alert(result.message);
                }
            }, true);
        })

    };

    var initKendoStartDatePicker = function () {
        start = jQuery("#start").kendoDatePicker({
            change: startChange,
            format: "dd/MM/yyyy"
        }).data("kendoDatePicker");
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
    };
    var initKendoEndDatePicker = function () {
        end = jQuery("#end").kendoDatePicker({
            change: endChange,
            format: "dd/MM/yyyy"
        }).data("kendoDatePicker");
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
    };
    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains"
        });
    };

    var initMonthDate = function () {
        $(".month-picker").kendoDatePicker({
            // defines the start view
            start: "year",

            // defines when the calendar should return date
            depth: "year",

            // display month and year in the input
            format: "MM/yyyy",

            // specifies that DateInput is used for masking the input element
            dateInput: true
        });
    };


    var initKendoItemDropList = function(){
      jQuery("#item").kendoDropDownList({
        template: '#= barcode # | #= name # | #= size #',
        dataTextField: "barcode",
        dataValueField: "id",
        virtual: {
            itemHeight: 26,
            valueMapper: function(options) {
               options.success([options.value || 0]); //return the value <-> item index mapping;
             }
        },
        height: 520,
        dataSource: {
            data : Ermis.item,
            pageSize: 80,
            serverPaging: true,
            serverFiltering: true
        },
          filter: "startswith"
      });


        //This is a helper method that serializes values into a understandable format for the server.
        //This method is not obligatory to use. Instead, you need to send the value in a format that is understandable for the server.
        function convertValues(value) {
            var data = {};

            value = $.isArray(value) ? value : [value];

            for (var idx = 0; idx < value.length; idx++) {
                data["values[" + idx + "]"] = value[idx];
            }

            return data;
        }
    }

    var initKendoButton = function () {
        jQuery("#search_grid").kendoButton();
    };
    calculateAmount = function (quantity, price) {
        if (price !== 0) {
            price = price.replace(",", "");
        }
        amount = quantity * price;
        return kendo.toString(amount, 'n0');
    };
    calculatePriceAggregate = function () {
        var data = dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].quantity > 0) {
                var a = data[i].price.replace(",", "");
                total += data[i].quantity * a;
            }
        }
        return kendo.toString(total, 'n0');
    };
    calculateNumber = function () {
        var data = dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].quantity > 0) {
                total += parseInt(data[i].quantity);
            }
        }
        return kendo.toString(total, 'n0');
    };

    return {

        init: function () {
            initKendoUiDialog();
            initStatus();
            initMonthDate();
            initKendoUiContextMenu();
            initKendoStartDatePicker();
            initKendoEndDatePicker();
            initKendoUiDropList();
            initKendoItemDropList();
            initKendoGridItem();
            initGetColunm();
            initHideShow();
            initSearchData();
            initUpdate();

        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
