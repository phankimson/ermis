var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var $kGridExpand = jQuery('#grid-expand');
    var $kGridSubject = jQuery('#grid_subject');
    var $kGridReference = jQuery('#grid_reference');
    var key = 'Alt+';
    var myWindow = jQuery("#form-window-filter");
    var $kWindow = '';
    var myWindow2 = jQuery("#form-window-reference");
    var $kWindow2 = '';
    var dataSource = '';
    var dataSourceExpand = '';
    var ds = ''; var ts = jQuery("#tabstrip");
    var a = []; var b; var data = [];
    var status = 0;
    var voucher = []; var storedarrId = [];

    function changewarehouse() {
        if (jQuery("#warehouse").parent().hasClass('checked')) {
            jQuery("#warehouse_tabs").hide(100);
        } else {
            jQuery("#warehouse_tabs").show(100);
        }
    }

    function changepayment() {
        var grid = $kGrid.data("kendoGrid");
        var dropdownlist = jQuery("#payment_list").data("kendoDropDownList");
        if (jQuery("#payment").parent().hasClass('checked')) {
            jQuery("#cash_tabs").hide(100);
            jQuery("#bank_tabs").hide(100);
            if (Ermis.type_account === 1) {
                grid.hideColumn("debt_account_cash");
                grid.hideColumn("debt_account_bank");
                grid.showColumn("debt_account");
            } else {
                grid.hideColumn("credit_account_cash");
                grid.hideColumn("credit_account_bank");
                grid.showColumn("credit_account");
            }
            dropdownlist.enable(false);
        } else {
            dropdownlist.enable(true);
            dropdownlist.value();
            if (dropdownlist.value() === "1") {
                jQuery("#cash_tabs").show(100);
                if (Ermis.type_account === 1) {
                    grid.showColumn("debt_account_cash");
                    grid.hideColumn("debt_account_bank");
                    grid.hideColumn("debt_account");
                } else {
                    grid.showColumn("credit_account_cash");
                    grid.hideColumn("credit_account_bank");
                    grid.hideColumn("credit_account");
                }
            } else {
                jQuery("#bank_tabs").show(100);
                if (Ermis.type_account === 1) {
                    grid.showColumn("debt_account_bank");
                    grid.hideColumn("debt_account_cash");
                    grid.hideColumn("debt_account");
                } else {
                    grid.showColumn("credit_account_bank");
                    grid.hideColumn("credit_account_cash");
                    grid.hideColumn("credit_account");
                }
            }
        }
    }

    var initChangePayment = function () {
        jQuery("#warehouse").on('ifChanged', function () {
               changewarehouse();
        })
        jQuery("#payment").on('ifChanged', function () {
            changepayment();
        })
    }

    var initKendoUiDropListPaymentList = function () {
        jQuery("#payment_list").kendoDropDownList({
            filter: "contains",
            change: onChange,
        });
        function onChange(e) {
            var dataItem = this.dataItem(e.item);
            var grid = $kGrid.data("kendoGrid");
            if (dataItem.value === "1") {
                jQuery("#cash_tabs").show(100);
                jQuery("#bank_tabs").hide(100);
                if (Ermis.type_account === 1) {
                    grid.showColumn("debt_account_cash");
                    grid.hideColumn("debt_account_bank");
                    grid.hideColumn("debt_account");
                } else {
                    grid.showColumn("credit_account_cash");
                    grid.hideColumn("credit_account_bank");
                    grid.hideColumn("credit_account");
                }

            } else {
                jQuery("#bank_tabs").show(100);
                jQuery("#cash_tabs").hide(100);
                if (Ermis.type_account === 1) {
                    grid.showColumn("debt_account_bank");
                    grid.hideColumn("debt_account_cash");
                    grid.hideColumn("debt_account");
                } else {
                    grid.showColumn("credit_account_bank");
                    grid.hideColumn("credit_account_cash");
                    grid.hideColumn("credit_account");
                }
            }
        };
    };

    var initLoadData = function (dataId) {
        var postdata = { data: JSON.stringify(dataId) };
        RequestURLWaiting(Ermis.link+'-GetBind', 'json', postdata, function (result) {
            if (result.status === true && result.general) {
                initActive(result.general.active);
                jQuery("#tabs_anim").find("li").each(function () {
                    var key = jQuery(this).attr("id");
                    var bh = GetAllDataForm("#" + key, 2);
                    jQuery.each(bh.columns, function (k, col) {
                    if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                        if (col.type === 'date') {
                            jQuery("#"+key).find('input[name="' + col.field + '"]').val(kendo.toString(kendo.parseDate(result.general[key +'_'+col.field], 'yyyy-mm-dd'), 'dd/MM/yyyy'));
                        } else if (jQuery("#" + key).find('input[name = ' + col.field + ']').hasClass("number-price") || jQuery("#" + key).find('input[name = ' + col.field + ']').hasClass("number")) {
                            jQuery("#" + key).find('input[name="' + col.field + '"]').data("kendoNumericTextBox").value(result.general[key + '_' + col.field]);
                        } else {
                            jQuery("#" + key).find('input[name="' + col.field + '"]').val(result.general[key + '_' + col.field]);
                        }
                    } else if (col.key === 'select') {
                        if (result.general[key + '_' + col.field] === null) {
                            jQuery("#" + key).find('select[name="' + col.field + '"]').data('kendoDropDownList').value("0");
                        } else {
                            jQuery("#" + key).find('select[name="' + col.field + '"]').data('kendoDropDownList').value(result.general[key + '_' + col.field]);
                        }
                    } else if (col.key === 'checkbox') {
                        if (result.general[key + '_' + col.field] === "1" || result.general[key + '_' + col.field] === true || result.general[key + '_' + col.field] === 1) {
                            jQuery("#" + key).find('input[name="' + col.field + '"]').parent().addClass('checked');
                        } else {
                            jQuery("#" + key).find('input[name="' + col.field + '"]').parent().removeClass('checked');
                        }
                    } else if (col.key === 'textarea') {
                        jQuery("#" + key).find('textarea[name="' + col.field + '"]').val(result.general[key + '_' + col.field]);
                    } else if (col.key === 'radio') {
                        jQuery("#" + key).find('input[name="' + col.field + '"][value=' + result.general[key + '_' + col.field] + ']').attr("checked", "checked");
                    }
                 });
                });
                var dropdownlist = $("#payment_list").data("kendoDropDownList");
                if (result.general["IS_active"] === "1" || result.general["RE_active"] === "1") {
                    jQuery("#warehouse").iCheck("check", function () {
                        jQuery("#warehouse_tabs").show(100);
                    });
                } else {
                    jQuery("#warehouse").iCheck("uncheck", function () {
                        jQuery("#warehouse_tabs").hide(100);
                    });
                }
                var grid = $kGrid.data("kendoGrid");
                if (result.general["RC_active"] === "1" || result.general["RB_active"] === "1" || result.general["PA_active"] === "1" || result.general["PB_active"] === "1") {
                    jQuery("#payment").iCheck("check", function () {
                        if (result.general["RC_active"] === "1" || result.general["PA_active"] === "1") {
                            dropdownlist.value("1");
                            jQuery("#bank_tabs").hide(100);
                            jQuery("#cash_tabs").show(100);
                            if (Ermis.type_account === 1) {
                                grid.showColumn("debt_account_cash");
                                grid.hideColumn("debt_account_bank");
                                grid.hideColumn("debt_account");
                            } else {
                                grid.showColumn("credit_account_cash");
                                grid.hideColumn("credit_account_bank");
                                grid.hideColumn("credit_account");
                            }

                        } else {
                            dropdownlist.value("2");
                            jQuery("#cash_tabs").hide(100);
                            jQuery("#bank_tabs").show(100);
                            if (Ermis.type_account === 1) {
                                grid.showColumn("debt_account_bank");
                                grid.hideColumn("debt_account_cash");
                                grid.hideColumn("debt_account");
                            } else {
                                grid.showColumn("credit_account_bank");
                                grid.hideColumn("credit_account_cash");
                                grid.hideColumn("credit_account");
                            }
                        }
                    });
                } else {
                    jQuery("#payment").iCheck("uncheck", function () {
                        dropdownlist.value("1");
                    });
                }
                ds = new kendo.data.DataSource({ data: result.detail,  schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
                grid.setDataSource(ds);
                var grid_expand = $kGridExpand.data("kendoGrid");
                ds = new kendo.data.DataSource({ data: result.tax, schema: { model: { fields: Ermis.field_expand } }, aggregate: Ermis.aggregate_expand });
                grid_expand.setDataSource(ds);
                $kGrid.addClass('disabled');
                $kGridExpand.addClass('disabled');
                calculatePriceBind(result.detail);
            } else {
                initStatus(4);
            }
        }, true);
    };

    var initBindData = function () {
        if (localStorage.dataId) {
            var dataId = localStorage.dataId;
            initLoadData(dataId);
        }
    };


    //var initGetColunm = function () {
    //    data = GetAllDataForm('#form-action', 2);
    //    return data;
    //};

    var initVoucherMasker = function () {
        var data = Ermis.voucher;
        jQuery.each(data, function (i, v) {
            var char = 'x';
            var number = parseInt(v.length_number);
            if (v.suffixes) {
                voucher[i] = {"val": v.prefix + char.repeat(number) + v.suffixes, "k" : v.code};
            } else {
                voucher[i] = { "val": v.prefix + char.repeat(number), "k": v.code };
            }
        })
    };

    var initCheckSession = function () {
        if (!localStorage.status) {
            status = 1;
        } else {
            status = parseInt(localStorage.status);
        }
        return status;
    };


    var initKendoGridSubject = function () {
        var grid = $kGridSubject.kendoGrid({
            dataSource: {
                data: []
            },
            selectable: "row",
            height: jQuery(window).height() * 0.5,
            sortable: true,
            pageable: true,
            filterable: true,
            columns: Ermis.columns_subject,
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

        $kGridSubject.dblclick(function (e) {
            initChoose(e);
        });
    };

    var initSearchGridSubject = function () {
        jQuery('#search_data').on('click', function () {
            var obj = {};
            var filter = GetAllDataForm('#form-window-filter', 2);
            jQuery.each(filter.columns, function (k, col) {
                if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
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
                        } else if(col.type === "number"){
                            obj[col.field] = 1;
                        } else {
                            obj[col.field] = '1';
                        }
                    } else {
                        if (col.type === 'boolean') {
                            obj[col.field] = false;
                        }else if(col.type === "number"){
                            obj[col.field] = 0 ;
                        }  else {
                            obj[col.field] = '0';
                        }
                    }
                } else if (col.key === 'radio') {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
                }
            });

            var postdata = { data: JSON.stringify(obj) };
            RequestURLWaiting(Ermis.link+'-get', 'json', postdata, function (result) {
                if (result.status === true) {
                    var grid = $kGridSubject.data("kendoGrid");
                    var ds = new kendo.data.DataSource({ data: result.data });
                    grid.setDataSource(ds);
                    grid.dataSource.page(1);
                }else{
                  kendo.alert(result.message);
                }
            }, true);
        });

    };

    var initTabsTrip = function () {
        ts.kendoTabStrip();
        ts.find('ul').show();
    };

    var initKendoGridReference = function () {
        var grid = $kGridReference.kendoGrid({
            dataSource: {
                data: []
            },
            selectable: "row",
            height: jQuery(window).height() * 0.5,
            sortable: true,
            pageable: true,
            filterable: true,
            columns: Ermis.columns_reference
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
        $('#header-chb').change(function (ev) {
            var checked = ev.target.checked;
            $('.k-checkbox').each(function (idx, item) {
                if (checked) {
                    if (!$(item).closest('tr').is('.k-state-selected')) {
                        $(item).click();
                    }
                } else {
                    if ($(item).closest('tr').is('.k-state-selected')) {
                        $(item).click();
                    }
                }
            });

        });

        $(".choose_reference").bind("click", function () {
            var checked = [];
            for (var i in checkedIds) {
                if (checkedIds[i]) {
                    checked.push(i);
                }
            }

            alert(checked);
        });
        var checkedIds = {};

        //on click of the checkbox:
        function selectRow() {
            var checked = this.checked,
                row = $(this).closest("tr"),
                grid = $kGridReference.data("kendoGrid"),
                dataItem = grid.dataItem(row);
            checkedIds[dataItem.id] = checked;

            if (checked) {
                //-select the row
                row.addClass("k-state-selected");
            } else {
                //-remove selection
                row.removeClass("k-state-selected");
            }
        }

    };
    var initKendoGridExpand = function () {
        dataSourceExpand = new kendo.data.DataSource({
            data: Ermis.data_expand,
            aggregate: Ermis.aggregate_expand,
            batch: true,
            pageSize: 50,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field_expand
                }
            }
        });
      var grid = $kGridExpand.kendoGrid({
            dataSource: dataSourceExpand,
            save: function (data) {
                var grid = this;
                setTimeout(function () {
                    grid.refresh();
                });
            },
            editable: {
                confirmation: false // the confirmation message for destroy command
            },
            height: jQuery(window).height() * 0.5,
            columns: Ermis.columns_expand
        });
        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
    };



    var initKendoGrid = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data,
            aggregate: Ermis.aggregate,
            batch: true,
            pageSize: 50,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field
                }
            }
        });
        var grid = $kGrid.kendoGrid({
            dataSource: dataSource,
            save: function (data) {
                var grid = this;
                setTimeout(function () {
                    grid.refresh();
                });
            },
            editable: {
                confirmation: false // the confirmation message for destroy command
            },
            height: jQuery(window).height() * 0.5,
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

    var initKendoUiContextMenuGrid = function () {
        jQuery("#context-menu-grid").kendoContextMenu({
            target: "#grid",
            select: function (e) {
                var $this = e;
                var grid = $kGrid.data("kendoGrid");
                if (jQuery($this.item).children().hasClass('remove_row')) {
                    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                        if (confirmed) {
                            grid.removeRow($kGrid.find('tr.k-state-selected'));
                        }
                    });
                } else if (jQuery($this.item).children().hasClass('new_row')) {
                    grid.addRow();
                } else if (jQuery($this.item).children().hasClass('close_row')) {
                    grid.cancelRow();
                } else if (jQuery($this.item).children().hasClass('remove_all_row')) {
                    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                        if (confirmed) {
                            grid.cancelChanges(); // CLOSE ALL
                        }
                    });
                }
            }
        });
        $kGrid.on("mousedown", "tr[role='row']", function (e) {
            if (e.which === 3) {
                $kGrid.find(" tbody tr").removeClass("k-state-selected");
                jQuery(this).addClass("k-state-selected");
            }
        });

        jQuery("#context-menu-grid-expand").kendoContextMenu({
            target: "#grid-expand",
            select: function (e) {
                var $this = e;
                var grid = $kGridExpand.data("kendoGrid");
                if (jQuery($this.item).children().hasClass('remove_row')) {
                    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                        if (confirmed) {
                            grid.removeRow($kGridExpand.find('tr.k-state-selected'));
                        }
                    });
                } else if (jQuery($this.item).children().hasClass('new_row')) {
                    grid.addRow();
                } else if (jQuery($this.item).children().hasClass('close_row')) {
                    grid.cancelRow();
                } else if (jQuery($this.item).children().hasClass('remove_all_row')) {
                    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                        if (confirmed) {
                            grid.cancelChanges(); // CLOSE ALL
                        }
                    });
                }
            }
        });
        $kGridExpand.on("mousedown", "tr[role='row']", function (e) {
            if (e.which === 3) {
                $kGridExpand.find(" tbody tr").removeClass("k-state-selected");
                jQuery(this).addClass("k-state-selected");
            }
        });
    };

    var initKendoUiContextMenu = function () {
        jQuery("#context-menu").kendoContextMenu({
            target: "#form-action"
        });
    };

    var initStatus = function (flag) {
        shortcut.remove(key + "A");
        shortcut.remove(key + "E");
        shortcut.remove(key + "S");
        shortcut.remove(key + "C");
        shortcut.remove(key + "D");
        shortcut.remove(key + ">");
        shortcut.remove(key + "<");
        jQuery('.add,.edit,.delete,.back,.forward,.print,.cancel,.save,.choose,.cancel-window,.filter,.reference,.write_item,.unwrite_item').addClass('disabled');
        jQuery('.add,.edit,.delete,.back,.forward,.print-item,.cancel,.save,.choose,.cancel-window,.filter,.reference,.write_item,.unwrite_item').off('click');
        jQuery('input,textarea').not('.header_main_search_input').not('#files').not('.k-filter-menu input').addClass('disabled');
        jQuery(".droplist").addClass('disabled');
        jQuery('input:checkbox').parent().addClass('disabled');
        jQuery('.date-picker').addClass('disabled');
        if (flag === 1) {//ADD
            jQuery('#add-top-menu-detail').show();
            localStorage.removeItem("dataId");
            jQuery('.cancel,.save,.choose,.cancel-window,.filter,.reference').removeClass('disabled');
            jQuery('.cancel').on('click', initCancel);
            jQuery('.save').on('click', initSave);
            jQuery('.choose').on('click', initChoose);
            jQuery('.cancel-window').on('click', initClose);
            jQuery('.filter').on('click', initFilterForm);
            jQuery('.reference').on('click', initReferenceForm);
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
            jQuery('input,textarea').removeClass('disabled');
            jQuery('.k-button').removeClass('disabled');
            jQuery(".droplist").removeClass('disabled');
            jQuery('input:checkbox').parent().removeClass('disabled');
            jQuery('.date-picker').removeClass('disabled');
            jQuery('input[name!="__RequestVerificationToken"]').not('[type=radio]').not(".date-picker,.voucher").val("");
            jQuery.each(voucher, function (k, v) {
                jQuery("#" + v.k).find("input[name='voucher']").val(v.val);
            })
            jQuery(".date-picker").val(kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy'));
            $kGrid.data('kendoGrid').dataSource.data([]);
            $kGridExpand.data('kendoGrid').dataSource.data([]);
            $kGrid.removeClass('disabled');
            $kGridExpand.removeClass('disabled');
            jQuery("#warehouse").iCheck("check");
            jQuery("#warehouse_tabs").show(100);
        } else if (flag === 2) {//SAVE
            jQuery('.add,.edit,.print,.back,.forward,.delete').removeClass('disabled');
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "E", function (e) { initEdit(e); });
            shortcut.add(key + "<", function (e) { initBack(e); });
            shortcut.add(key + ">", function (e) { initForward(e); });
            jQuery('.add').on('click', initAdd);
            jQuery('.edit').on('click', initEdit);
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
            jQuery('.delete').on('click', initDelete);
            $kGrid.addClass('disabled');
            $kGridExpand.addClass('disabled');
        } else if (flag === 3) { //EDIT
            jQuery('#add-top-menu-detail').show();
            jQuery('.cancel,.save,.filter,.reference').removeClass('disabled');
            jQuery('.cancel').on('click', initCancel);
            jQuery('.save').on('click', initSave);
            jQuery('.filter').on('click', initFilterForm);
            jQuery('.reference').on('click', initReferenceForm);
            jQuery('.cancel-window').on('click', initClose);
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
            jQuery('input,textarea').removeClass('disabled');
            jQuery('.k-button').removeClass('disabled');
            jQuery(".droplist").removeClass('disabled');
            jQuery('input:checkbox').parent().removeClass('disabled');
            jQuery('.date-picker').removeClass('disabled');
            $kGrid.removeClass('disabled');
            $kGridExpand.removeClass('disabled');
            jQuery.each(voucher, function (k, v) {
                var value = jQuery("#" + v.k).find("input[name='voucher']").val();
                if (value === "") {
                    jQuery("#" + v.k).find("input[name='voucher']").val(v.val);
                }
            });
            jQuery(".date-picker").each(function (k, v) {
                var value = jQuery(this).val();
                if (value === "") {
                    jQuery(this).val(kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy'));
                }
            })
        } else if (flag === 4) { //CANCEL
            jQuery('.add,.edit,.print,.back,.forward,.delete').removeClass('disabled');
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "E", function (e) { initEdit(e); });
            shortcut.add(key + "<", function (e) { initBack(e); });
            shortcut.add(key + ">", function (e) { initForward(e); });
            jQuery('.add').on('click', initAdd);
            jQuery('.edit').on('click', initEdit);
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
            jQuery('.delete').on('click', initDelete);
            jQuery('input[name!="__RequestVerificationToken"]').not('[type=radio]').val("");
            $kGrid.data('kendoGrid').dataSource.data([]);
            $kGridExpand.data('kendoGrid').dataSource.data([]);
        } else if (flag === 5) { //BIND
            jQuery('#add-top-menu-detail').show();
            jQuery('.add,.edit,.print,.back,.forward,.delete').removeClass('disabled');
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "E", function (e) { initEdit(e); });
            shortcut.add(key + "<", function (e) { initBack(e); });
            shortcut.add(key + ">", function (e) { initForward(e); });
            jQuery('.add').on('click', initAdd);
            jQuery('.edit').on('click', initEdit);
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
            jQuery('.delete').on('click', initDelete);
        } else if (flag === 6) { //Write = 1
            jQuery('.add,.print,.back,.forward').removeClass('disabled');
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "<", function (e) { initBack(e); });
            shortcut.add(key + ">", function (e) { initForward(e); });
            jQuery('.add').on('click', initAdd);
            jQuery('.print-item').on('click', initPrint);
            jQuery('.back').on('click', initBack);
            jQuery('.forward').on('click', initForward);
            if (!localStorage.dataId) {
                jQuery('.print,.delete,.edit').addClass('disabled');
                jQuery('.print,.delete,.edit').off('click');
            }
        };
    };
        var initActive = function (active) {
            shortcut.remove(key + "W");
            shortcut.remove(key + "U");
            if (active === "1") {
                initStatus(6);
                jQuery(".unwrite_item").show();
                jQuery('.unwrite_item').removeClass('disabled');
                jQuery('.unwrite_item').on('click', initUnWrite);
                shortcut.add(key + "U", function (e) { initUnWrite(e); });
                jQuery('.write_item').addClass('disabled');
                jQuery('.write_item').off('click');
                jQuery(".write_item").hide();
            } else {
                initStatus(5);
                shortcut.add(key + "W", function (e) { initWrite(e); });
                jQuery('.write_item').on('click', initWrite);
                jQuery('.write_item').removeClass('disabled');
                jQuery(".write_item").show();
                jQuery(".unwrite_item").hide();
                jQuery('.unwrite_item').addClass('disabled');
                jQuery('.unwrite_item').off('click');
            }
        }

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

    var initKendoUiDropListDate = function () {
        jQuery(".droplist-date").kendoDropDownList({
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

    var initKendoUiDialog = function () {
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

        $kWindow2 = myWindow2.kendoWindow({
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
        $kWindow.title("Tìm kiếm đối tượng");
        $kWindow2.title("Tham chiếu");
    };
    var initFilterForm = function () {
        $kWindow.open();
    };
    var initReferenceForm = function () {
        $kWindow2.open();
    };

    var initGetDataReference = function () {
        jQuery('#get_data').on('click', function () {
            var obj = {}; var crit = true;
            var filter = GetAllDataForm('#form-window-reference', 2);
            jQuery.each(filter.columns, function (k, col) {
                if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
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
                } else if (col.key === 'radio') {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
                }
            });

            var postdata = { data: JSON.stringify(obj) };

            RequestURLWaiting(Ermis.link+'-GetReference', 'json', postdata, function (result) {
                if (result.status === true) {
                    var grid = $kGridReference.data("kendoGrid");
                    var ds = new kendo.data.DataSource({ data: result.data, schema: { model: { fields: Ermis.field_reference } } });
                    grid.setDataSource(ds);
                    grid.dataSource.page(1);
                }else{
                  kendo.alert(result.message);
                }
            }, true);
        });
    };



    var initWrite = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.e) {
                var dataId = localStorage.dataId;
                var postdata = { data: JSON.stringify(dataId) };
                RequestURLWaiting(Ermis.link+'-Write', 'json', postdata, function (result) {
                    if (result.status === true) {
                        initActive("1");
                    } else {
                        kendo.alert(result.message);
                    }
                }, true);
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
                var dataId = localStorage.dataId;
                var postdata = { data: JSON.stringify(dataId) };
                RequestURLWaiting(Ermis.link+'-UnWrite', 'json', postdata, function (result) {
                    if (result.status === true) {
                        initActive("0");
                    } else {
                        kendo.alert(result.message);
                    }
                }, true);
            } else {
                kendo.alert(transText.you_not_permission_unwrite);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };


    var initSave = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                if (confirmed) {
                    var obj = {}; var crit = false;
                    obj.id = localStorage.dataId;
                    obj.detail = $kGrid.data("kendoGrid").dataSource.data();
                    obj.tax = $kGridExpand.data("kendoGrid").dataSource.data();
                    obj.type = ts.find('.k-state-active').attr("data-search");
                    obj.total_number = jQuery('#quantity_total').html();
                    obj.total_amount = jQuery('#amount_total').html();
                    jQuery("#tabs_anim").find("li").each(function () {
                        var key = jQuery(this).attr("id");
                        var bh = GetAllDataForm("#"+key, 2);
                        if (jQuery(".uk-tab").find("li[data-tabs='" + key + "']").css("display") !== "none") {
                            obj[key + '_active'] = 1;
                            jQuery.each(bh.columns, function (k, col) {
                                if (col.null === true && !jQuery("#"+key).find('input[name="' + col.field + '"]').val()) {
                                    crit = false;
                                    return false;
                                } else {
                                    crit = true;
                                }

                                if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                                    if (jQuery("#" + key).find('input[name="' + col.field + '"]').hasClass('number-price') || jQuery("#" + key).find('input[name="' + col.field + '"]').hasClass('number')) {
                                        obj[key + '_' + col.field] = jQuery("#" + key).find('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
                                    } else {
                                        obj[key + '_' + col.field] = jQuery("#" + key).find('input[name="' + col.field + '"]').val().trim();
                                        if (col.type === 'date') {
                                            obj[key + '_' + col.field] = formatDateDefault(obj[key + '_' + col.field]);
                                        }
                                    }

                                } else if (col.key === 'select' && jQuery("#" + key).find('select[name = ' + col.field + ']').hasClass("droplist")) {
                                    obj[key + '_' + col.field] = jQuery("#" + key).find('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
                                } else if (col.key === 'select' && jQuery("#" + key).find('select[name = ' + col.field + ']').hasClass("multiselect")) {
                                    var arr = jQuery("#" + key).find('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                                    obj[key + '_' + col.field] = arr.join();
                                } else if (col.key === 'textarea') {
                                    obj[key + '_' + col.field] = jQuery("#" + key).find('textarea[name="' + col.field + '"]').val();
                                } else if (col.key === 'checkbox') {
                                    if (jQuery("#" + key).find('input[name="' + col.field + '"]').parent().hasClass('checked')) {
                                        if (col.type === 'boolean') {
                                            obj[key + '_' + col.field] = true;
                                        } else if(col.type === 'number'){
                                            obj[key + '_' + col.field] = 1;
                                        }else {
                                            obj[key + '_' + col.field] = '1';
                                        }
                                    } else {
                                        if (col.type === 'boolean') {
                                            obj[key + '_' + col.field] = false;
                                        }else if(col.type === 'number'){
                                            obj[key + '_' + col.field] = 0;
                                        } else {
                                            obj[key + '_' + col.field] = '0';
                                        }
                                    }
                                } else if (col.key === 'radio') {
                                    obj[key + '_' + col.field] = jQuery("#" + key).find('input[name="' + col.field + '"]:checked').val();
                                }
                            });

                        } else {
                            obj[key + '_active'] = 0;
                        }

                    })
                    if (crit === true) {
                        if (obj.detail.length > 0) {
                            var postdata = { data: JSON.stringify(obj) };
                            RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
                                if (result.status === true) {
                                    initStatus(2);
                                    initActive("1");
                                    jQuery.each(result.voucher_name, function (k, v) {
                                        jQuery("#" + v.key).find("input[name='voucher']").val(v.voucher);
                                    })
                                    var grid = $kGrid.data("kendoGrid");
                                    ds = new kendo.data.DataSource({ data: result.detail,  schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
                                    grid.setDataSource(ds);
                                    var grid_expand = $kGridExpand.data("kendoGrid");
                                    ds = new kendo.data.DataSource({ data: result.tax,  schema: { model: { fields: Ermis.field_expand } }, aggregate: Ermis.aggregate_expand });
                                    grid_expand.setDataSource(ds);
                                    localStorage.dataId = result.dataId;
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

    var initAdd = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.a) {
                initStatus(1);
                localStorage.removeItem('dataID');
            } else {
                kendo.alert(transText.you_not_permission_add);
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
                        var dataId = localStorage.dataId;
                        var postdata = { data: JSON.stringify(dataId)};
                        RequestURLWaiting(Ermis.link+'-Delete', 'json', postdata, function (result) {
                            if (result.status === true) {
                                var current = localStorage.current;
                                delete storedarrId[current];
                                storedarrId.sort();
                                if (storedarrId.length > 0) {
                                    storedarrId.length = storedarrId.length - 1;
                                }
                            }else{
                              kendo.alert(result.message);
                            }
                        }, true);
                        if (storedarrId.length > 0) {
                            localStorage.current = 0;
                            localStorage.dataId = storedarrId[localStorage.current];
                            dataId = localStorage.dataId;
                            initLoadData(dataId);
                        } else {
                            initStatus(4);
                        }
                    }
                });
            } else {
                kendo.alert(transText.you_not_permission_delete);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initEdit = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.e) {
                initStatus(3);
            } else {
                kendo.alert(transText.you_not_permission_edit);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initCancel = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                if (confirmed) {
                    if (localStorage.dataId) {
                        var dataId = localStorage.dataId;
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
            obj.id = localStorage.dataId;
            obj.voucher = jQuery(this).attr('data-id');
            var postdata = { data: JSON.stringify(obj) };
            RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
                if (result.status === true) {
                    var decoded = $("<div/>").html(result.print_content).text();
                    if (result.detail_content) {
                        decoded = decoded.replace('<tr class="detail_content"></tr>', result.detail_content);
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
        if (localStorage.arrId) {
            storedarrId = JSON.parse(localStorage.arrId);
            return storedarrId;
        }
    };
    var initBack = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (localStorage.current > 0) {
                localStorage.current = parseInt(localStorage.current) - 1;
                var dataId = storedarrId[localStorage.current];
                localStorage.dataId = dataId;
                initLoadData(dataId);
            } else {
                jQuery('.back').addClass('disabled');
            }
            jQuery('.forward').removeClass('disabled');
        }
        jQuerylink.data('lockedAt', +new Date());
    };
    var initForward = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (localStorage.current < storedarrId.length - 1) {
                localStorage.current = parseInt(localStorage.current) + 1;
                var dataId = storedarrId[localStorage.current];
                localStorage.dataId = dataId;
                initLoadData(dataId);
            } else {
                jQuery('.forward').addClass('disabled');
            }
            jQuery('.back').removeClass('disabled');
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initClick = function (e) {
        jQuery("#page_content_inner").not("#grid").click(function (e) {
            $kGrid.find(" tbody tr").removeClass("k-state-selected");
            if (jQuery(e.target).closest('#grid').length) {
                return false;
            } else if (jQuery('.k-grid-edit-row').length > 0) {
                //$kGrid.data("kendoGrid").cancelChanges(); // CLOSE ALL
                //$kGrid.data("kendoGrid").closeCell();
                $kGrid.data("kendoGrid").cancelRow();
            }
        });
    };

    var initKeyCode = function () {
        jQuery(document).keyup(function (e) {
            var tabStrip = ts.find('.k-state-active');
            var grid = '';
            if (jQuery(tabStrip).attr('id') === 'item') {
                grid = $kGrid.data("kendoGrid");
                $kGrid.find(" tbody tr").removeClass("k-state-selected");
                if (e.keyCode === 13) {
                    grid.addRow();
                } else if (e.keyCode === 27) {
                    grid.cancelChanges();
                }
            } else if (jQuery(tabStrip).attr('id') === 'tax') {
                grid = $kGridExpand.data("kendoGrid");
                $kGridExpand.find(" tbody tr").removeClass("k-state-selected");
                if (e.keyCode === 13) {
                    grid.addRow();
                } else if (e.keyCode === 27) {
                    grid.cancelChanges();
                }
            }

        });
    };

    var initChoose = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($kGridSubject.find('tr.k-state-selected').length > 0) {
                var grid = $kGridSubject.data("kendoGrid");
                var dataItem = grid.dataItem($kGridSubject.find('tr.k-state-selected'));
                $kWindow.close();
                jQuery.each(Ermis.columns_subject, function (i, v) {
                    jQuery('#form-action').find('input[name="' + v.field + '"]').val(dataItem[v.field]);
                });
            } else {
                kendo.alert(transText.please_select_line_choose);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };


    var initClose = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($kWindow.element.is(":hidden") === false) {
                $kWindow.close();
            } else if ($kWindow2.element.is(":hidden") === false) {
                $kWindow2.close();
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    calculatePriceAggregate = function () {
        var grid = $kGrid.data("kendoGrid");
        var data = grid.dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            var check = data[i].price.toString().indexOf(",");
            if (data[i].price !== 0 && check !== -1) {
                data[i].price = data[i].price.replace(",", "");
            }
            if (data[i].quantity > 0) {
                total += data[i].quantity * data[i].price;
            }
        }
        return kendo.toString(total, 'n0');
    };

    calculatePriceBind = function (data) {
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].quantity > 0) {
                var a = data[i].price;
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
            price = price.replace(",", "");
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

    PriItemsDropDownEditor = function (container, options) {
        jQuery('<input required id="' + options.field + '" class="dropdown-list" name="' + options.field + '"/>')
               .appendTo(container)
               .kendoDropDownList({
                   filter: "contains",
                   dataTextField: "code",
                   dataValueField: "id",
                   optionLabel: "---SELECT---",
                   select: Onchange,
                   headerTemplate: '<div class="dropdown-header k-widget k-header">' +
                                 '<span>Code</span>' +
                                 '<span>Name</span>' +
                             '</div>',
                   template: '<span class="k-state-default">#: data.code #</span> - ' +
                         '<span class="k-state-default">#: data.name #</span>',
                   dataSource: {
                       type: "odata",
                       data: eval(a[options.field])
                   }
               });
    };

    SleItemsDropDownEditor = function (container, options) {
        jQuery('<input required id="' + options.field + '" class="dropdown-list" name="' + options.field + '"/>')
               .appendTo(container)
               .kendoDropDownList({
                   filter: "contains",
                   dataTextField: "code",
                   dataValueField: "id",
                   optionLabel: "---SELECT---",
                   select: OnchangeCancel,
                   headerTemplate: '<div class="dropdown-header k-widget k-header">' +
                                 '<span>Code</span>' +
                                 '<span>Name</span>' +
                             '</div>',
                   template: '<span class="k-state-default">#: data.code #</span> - ' +
                         '<span class="k-state-default">#: data.name #</span>',
                   dataSource: {
                       type: "odata",
                       data: eval(a[options.field])
                   }
               });
    };

    ItemsDropDownEditor = function (container, options) {
        jQuery('<input required id="' + options.field + '" class="dropdown-list" name="' + options.field + '"/>')
             .appendTo(container)
             .kendoDropDownList({
                 select: function (e) {
                     var select = this.dataItem(e.item);
                     if (select.id === "") {
                         $kGrid.data("kendoGrid").closeCell();
                     }
                 },
                 filter: "contains",
                 dataTextField: "code",
                 dataValueField: "id",
                 optionLabel: "---SELECT---",
                 headerTemplate: '<div class="dropdown-header k-widget k-header">' +
                               '<span>Code</span>' +
                               '<span>Name</span>' +
                           '</div>',
                 template: '<span class="k-state-default"> #:data.code #</span> - ' +
                       '<span class="k-state-default">#: data.name #</span>',
                 dataSource: {
                     type: "odata",
                     data: eval(a[options.field])
                 }
             });
    };
    getItemName = function (ID, data, field) {
        var value = '';
        b = field;
        a[b] = data;
        if (ID > 0 || ID != "") {
            var result = $.grep(eval(a[b]), function (n, i) {
                return n.id === ID.toString();
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

        init: function () {
            //initGetColunm();
            initVoucherMasker();
            initCheckSession();
            initTabsTrip();
            initKendoGrid();
            initKendoGridExpand();
            initKendoDatePicker();
            initKendoUiDropList();
            initStatus(status);
            initClick();
            initKeyCode();
            initKendoUiDialog();
            initKendoGridSubject();
            initSearchGridSubject();
            initKendoUiContextMenu();
            initKendoUiContextMenuGrid();
            initKendoUiDropListDate();
            initKendoGridReference();
            initGetDataReference();
            initKendoEndDatePicker();
            initKendoStartDatePicker();
            initChangePayment();
            initBindData();
            initGetStoredArrId();
            initKendoUiDropListPaymentList();

        }

    };

}();


jQuery(document).ready(function () {
    Ermis.init();
});
