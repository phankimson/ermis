var Barcode = function () {
    var data = [
                     { type: 'EAN8', value: "1234567" },
                     { type: 'EAN13', value: "123456789987" },
                     { type: 'UPCE', value: "123456" },
                     { type: 'UPCA', value: "12345678998" },
                     { type: 'Code11', value: "1234567" },
                     { type: 'Code39', value: "HELLO" },
                     { type: 'Code39Extended', value: "Hi!" },
                     { type: 'Code128', value: "Hello World!" },
                     { type: 'Code93', value: "HELLO" },
                     { type: 'Code93Extended', value: "Hello" },
                     { type: 'Code128A', value: "HELLO" },
                     { type: 'Code128B', value: "Hello" },
                     { type: 'Code128C', value: "123456" },
                     { type: 'MSImod10', value: "1234567" },
                     { type: 'MSImod11', value: "1234567" },
                     { type: 'MSImod1010', value: "1234567" },
                     { type: 'MSImod1110', value: "1234567" },
                     { type: 'GS1-128', value: "12123456" },
                     { type: 'POSTNET', value: "12345" }
    ];
    var setOptions = function(e){
        var barcode = $('#barcode').data('kendoBarcode');
        var type = jQuery('select[name="code"]').kendoDropDownList('value');
        var checksum = jQuery('input[name="show_checksum"]').parent().hasClass('checked');
        var showtext = jQuery('input[name="show_text"]').parent().hasClass('checked');
        var obj = jQuery.grep(data, function (obj) {
            return obj.type === type;
        });
        var value = obj[0].value;
        if (value) {
            barcode.setOptions({
                value: value,
                checksum: checksum,
                text: {
                    visible: showtext
                },
                type: type
            })
        } else {
            jQuery('#notification').EPosMessage('error', 'Bạn chưa chọn mẫu barcode');
        }
    }
    var initBarcode = function () {
        jQuery("#barcode").kendoBarcode({
            value: "1234567",
            type: "ean8",
            background: "transparent"
        });
    }


    return {

        init: function () {
            initBarcode();
            jQuery('select[name="code"]').change(setOptions);
        }

    };

}();

jQuery(document).ready(function () {
    Barcode.init();
});
