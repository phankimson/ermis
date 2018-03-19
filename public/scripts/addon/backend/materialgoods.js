var MaterialGoods = function () {
    var initStatusType = function (status) {
        jQuery('input').not('[type=radio]').val("");
        if (status === "1") {
            jQuery('.tp-content').hide();
            jQuery('.sv-content').show();
        } else if (status === "2") {
            jQuery('.sv-content').show();
            jQuery('.tp-content').show();
        } else if (status === "3") {
            jQuery('.sv-content').hide();
            jQuery('.tp-content').hide();
        }
    };
    var initTotal = function () {
            var sum = 0;
            jQuery('.sum-total').each(function () {
                sum += Number(jQuery(this).val());
            });
            jQuery('#total').val(sum);
    };
    var initChangeStatus = function () {
        jQuery(".droplist[name='nature']").on("change", function () {
            var type = jQuery(this).val();
            initStatusType(type);
        });

    };

    return {

        init: function () {
            initStatusType("1");
            initChangeStatus();
            jQuery('input.sum-total').on("blur",initTotal);
        }

    };

}();

jQuery(document).ready(function () {
    MaterialGoods.init();
});
