var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var $kDetailGrid = jQuery('#grid-detail');
    var end; var start;
    var key = 'Alt+';
    var dataId = '';
    var data = [];
    var dataSource = '';
    var dataSourceGeneral = '';

    var initGetColunm = function () {
        data = GetAllDataForm('#form-search');
        return data;
    };

    var initKendoGrid = function () {
        dataSourceGeneral = {
            data: Ermis.data,
            pageSize: 50
        };
        var grid = $kGrid.kendoGrid({
            dataSource: dataSourceGeneral,
            change: onChange,
            selectable: "row",
            height: jQuery(window).height() * 0.5,
            groupable: true,
            sortable: true,
            pageable: true,
            filterable: true,
            dataBound: function () {
                var rows = this.items();
                $(rows).each(function () {
                    var index = $(this).index() + 1;
                    var rowLabel = $(this).find(".row-number");
                    $(rowLabel).html(index);
                });
            },
            columns: Ermis.column_grid
        });
        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
    };


    var initKendoUiContextMenu = function () {
        jQuery("#context-menu").kendoContextMenu({
            target: ".md-card-content"
        });
    };

    var initStatus = function (flag) {
        shortcut.remove(key + "A");
        shortcut.remove(key + "V");
        shortcut.remove(key + "D");
        shortcut.remove(key + "R");
        jQuery('.view_item,.delete_item,.print,.unwrite_item,.write_item').off('click');
        if (flag === 1) {//DEFAULT
            jQuery('#add-top-menu-general').show();
            jQuery('.new_item').on('click', initNew);
            jQuery('#get_data').on('click', initSearchData);
            //jQuery('.view_item').on('click', initView);
            //jQuery('.delete_item').on('click', initDelete);
            //jQuery('.write_item').on('click', initWrite);
            //jQuery('.unwrite_item').on('click', initUnWrite);
            jQuery('.refesh_item').on('click', initRefesh);
            jQuery('.view_item,.delete_item,.print,.unwrite_item,.write_item').addClass('disabled');
            jQuery('.view_item,.delete_item,.print-item,.unwrite_item,.write_item').off('click');
            shortcut.add(key + "A", function (e) { initNew(e); });
            //shortcut.add(key + "V", function (e) { initView(e); });
            //shortcut.add(key + "W", function (e) { initWrite(e); });
            //shortcut.add(key + "D", function (e) { initDelete(e); });
            //shortcut.add(key + "E", function (e) { initUnWrite(e); });
            shortcut.add(key + "R", function (e) { initRefesh(e); });
        } else if (flag === 2) {
            jQuery('.view_item,.delete_item,.print').removeClass('disabled');
            jQuery('.view_item').on('click', initView);
            jQuery('.delete_item').on('click', initDelete);
            //jQuery('.write_item').on('click', initWrite);
            //jQuery('.unwrite_item').on('click', initUnWrite);
            jQuery('.print-item').on('click', initPrint);
            shortcut.add(key + "V", function (e) { initView(e); });
            //shortcut.add(key + "W", function (e) { initWrite(e); });
            shortcut.add(key + "D", function (e) { initDelete(e); });
            //shortcut.add(key + "E", function (e) { initUnWrite(e); });
        }
    };

    var initActive = function (active) {
        shortcut.remove(key + "W");
        shortcut.remove(key + "U");
        if (active == "1"|| active == 1) {
            initStatus(1);
            jQuery(".unwrite_item").show();
            jQuery('.unwrite_item,.print,.view_item').removeClass('disabled');
            jQuery('.unwrite_item').on('click', initUnWrite);
            jQuery('.print-item').on('click', initPrint);
            jQuery('.view_item').on('click', initView);
            shortcut.add(key + "U", function (e) { initUnWrite(e); });
            shortcut.add(key + "V", function (e) { initView(e); });
            jQuery('.write_item').addClass('disabled');
            jQuery('.write_item').off('click');
            jQuery(".write_item").hide();
        } else {
            initStatus(2);
            shortcut.add(key + "W", function (e) { initWrite(e); });
            jQuery('.write_item').on('click', initWrite);
            jQuery('.write_item').removeClass('disabled');
            jQuery(".write_item").show();
            jQuery(".unwrite_item").hide();
            jQuery('.unwrite_item').addClass('disabled');
            jQuery('.unwrite_item').off('click');
        }
    }

    var initNew = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.a) {
                sessionStorage.status = 1;
                sessionStorage.removeItem("dataId");
                window.location = Ermis.action.new;
            } else {
                kendo.alert(transText.you_not_permission_add);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initView = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.v) {
                if ($kGrid.find('.k-state-selected').length > 0) {
                    var arrId = [];
                    var grid = $kGrid.data("kendoGrid");
                    var selectedItem = grid.dataItem(grid.select());
                    var source = $kGrid.data("kendoGrid").dataSource.data();
                    jQuery.each(source, function (e, v) {
                        arrId[e] = v.id;
                        if (v.id === selectedItem.id) {
                            sessionStorage.current = e;
                        }
                    });
                    sessionStorage.arrId =  JSON.stringify(arrId);
                    sessionStorage.status = 5;
                    sessionStorage.dataId = selectedItem.id;
                    window.location = Ermis.action.new;
                } else {
                    kendo.alert(transText.please_select_line_view);
                }
            } else {
                kendo.alert(transText.you_not_permission_view);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initDelete = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.d) {
                $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                    if (confirmed) {
                if ($kGrid.find('.k-state-selected').length > 0) {
                    var grid = $kGrid.data("kendoGrid");
                    var selectedItem = grid.dataItem(grid.select());
                    var dataId = selectedItem.id;
                    var postdata = { data: JSON.stringify(dataId) };
                    RequestURLWaiting(Ermis.link+'-delete', 'json', postdata, function (result) {
                        if (result.status === true) {
                            var grid = $kGrid.data("kendoGrid");
                            var grid_detail = $kDetailGrid.data("kendoGrid");
                            grid.removeRow($kGrid.find('tr.k-state-selected'));
                            dataSource = new kendo.data.DataSource({ data: [], aggregate: Ermis.aggregate });
                            grid_detail.setDataSource(dataSource);
                            initStatus(1);
                        }else{
                          kendo.alert(result.message);
                        }
                    }, true);
                } else {
                    kendo.alert(transText.please_select_line_delete);
                }
                    }
                });
            } else {
                kendo.alert(transText.you_not_permission_delete);
            }
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
            if ($kGrid.find('.k-state-selected').length > 0) {
            var grid = $kGrid.data("kendoGrid");
            var selectedItem = grid.dataItem(grid.select());
            var dataId = selectedItem.id;
            obj.id = dataId;
            obj.voucher = jQuery(this).attr('data-id');
            var postdata = { data: JSON.stringify(obj) };
            RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
              if (result.status === true) {
                if (result.detail_content) {
                  var decoded = $("<div/>").html(result.print_content).text();
                    decoded = decoded.replace('<tr class="detail_content"></tr>', result.detail_content);
                    PrintForm(jQuery('#print'), decoded);
                    jQuery('#print').html("");
                }else if(result.section_content){
                  var decoded = $("<div/>").html(result.print_content).text();
                    decoded = decoded.replace('<div class="section_content"></div>', result.section_content);
                    PrintForm(jQuery('#print'), decoded);
                    jQuery('#print').html("");
                }else if (result.download){
                    window.open(Ermis.link+'-downloadExcel');
                }
              }else{
                kendo.alert(result.message);
              }
            }, true);
            } else {
                kendo.alert(transText.please_select_line_view);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initWrite = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.e) {
                if ($kGrid.find('.k-state-selected').length > 0) {
                    var grid = $kGrid.data("kendoGrid");
                    var selectedItem = grid.dataItem(grid.select());
                    var dataId = selectedItem.id;
                    var postdata = { data: JSON.stringify(dataId) };
                    RequestURLWaiting(Ermis.link+'-write', 'json', postdata, function (result) {
                        if (result.status === true) {
                            initActive("1");
                            selectedItem.set("active", "1");
                            initStatus(1);
                        } else {
                            kendo.alert(result.message);
                        }
                    }, true);
                } else {
                    kendo.alert(transText.please_select_line_write);
                }
            } else {
                kendo.alert(transText.you_not_permission_write);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initUnWrite = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.e) {
                if ($kGrid.find('.k-state-selected').length > 0) {
                            var grid = $kGrid.data("kendoGrid");
                            var selectedItem = grid.dataItem(grid.select());
                            var dataId = selectedItem.id;
                            var postdata = { data: JSON.stringify(dataId) };
                            RequestURLWaiting(Ermis.link+'-unwrite', 'json', postdata, function (result) {
                                if (result.status === true) {
                                    initActive("0");
                                    selectedItem.set("active", "0");
                                    initStatus(1);
                                } else {
                                    kendo.alert(result.message);
                                }
                            }, true);
                        } else {
                            kendo.alert(transText.please_select_line_unwrite);
                        }
            } else {
                kendo.alert(transText.you_not_permission_unwrite);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initRefesh = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.a) {
                location.reload();
            } else {
                kendo.alert(transText.you_not_permission_add);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initSearchData = function (e) {
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
            }else if (col.key === 'radio') {
                obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
            }
        });
        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-get', 'json', postdata, function (result) {
            if (result.status === true) {
                dataSourceGeneral = new kendo.data.DataSource({ data: result.data, pageSize: result.data.length, schema: { model: { fields: Ermis.field } } });
                var grid = $kGrid.data("kendoGrid");
                var grid_detail = $kDetailGrid.data("kendoGrid");
                grid.setDataSource(dataSourceGeneral);
                dataSource = new kendo.data.DataSource({ data: [],  aggregate: Ermis.aggregate });
                grid_detail.setDataSource(dataSource);
                calculatePriceBind(result.data);
            }else{
              kendo.alert(result.message);
            }
        }, true);
    };

    var onChange = function (e) {
        var $this = this;
        var dataItem = $this.dataItem($this.select());
        initActive(dataItem.active);
        var grid_detail = $kDetailGrid.data("kendoGrid");
        dataId = dataItem.id;
        var postdata = { data: JSON.stringify(dataId) };
        RequestURLWaiting(Ermis.link+'-get-detail', 'json', postdata, function (result) {
            if (result.status === true) {
                dataSource = new kendo.data.DataSource({ data: result.data, aggregate: Ermis.aggregate });
                grid_detail.setDataSource(dataSource);
            }else{
              kendo.alert(result.message);
            }
        }, true);
    };

    var initKendoDetailGrid = function () {
        dataSource = new kendo.data.DataSource({
            aggregate: Ermis.aggregate
        });
        var grid = $kDetailGrid.kendoGrid({
            height: jQuery(window).height() * 0.4,
            dataSource: dataSource,
            scrollable: false,
            sortable: true,
            pageable: false,
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
    var initKendoButton = function () {
        jQuery("#search_grid").kendoButton();
    };
    calculateAmount = function (quantity, price) {
        amount = quantity * price;
        return kendo.toString(amount, 'n0');
    };
    calculatePriceAggregateDiscount = function () {
        var total = 0;
        if($kGrid.find('tr.k-state-selected').length > 0){
            var grid_select = $kGrid.data("kendoGrid");
          var selectedItem = grid_select.dataItem(grid_select.select());
          var discount_percent = selectedItem.discount_percent;
          var discount = selectedItem.discount;
          if(discount_percent == null){
            discount_percent = 0;
          }
          if(discount == null){
            discount = 0;
          }
          var grid = $kDetailGrid.data("kendoGrid");
          var data = grid.dataSource.data();
          for (var i = 0; i < data.length; i++) {
            if(data[i].discount_percent == null){
              data[i].discount_percent = 0;
            }
            if(data[i].discount == null){
              data[i].discount = 0;
            }
              if (data[i].quantity > 0 && data[i].price > 0) {
                  var a = data[i].price;
                  total += data[i].quantity * a*(1-(data[i].discount_percent/100))-data[i].discount;
              }else if(data[i].quantity > 0 && data[i].purchase_price > 0){
                  var a = data[i].purchase_price;
                  total += data[i].quantity * a*(1-(data[i].discount_percent/100))-data[i].discount;
              }
          }
          if (total > 0) {
              total = total * (1-(discount_percent/100)) - discount;
          }
        }
          return kendo.toString(total, 'n0');
    };


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

    return {

        init: function () {
            initKendoGrid();
            initKendoUiContextMenu();
            initKendoDetailGrid();
            initKendoStartDatePicker();
            initKendoEndDatePicker();
            initKendoUiDropList();
            initStatus(Ermis.flag);
            initGetColunm();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
