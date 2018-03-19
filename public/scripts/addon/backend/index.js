var Index = function () {
    var btnChange = function (e) {
        jQuery(".change-map").on("click", function () {
            jQuery("#all").hide();
            jQuery(".md-card").hide();
            var href = jQuery(this).attr("data-id");
            jQuery(href).fadeIn(1000);
        })
    };

    var btnBack = function (e) {
        jQuery(".back").on("click", function () {
            jQuery(".md-card").hide();
            jQuery("#all").fadeIn(1000);
        })
    };

    var initCircle = function () {
        var type = 1, //circle type - 1 whole, 0.5 half, 0.25 quarter
                    radius = '270px', //distance from center
                    start = -50, //shift start from 0
                    $elements = $("#all").find('dd:not(:first-child)'),
                    numberOfElements = (type === 1) ? $elements.length : $elements.length - 1, //adj for even distro of elements when not full circle
                    slice = 360 * type / numberOfElements;

        $elements.each(function (i) {
            var $self = $(this),
                rotate = slice * i + start,
                rotateReverse = rotate * -1;

            $self.css({
                'transform': 'rotate(' + rotate + 'deg) translate(' + radius + ') rotate(' + rotateReverse + 'deg)'
            });
        });


    }

    return {

        init: function () {
            initCircle();
            btnChange();
            btnBack();
        }

    };

}();

jQuery(document).ready(function () {
    Index.init();
});