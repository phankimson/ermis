var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var key = 'Alt+';
    var dataSource = '';
    var ds = '';
    var a = []; var b; var data = [];
    var status = 0;
    var voucher = '';
    var storedarrId = [];
    var index = 0;
    var currentIndex = 0;

    var initLoadData = function (dataId) {
        var postdata = { data: JSON.stringify(dataId) };
        RequestURLWaiting(Ermis.link+'-bind', 'json', postdata, function (result) {
            if (result.status === true && result.general) {
                jQuery.each(data.columns, function (k, col) {
                    if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                        if (col.type === 'date') {
                            jQuery('input[name="' + col.field + '"]').val(kendo.toString(kendo.parseDate(result.general[col.field]), 'dd/MM/yyyy'));
                        } else if (jQuery('input[name = ' + col.field + ']').hasClass("number-price") || jQuery('input[name = ' + col.field + ']').hasClass("number")) {
                            jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value(result.general[col.field]);
                        } else {
                            jQuery('input[name="' + col.field + '"]').val(result.general[col.field]);
                        }
                    } else if (col.key === 'select') {
                        if (result.general[col.field] === null) {
                            jQuery('select[name="' + col.field + '"]').data('kendoDropDownList').value("0");
                        } else {
                            jQuery('select[name="' + col.field + '"]').data('kendoDropDownList').value(result.general[col.field]);
                        }
                    } else if (col.key === 'checkbox') {
                        if (result.general[col.field] === "1" || result.general[col.field] === true || result.general[col.field] === 1 ) {
                            jQuery('input[name="' + col.field + '"]').parent().addClass('checked');
                        } else {
                            jQuery('input[name="' + col.field + '"]').parent().removeClass('checked');
                        }
                    } else if (col.key === 'textarea') {
                        jQuery('textarea[name="' + col.field + '"]').val(result.general[col.field]);
                    } else if (col.key === 'radio') {
                        jQuery('input[name="' + col.field + '"][value=' + result.general[col.field] + ']').attr("checked", "checked");
                    }
                });
                var grid = $kGrid.data("kendoGrid");
                ds = new kendo.data.DataSource({ data: result.detail, schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
                grid.setDataSource(ds);
                calculatePriceBind(result.detail);
                if(result.general.status == 1){
                    initStatus(3);
                }else{
                    initStatus(1);
                }
            } else {
                initStatus(4);
            }
        }, true);
    };

    var initBindData = function () {
        if (sessionStorage.dataId) {
            var dataId = sessionStorage.dataId;
            initLoadData(dataId);
        }
    };


    var initGetColunm = function () {
        data = GetAllDataForm('#form-action',2);
        return data;
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

    var initTabsTrip = function () {
        var ts = jQuery("#tabstrip");
        ts.kendoTabStrip();
        ts.find('ul').show();
    };
    var initScanBarcode = function($this){
      var obj = {};
      obj.value = jQuery($this).val();
      if(obj.value){
        obj.id = sessionStorage.dataId;
        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-scan', 'json', postdata, function (result) {
            if (result.status === true) {
              var i = result.data;
              var grid = $kGrid.data("kendoGrid");
              var dataItem  = grid.dataSource.get(i.id);
              if(dataItem){
                var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
                var selectedItem = grid.dataItem(row);
                if(dataItem.quantity_receipt < dataItem.quantity){
                  if(dataItem.quantity_receipt + 1 == dataItem.quantity){
                    row.find('.k-checkbox').click();
                  }
                    selectedItem.set("quantity_receipt",  dataItem.quantity_receipt + 1);
                }else{
                  kendo.alert(transText.quantity_receipt_alert);
                }
              }
              setTimeout(function() {
                jQuery($this).val("");
                jQuery($this).focus();
              }, 1);
            }else{
                kendo.alert(result.message);
            }
        }, true);
      }
    }

    var initKendoGrid = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data,
            aggregate: Ermis.aggregate,
            batch: true,
            pageSize: 20,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field
                }
            }
        });
       var kgrid =  $kGrid.kendoGrid({
            dataSource: dataSource,
            editable: {
                confirmation: false // the confirmation message for destroy command
            },
            height: jQuery(window).height() * 0.5,
            columns: Ermis.columns,
            navigatable: true
        }).data("kendoGrid");

        kgrid.thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
        });
               kgrid.table.on("click", ".k-checkbox", selectRow);
                //bind click event to the checkbox
                //grid.table.on("click", ".k-checkbox" , selectRow);
                jQuery('#header-chb-b').change(function(ev){
                    var ischecked = ev.target.checked;
                    $kGrid.find('.k-checkbox').not("#header-chb-b").each(function (idx, item) {
                      var row = $(item).closest("tr");
                      var dataItem = kgrid.dataItem(row);
                      if(ischecked){
                          if(dataItem.status != 2){
                              $(item).click();
                          }
                      } else {
                          if(dataItem.status == 2){
                              $(item).click();
                          }
                      }
                    });

                });
                //on click of the checkbox:
                function selectRow() {
                    var checked = this.checked,
                        row = $(this).closest("tr"),
                        grid = $kGrid.data("kendoGrid"),
                        dataItem = grid.dataItem(row);
                    if (checked) {
                        //-select the row
                        setTimeout(function() {
                       dataItem.set("quantity_receipt", dataItem.quantity);
                       dataItem.set("status", 2);
                       });
                    } else {
                        //-remove selection
                        setTimeout(function() {
                      dataItem.set("quantity_receipt", 0 );
                      dataItem.set("status", 1);
                       });
                       jQuery('#header-chb-b').removeAttr('checked')
                    }
                    checkSelectRow();
                }
                    jQuery("#barcode").on("blur",initScanBarcode)
    };
    function checkSelectRow(){
      var result = true;
        $kGrid.find('.k-checkbox').not("#header-chb-b").each(function (idx, item) {
          if($(item).is(':checked') === false){
            result = false;
            return false;
          }
        })
        if(result == true){
          jQuery('#header-chb-b').click();
        }
    }

    var initStatus = function (flag) {
        shortcut.remove(key + "S");
        shortcut.remove(key + "C");
        shortcut.remove(key + ".");
        shortcut.remove(key + ",");
        jQuery('.back,.forward,.print,.cancel,.save').addClass('disabled');
        jQuery('.back,.forward,.print-item,.cancel,.save').off('click');
        jQuery('input,textarea').not('.header_main_search_input').not('#files').not('.k-filter-menu input').addClass('disabled');
        jQuery(".droplist").addClass('disabled');
        jQuery('input:checkbox').parent().addClass('disabled');
        jQuery('.date-picker').addClass('disabled');
        if (flag === 1) {//STATUS = 2
            jQuery('.print,.back,.forward').removeClass('disabled');
            shortcut.add(key + ",", function (e) { initBack(e); });
            shortcut.add(key + ".", function (e) { initForward(e); });
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
            jQuery('#add-top-menu-detail-edit').show();
            jQuery('input,textarea').addClass('disabled');
            jQuery('.k-button').addClass('disabled');
            jQuery(".droplist").addClass('disabled');
            jQuery('input:checkbox').parent().addClass('disabled');
            jQuery('.date-picker,.month-picker').addClass('disabled');
            $kGrid.addClass('disabled');
            checkSelectRow();
        } else if (flag === 2) {//SAVE
            jQuery('.print,.back,.forward').removeClass('disabled');
            shortcut.add(key + ",", function (e) { initBack(e); });
            shortcut.add(key + ".", function (e) { initForward(e); });
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
            $kGrid.addClass('disabled');
        } else if (flag === 3) { //EDIT
            jQuery('#add-top-menu-detail-edit').show();
            jQuery('.cancel,.save').removeClass('disabled');
            jQuery('.cancel').on('click', initCancel);
            jQuery('.save').on('click', initSave);
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
            jQuery('input,textarea').removeClass('disabled');
            jQuery('.k-button').removeClass('disabled');
            jQuery(".droplist").removeClass('disabled');
            jQuery('input:checkbox').parent().removeClass('disabled');
            jQuery('.date-picker,.month-picker').removeClass('disabled');
            $kGrid.removeClass('disabled');
        } else if (flag === 4) { //CANCEL
            jQuery('.print,.back').removeClass('disabled');
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "E", function (e) { initEdit(e); });
            shortcut.add(key + ",", function (e) { initBack(e); });
            shortcut.add(key + ".", function (e) { initForward(e); });
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
            if (!sessionStorage.dataId) {
                jQuery('.print,.delete,.edit').addClass('disabled');
                jQuery('.print,.delete,.edit').off('click');
            }
            jQuery('input').not('[type=radio]').not(".date-picker,.month-picker,.voucher").val("");
            $kGrid.data('kendoGrid').dataSource.data([]);
            $kGrid.addClass('disabled');
        } else if (flag === 5) { //BIND
            jQuery('#add-top-menu-detail-edit').show();
            jQuery('.print,.back,.forward').removeClass('disabled');
            shortcut.add(key + ",", function (e) { initBack(e); });
            shortcut.add(key + ".", function (e) { initForward(e); });
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
        }
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

    var initKendoDatePicker = function () {
        jQuery(".date-picker").kendoDatePicker({
            format: "dd/MM/yyyy"
        }).data("kendoDatePicker");

    };

    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains"
        });
    };

    var initKendoButton = function () {
        jQuery("#search_grid").kendoButton();
    };

    var initSave = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                if (confirmed) {
                    var obj = {}; var crit = false;
                    obj.id = sessionStorage.dataId;
                    obj.detail = $kGrid.data("kendoGrid").dataSource.data();
                    obj.type = jQuery('#tabstrip').find('.k-state-active').attr("data-search");
                    obj.status = jQuery("#header-chb-b").is(':checked')? 2 : 1;
                    jQuery.each(data.columns, function (k, col) {
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
                        }else if (col.key === 'radio') {
                            obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
                        }
                    });
                    if (crit === true) {
                        if (obj.detail.length > 0) {
                            var postdata = { data: JSON.stringify(obj) };
                            RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
                                if (result.status === true) {
                                    initStatus(2);
                                }
                                kendo.alert(result.message);
                            }, true);
                        } else {
                            kendo.alert(transText.please_fill_form_detail);
                        }

                    } else {
                        kendo.alert(transText.please_fill_field);
                    }
                }
            });
        }
        jQuerylink.data('lockedAt', +new Date());
    };


    var initCancel = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                if (confirmed) {
                    if (sessionStorage.dataId) {
                        var dataId = sessionStorage.dataId;
                        initLoadData(dataId);
                        initStatus(5);
                    } else {
                        initStatus(4);
                    }
                }
            });
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initPrint = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            //$.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
            //    if (confirmed) {
                    var obj = {};
                    obj.id = sessionStorage.dataId;
                    obj.voucher = jQuery(this).attr('data-id');
                        var postdata = { data: JSON.stringify(obj) };
                        RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
                            if (result.status === true) {
                                var decoded = $("<div/>").html(result.print_content).text();
                                if (result.detail_content) {
                                    decoded = decoded.replace('<tr class="detail_content"></tr>', result.detail_content);
                                }else if(result.section_content){
                                    decoded = decoded.replace('<div class="section_content"></div>', result.section_content);
                                }
                                PrintForm(jQuery('#print'), decoded);
                                jQuery('#print').html("");
                            }else{
                              kendo.alert(result.message);
                            }
                        }, true);

        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initGetStoredArrId = function () {
        if (sessionStorage.arrId) {
            storedarrId = JSON.parse(sessionStorage.arrId);
            return storedarrId;
        }
    };
    var initBack = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            //if (sessionStorage.current > 0) {
                index =  index - 1;
                var dataId = getAtIndex(index);
                sessionStorage.dataId = dataId;
                initLoadData(dataId);
          //  } else {
          //      jQuery('.back').addClass('disabled');
          //  }
          //  jQuery('.forward').removeClass('disabled');
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initForward = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
          //  if (sessionStorage.current < storedarrId.length-1) {
            index =  index + 1;
            var dataId = getAtIndex(index);
            sessionStorage.dataId = dataId;
            initLoadData(dataId);
          //  } else {
          //    jQuery('.forward').addClass('disabled');
          //  }
          //  jQuery('.back').removeClass('disabled');
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    getAtIndex = function(i) {
     if (i === 0) {
       return storedarrId[currentIndex];
     } else if (i < 0) {
       return storedarrId[-(currentIndex + storedarrId.length + i) % storedarrId.length];
     } else if (i > 0) {
       return storedarrId[(currentIndex + i) % storedarrId.length];
     }
   }

    var initKeyCode = function () {
        jQuery(document).keyup(function (e) {
            var grid = $kGrid.data("kendoGrid");
            $kGrid.find(" tbody tr").removeClass("k-state-selected");
            if (e.keyCode === 13 && !$kGrid.hasClass('disabled')) {
              if(e.target.id == "barcode"){
                initScanBarcode(e.target);
              }else{
                grid.addRow();
              }
            } else if (e.keyCode === 27 && !$kGrid.hasClass('disabled')) {
                grid.cancelChanges();
            }
        });
    };
    QuantityEditor = function(container, options){
      // create an input element
              var input = $("<input name='" + options.field + "'/>");
              // append it to the container
              input.appendTo(container);
              // initialize a Kendo UI numeric text box and set max value
              input.kendoNumericTextBox({
                  max: options.model.quantity,
                  min: 0
              });
              input.on("blur",function(){
                if(options.model.quantity == options.model.quantity_receipt){
                  var checkbox = input.closest("tr").find('.k-checkbox');
                  checkbox.click()
                }
              })
    }

    QREditable = function(dataItem){
      return dataItem.quantity_receipt < dataItem.quantity;
    }

    calculatePriceAggregate = function () {

        var grid = $kGrid.data("kendoGrid");
        var data = grid.dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
          var check = data[i].price.toString().indexOf(",");
          if (data[i].price !== 0 && check !== -1) {
              data[i].price = data[i].price.replace(/\,/g, "");
          }
          var check = data[i].purchase_price.toString().indexOf(",");
          if (data[i].purchase_price !== 0 && check !== -1) {
              data[i].purchase_price = data[i].purchase_price.replace(/\,/g, "");
          }
          var a = grid.columns
          var searchResultArray = findObjectByKey(a ,'field','price');
          if (data[i].quantity > 0 && !searchResultArray.hidden) {
                total += data[i].quantity * data[i].price;
            }else if(data[i].quantity > 0 && searchResultArray.hidden){
                total += data[i].quantity * data[i].purchase_price;
            }
        }
            return kendo.toString(total, 'n0');

    };

    calculatePriceBind = function (data) {
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].quantity > 0 && data[i].price > 0) {
                var a = data[i].price;
                total += data[i].quantity * a;
            }else if(data[i].quantity > 0 && data[i].purchase_price > 0){
                var a = data[i].purchase_price;
                total += data[i].quantity * a;
            }
        }
        if (total > 0) {
            jQuery('#amount_total').text(kendo.toString(total, 'n0'));
        }
    };

    calculateAmount = function (quantity, price) {
        var check = price.toString().indexOf(",");
        if (price !== 0 && check !== -1) {
            price = price.replace(/\,/g, "");
        }
        amount = quantity * price;
        return kendo.toString(amount, 'n0');
    };

    Onchange = function (e) {
        var dataItem = this.dataItem(e.item);
        var data = $kGrid.data("kendoGrid").dataSource.data()[0];
        jQuery.each(Ermis.columns, function (i, v) {
            if (v.set === "1") {
                data[v.field] = dataItem[v.field];
            } else if (v.set === "2") {
                if (dataItem[v.field] !== null) {
                    data[v.field] = dataItem[v.field];
                }
            } else if (v.set === "3") {
                data[v.field] = FormatNumber(parseInt(dataItem[v.field]));
            }
        });
    };

    OnchangeCancel = function (e) {
        var dataItem = this.dataItem(e.item);
        if (dataItem.id === "") {
            $kGrid.data("kendoGrid").closeCell();
        } else {

            var data = $kGrid.data("kendoGrid").dataSource.data()[0];
            jQuery.each(Ermis.columns, function (i, v) {
                if (v.set === "1") {
                    data[v.field] = dataItem[v.field];
                } else if (v.set === "2") {
                    if (dataItem[v.field] !== null) {
                        data[v.field] = dataItem[v.field];
                    }
                } else if (v.set === "3") {
                    data[v.field] = FormatNumber(parseInt(dataItem[v.field]));
                }
            });
        }
    };


   checkboxClicked = function(element) {

       var isChecked = element.checked;
       var field = jQuery(element).attr('name');
       cell = $(element).parent(); /* you have to find cell containing check box*/
       grid = $kGrid.data("kendoGrid");
       grid.editCell(1);
   };
    return {

        init: function () {
            initGetColunm();
            initTabsTrip();
            initKendoGrid();
            initKendoDatePicker();
            initKendoUiDropList();
            initKeyCode();
            initKendoEndDatePicker();
            initKendoStartDatePicker();
            initBindData();
            initGetStoredArrId();
            initMonthDate();
        }

    };

}();


jQuery(document).ready(function () {
    Ermis.init();
});
