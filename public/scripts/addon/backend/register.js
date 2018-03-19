var Register = function () {
    jQuery('input[name="username"],input[name="password"]').keypress(function (e) {
        if (e.which === 13) {
            btnLogin(e);
            return false;    //<---- Add this line
        }
    });

    var btnLogin = function (e) {
        e.preventDefault();
        var data = GetAllValueForm('.login-form');
        var postdata = { data: JSON.stringify(data) };
        RequestURLWaiting('register', 'json', postdata, function (result) {
            if (result.status === true) {
                window.location.href = 'index';
            } else {
                jQuery('#notification').EPosMessage('error', result.message);
            }
        }, true);
    };

    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains"
        });
    };

    return {

        init: function () {
            jQuery('#button_register').on('click ', btnLogin);
            initKendoUiDropList();
        }

    };

}();

jQuery(document).ready(function () {
    Register.init();
});
