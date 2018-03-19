var Login = function () {
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
        RequestURLWaiting('Login', 'json', postdata, function (result) {
            if (result.status === true) {
                window.location.href = 'index';
            } else {
                jQuery('#notification').EPosMessage('error', result.message);
            }
        }, true);
    };
    var btnEmail = function (e) {
        e.preventDefault();
        var data = GetAllValueForm('.forget-form');
        var postdata = { data: JSON.stringify(data) };
        RequestURLWaiting('email/reset', 'json', postdata, function (result) {
            if (result.status === true) {
                jQuery('#notification').EPosMessage('success', result.message);
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
            jQuery('#button_login').on('click ', btnLogin);
            jQuery('#button_email').on('click ', btnEmail);
            initKendoUiDropList();
        }

    };

}();

jQuery(document).ready(function () {
    Login.init();
});
