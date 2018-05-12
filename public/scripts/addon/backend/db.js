var Ermis = function () {
    var end; var start;
    var data = [];

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

    var initGetColunm = function () {
        data = GetAllDataForm('#form-search');
        return data;
    };

    var initSync = function (e) {
        jQuery('.sync').on('click', function () {
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
            RequestURLWaiting(Ermis.link+'-sync', 'json', postdata, function (result) {
                kendo.alert(result.message)
            }, true);
        })

    };

    return {

        init: function () {
            initKendoStartDatePicker();
            initKendoEndDatePicker();
            initHideShow();
            initSync();
            initGetColunm();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
