var Lang = function () {

    var initLanguage = function () {
        jQuery('#lang_switcher').on('change', function () {
            var val = jQuery(this).val();
            var url = Lang.lang_url[val];
            document.location.href = url;
        });
    };

    return {

        init: function () {
            initLanguage();
        }

    };

}();

jQuery(document).ready(function () {
    Lang.init();
});