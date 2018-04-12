var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var $kGridSubject = jQuery('#grid_subject');
    var $kGridReference = jQuery('#grid_reference');
    var $kGridTeacher = jQuery('#grid_teacher');
    var $kGridEmployee = jQuery('#grid_employee');
    var key = 'Alt+';
    var myWindow = jQuery("#form-window-filter");
    var $kWindow = '';
    var myWindow2 = jQuery("#form-window-reference");
    var $kWindow2 = '';
    var myWindow3 = jQuery("#form-window-advance-employee");
    var $kWindow3 = '';
    var myWindow4 = jQuery("#form-window-advance-teacher");
    var $kWindow4 = '';
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
                initActive(result.general.active);
                jQuery.each(data.columns, function (k, col) {
                    if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                        if (col.type === 'date') {
                            jQuery('input[name="' + col.field + '"]').val(kendo.toString(kendo.parseDate(result.general[col.field], 'yyyy-mm-dd'), 'dd/MM/yyyy'));
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
                if ($kGridTeacher.length > 0 && $kGridEmployee.length > 0) {
                    jQuery('input[name="advance_teacher"]').val(result.general.advance_teacher);
                    jQuery('input[name="advance_employee"]').val(result.general.advance_employee);
                }
                var grid = $kGrid.data("kendoGrid");
                ds = new kendo.data.DataSource({ data: result.detail, schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
                grid.setDataSource(ds);
                $kGrid.addClass('disabled');
                calculatePriceBind(result.detail);
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

    var initVoucherMasker = function () {
        var data = Ermis.voucher;
        var char = 'x';
        var number = parseInt(data.length_number);
        if (data.suffixes) {
            voucher = data.prefix + char.repeat(number) + data.suffixes;
        } else {
            voucher = data.prefix + char.repeat(number);
        }
    };

    var initCheckSession = function () {
        if (!sessionStorage.status) {
            status = 1;
        } else {
            status = parseInt(sessionStorage.status);
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
        $('#header-chb').change(function(ev){
            var checked = ev.target.checked;
            $('#header-chb').find('.k-checkbox').each(function (idx, item) {
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

        $(".choose_reference").bind("click", function () {
            var checked = [];
            for(var i in checkedIds){
                if(checkedIds[i]){
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

    var initKendoGridAdvanceEmployee = function () {
        if ($kGridEmployee.length > 0) {
            var grid = $kGridEmployee.kendoGrid({
                dataSource: {
                    data: []
                },
                height: jQuery(window).height() * 0.5,
                sortable: true,
                pageable: {
                    pageSize: 6,
                    change: function (e) {
                        var checked = jQuery('#header-chb-employee').is(':checked');
                        $('.k-checkbox.employee').not('#header-chb-employee').each(function (idx, item) {
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
                    }
                },
                filterable: true,
                columns: Ermis.columns_advance_employee
            }).data("kendoGrid");

            grid.thead.kendoTooltip({
              filter: "th",
              content: function (e) {
                  var target = e.target; // element for which the tooltip is shown
                  return $(target).text();
              }
            });

            grid.table.on("click", ".k-checkbox.employee", selectRowEmployee);
            //bind click event to the checkbox
            //grid.table.on("click", ".k-checkbox" , selectRow);
            $('#header-chb-employee').change(function (ev) {
                var checked = ev.target.checked;
                $('.k-checkbox.employee').each(function (idx, item) {
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


            $(".choose-employee").bind("click", function () {
                var checked = [];
                for (var i in checkedIds) {
                    if (checkedIds[i]) {
                        checked.push(i);
                    }
                }
                $kWindow3.close();
                jQuery("input[name='advance_employee']").val(checked);
            });
            var checkedIds = {};
            //on click of the checkbox:
            function selectRowEmployee() {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $kGridEmployee.data("kendoGrid"),
                    dataItem = grid.dataItem(row);
                    checkedIds[dataItem.ID] = checked;

                if (checked) {
                    //-select the row
                    row.addClass("k-state-selected");
                } else {
                    //-remove selection
                    row.removeClass("k-state-selected");
                }
            }


        }

    };


    var initKendoGridAdvanceTeacher = function () {
        if ($kGridTeacher.length > 0) {
            var grid = $kGridTeacher.kendoGrid({
                dataSource: {
                    data: []
                },
                height: jQuery(window).height() * 0.5,
                sortable: true,
                pageable: {
                    pageSize: 6,
                    change: function (e) {
                        var checked = jQuery('#header-chb-teacher').is(':checked');
                        $('.k-checkbox.teacher').not('#header-chb-teacher').each(function (idx, item) {
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
                    }
                },
                filterable: true,
                columns: Ermis.columns_advance_teacher
            }).data("kendoGrid");

            grid.thead.kendoTooltip({
              filter: "th",
              content: function (e) {
                  var target = e.target; // element for which the tooltip is shown
                  return $(target).text();
              }
          });

            grid.table.on("click", ".k-checkbox.teacher", selectRowTeacher);
            //bind click event to the checkbox
            //grid.table.on("click", ".k-checkbox" , selectRow);
            $('#header-chb-teacher').change(function (ev) {
                var checked = ev.target.checked;
                $('.k-checkbox.teacher').not('#header-chb-teacher').each(function (idx, item) {
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


            $(".choose-teacher").bind("click", function () {
                var checked = [];
                for (var i in checkedIds) {
                    if (checkedIds[i]) {
                        checked.push(i);
                    }
                }
                $kWindow4.close();
                jQuery("input[name='advance_teacher']").val(checked);
            });
            var checkedIds = {};
            //on click of the checkbox:
            function selectRowTeacher() {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $kGridTeacher.data("kendoGrid"),
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
        }

    };



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
            columns: Ermis.columns,
            navigatable: true
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
        jQuery('.add,.edit,.delete,.back,.forward,.print,.cancel,.save,.choose,.cancel-window,.filter,.reference,.write_item,.unwrite_item,.advance_teacher,.advance_employee').addClass('disabled');
        jQuery('.add,.edit,.delete,.back,.forward,.print-item,.cancel,.save,.choose,.cancel-window,.filter,.reference,.write_item,.unwrite_item,.advance_teacher,.advance_employee').off('click');
        jQuery('input,textarea').not('.header_main_search_input').not('#files').not('.k-filter-menu input').addClass('disabled');
        jQuery(".droplist").addClass('disabled');
        jQuery('input:checkbox').parent().addClass('disabled');
        jQuery('.date-picker').addClass('disabled');
        if (flag === 1) {//ADD
            jQuery('#add-top-menu-detail').show();
            sessionStorage.removeItem("dataId");
            jQuery('.cancel,.save,.choose,.cancel-window,.filter,.reference,.advance_teacher,.advance_employee').removeClass('disabled');
            jQuery('.cancel').on('click', initCancel);
            jQuery('.save').on('click', initSave);
            jQuery('.choose').on('click', initChoose);
            jQuery('.cancel-window').on('click', initClose);
            jQuery('.filter').on('click', initFilterForm);
            jQuery('.reference').on('click', initReferenceForm);
            jQuery('.advance_teacher').on('click', initTeacherForm);
            jQuery('.advance_employee').on('click', initEmployeeForm);
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
            jQuery('input,textarea').removeClass('disabled');
            jQuery('.k-button').removeClass('disabled');
            jQuery(".droplist").removeClass('disabled');
            jQuery('input:checkbox').parent().removeClass('disabled');
            jQuery('.date-picker,.month-picker').removeClass('disabled');
            jQuery('input[name!="__RequestVerificationToken"]').not('[type=radio]').not(".date-picker,.month-picker,.voucher").val("");
            jQuery(".date-picker").val(kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy'));
            jQuery(".voucher").val(voucher);
            $kGrid.data('kendoGrid').dataSource.data([]);
            $kGrid.removeClass('disabled');
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
        } else if (flag === 3) { //EDIT
            jQuery('#add-top-menu-detail').show();
            jQuery('.cancel,.save,.filter,.reference,.advance_teacher,.advance_employee').removeClass('disabled');
            jQuery('.cancel').on('click', initCancel);
            jQuery('.save').on('click', initSave);
            jQuery('.filter').on('click', initFilterForm);
            jQuery('.reference').on('click', initReferenceForm);
            jQuery('.advance_teacher').on('click', initTeacherForm);
            jQuery('.advance_employee').on('click', initEmployeeForm);
            jQuery('.cancel-window').on('click', initClose);
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
            jQuery('input,textarea').removeClass('disabled');
            jQuery('.k-button').removeClass('disabled');
            jQuery(".droplist").removeClass('disabled');
            jQuery('input:checkbox').parent().removeClass('disabled');
            jQuery('.date-picker,.month-picker').removeClass('disabled');
            $kGrid.removeClass('disabled');
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
            if (!sessionStorage.dataId) {
                jQuery('.print,.delete,.edit').addClass('disabled');
                jQuery('.print,.delete,.edit').off('click');
            }
            jQuery('input[name!="__RequestVerificationToken"]').not('[type=radio]').not(".date-picker,.month-picker,.voucher").val("");
            $kGrid.data('kendoGrid').dataSource.data([]);
            $kGrid.addClass('disabled');
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
            if (!sessionStorage.dataId) {
                jQuery('.print,.delete,.edit').addClass('disabled');
                jQuery('.print,.delete,.edit').off('click');
            }
        }
    };

    var initActive = function (active) {
        shortcut.remove(key + "W");
        shortcut.remove(key + "U");
        if (active === "1" || active == 1) {
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
        $kWindow3 = myWindow3.kendoWindow({
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
        $kWindow4 = myWindow4.kendoWindow({
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
        $kWindow.title("Tìm kiếm đối tượng");
        $kWindow2.title("Tham chiếu");
        $kWindow3.title("Ứng lương nhân viên");
        $kWindow4.title("Ứng lương giáo viên");
    };
    var initFilterForm = function () {
        $kWindow.open();
    };
    var initReferenceForm = function () {
        $kWindow2.open();
    };
    var initEmployeeForm = function () {
        $kWindow3.open();
    };
    var initTeacherForm = function () {
        $kWindow4.open();
    };
    var initGetDataEmployee = function () {
        jQuery('#search_data_employee').on('click', function () {
            var date = jQuery('input[name="date_month_employee"]').val();
            var postdata = { data: JSON.stringify(date) };
            RequestURLWaiting(Ermis.link+'-GetAdvanceEmployee', 'json', postdata, function (result) {
                if (result.status === true) {
                    var grid = $kGridEmployee.data("kendoGrid");
                    var ds = new kendo.data.DataSource({ data: result.data, pageSize: 6, schema: { model: { fields: Ermis.field_advance_employee } } });
                    grid.setDataSource(ds);
                    grid.dataSource.page(1);
                }else{
                  kendo.alert(result.message);
                }
            }, true);
        });
    };

    var initGetDataTeacher = function () {
        jQuery('#search_data_teacher').on('click', function () {
            var date = jQuery('input[name="date_month_teacher"]').val();
            var postdata = { data: JSON.stringify(date) };
            RequestURLWaiting(Ermis.link+'-GetAdvanceTeacher', 'json', postdata, function (result) {
                if (result.status === true) {
                    var grid = $kGridTeacher.data("kendoGrid");
                    var ds = new kendo.data.DataSource({ data: result.data, pageSize: 6, schema: { model: { fields: Ermis.field_advance_teacher } } });
                    grid.setDataSource(ds);
                    grid.dataSource.page(1);
                }else{
                  kendo.alert(result.message);
                }
            }, true);
        });
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

            var postdata = { data:JSON.stringify(obj) };

            RequestURLWaiting(Ermis.link+'-GetReference', 'json', postdata, function (result) {
                if (result.status === true) {
                    var grid = $kGridReference.data("kendoGrid");
                    var ds = new kendo.data.DataSource({ data: result.data, pageSize: 6, schema: { model: { fields: Ermis.field_reference } } });
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
                    var dataId = sessionStorage.dataId;
                    var postdata = { data:JSON.stringify(dataId) };
                    RequestURLWaiting(Ermis.link+'-write', 'json', postdata, function (result) {
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
                    var dataId = sessionStorage.dataId;
                    var postdata = { data: JSON.stringify(dataId) };
                    RequestURLWaiting(Ermis.link+'-unwrite', 'json', postdata, function (result) {
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
                    obj.id = sessionStorage.dataId;
                    obj.detail = $kGrid.data("kendoGrid").dataSource.data();
                    obj.type = jQuery('#tabstrip').find('.k-state-active').attr("data-search");
                    obj.total_number = ConvertNumber(jQuery('#quantity_total').html());
                    obj.total_amount = ConvertNumber(jQuery('#amount_total').html());
                    obj.advance_employee = jQuery("input[name='advance_employee']").val();
                    obj.advance_teacher = jQuery("input[name='advance_teacher']").val();
                    obj.subject_key = jQuery('input[name="filter_type"]:checked').val();
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
                                    sessionStorage.dataId = result.dataId;
                                    storedarrId.push(result.dataId);
                                    sessionStorage.arrId = JSON.stringify(storedarrId);
                                    initStatus(2);
                                    initActive("1");
                                    jQuery('.voucher').val(result.voucher_name);
                                    var grid = $kGrid.data("kendoGrid");
                                    ds = new kendo.data.DataSource({ data: result.detail, pageSize: 6, schema: { model: { fields: Ermis.field } }, aggregate: Ermis.aggregate });
                                    grid.setDataSource(ds);
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
            sessionStorage.removeItem('dataID');
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
                    var dataId = sessionStorage.dataId;
                    var postdata = { data: JSON.stringify(dataId) };
                    RequestURLWaiting(Ermis.link+'-delete', 'json', postdata, function (result) {
                        if (result.status === true) {
                          //var current = sessionStorage.current;
                          storedarrId = storedarrId.filter(function(e) { return e != parseInt(sessionStorage.dataId) })
                          //storedarrId.sort();
                          sessionStorage.arrId = JSON.stringify(storedarrId);
                          //if (storedarrId.length > 0) {
                          //    storedarrId.length = storedarrId.length - 1;
                          //}
                          if (storedarrId.length > 0) {
                              index =  index - 1;
                              var dataId = getAtIndex(index);
                              sessionStorage.dataId = dataId;
                              initLoadData(dataId);
                            } else {
                                sessionStorage.removeItem('dataId');
                                initStatus(4);
                            }
                        }else{
                          kendo.alert(result.message);
                        }
                    }, true);
                    //if (storedarrId.length > 0) {
                    //    sessionStorage.current = 0;
                    //    sessionStorage.dataId = storedarrId[sessionStorage.current];
                    //    dataId = sessionStorage.dataId;
                    //    initLoadData(dataId);
                    //} else {
                  //      sessionStorage.removeItem('dataId');
                  //      initStatus(4);
                  //  }
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
            var grid = $kGrid.data("kendoGrid");
            $kGrid.find(" tbody tr").removeClass("k-state-selected");
            if (e.keyCode === 13 && !$kGrid.hasClass('disabled')) {
                grid.addRow();
            } else if (e.keyCode === 27 && !$kGrid.hasClass('disabled')) {
                grid.cancelChanges();
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
            } else if ($kWindow3.element.is(":hidden") === false) {
                $kWindow3.close();
            } else if ($kWindow4.element.is(":hidden") === false) {
                $kWindow4.close();
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
            initVoucherMasker();
            initCheckSession();
            initTabsTrip();
            initKendoGrid();
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
            initKendoGridAdvanceTeacher();
            initGetDataTeacher();
            initKendoGridAdvanceEmployee();
            initGetDataEmployee();
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
