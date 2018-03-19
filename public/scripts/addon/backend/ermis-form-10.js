var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var key = 'Alt+';
    var data = [];
    var dataId = '';
    var initGetColunm = function () {
        data = GetAllDataForm('#form-action');
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
    }


    var onChange = function () {
        var grid = this;
        var dataItem = grid.dataItem(grid.select());
        dataId = dataItem.id;
    };

    var initKendoButton = function () {
        jQuery("#kendoIconSave").kendoButton({
            icon: "calculator"
        });
        jQuery("#kendoIconSave").on("click", initSave);
        jQuery("#kendoIconDelete").kendoButton({
            icon: "close"
        });
        jQuery("#kendoIconDelete").on("click", initDelete);
    }

    var initSave = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.a) {
                    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                        if (confirmed) {
                            var obj = {};

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
                                    obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val().trim();
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
                            RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
                                if (result.status === true) {
                                    var grid = $kGrid.data("kendoGrid");
                                    grid.dataSource.insert(0, result.data);
                                    jQuery('#notification').EPosMessage('success', result.message);
                                } else {
                                    jQuery('#notification').EPosMessage('error', result.message);
                                }
                            }, true);
                        }
                    });
            } else {
                kendo.alert(transText.you_not_permission_delete);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initDelete = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.d) {
                if ($kGrid.find('.k-state-selected').length > 0) {
                    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                        if (confirmed) {
                            var postdata =  { data: JSON.stringify(dataId) };
                            RequestURLWaiting(Ermis.link+'-delete', 'json', postdata, function (result) {
                                if (result.status === true) {
                                    var grid = $("#grid").data("kendoGrid");
                                    grid.removeRow($kGrid.find('.k-state-selected'));
                                    jQuery('#notification').EPosMessage('success', result.message);
                                } else {
                                    jQuery('#notification').EPosMessage('error', result.message);
                                }
                            }, true);
                        }
                    });
                } else {
                    kendo.alert(transText.please_select_line_delete);
                }
            } else {
                kendo.alert(transText.you_not_permission_delete);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };


    var initKendoUiGridView = function () {
        var grid = $kGrid.kendoGrid({
            dataSource: {
                data: Ermis.data
            },
            selectable: "row",
            change: onChange,
            height: jQuery(window).height() * 0.75,
            groupable: true,
            sortable: true,
            pageable: false,
            filterable: true,
            columns: Ermis.columns,
            dataBound: function () {
                var rows = this.items();
                $(rows).each(function () {
                    var index = $(this).index() + 1;
                    var rowLabel = $(this).find(".row-number");
                    $(rowLabel).html(index);
                });
            }
        });
        grid.data('kendoGrid').thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
    };
    return {

        init: function () {
            initGetColunm();
            initKendoButton();
            initMonthDate();
            initKendoUiGridView();
        }

    };

}();
jQuery(document).ready(function () {
    Ermis.init();
});
