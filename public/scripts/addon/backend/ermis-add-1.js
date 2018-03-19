var ErmisAdd1 = function () {
    var myWindow = jQuery("#form-window-caculation");
    var $kWindow = '';
    var $item = "";
    var initKendoUiDialog = function () {
        $kWindow = myWindow.kendoWindow({
            width: "400px",
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
        $kWindow.title("Công thức");
    };
    initAddItem = function () {
        jQuery(".add-item").click(function () {
            var v = jQuery(this).attr("data-add");
            var vl = $item.val();
            $item.val(vl + v);
        })
    }

    var initFocusCaculation = function () {
        jQuery(".caculation").click(function () {
            $kWindow.open();
            $item = jQuery(this).parent().find("input");
        })
    }
    var initKendoButton = function () {
        $(".k-primary").kendoButton();
    }

    return {

        init: function () {
            initKendoUiDialog();
            initKendoButton();
            initFocusCaculation();
            initAddItem();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd1.init();
});
