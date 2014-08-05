/*=====================================================================
 Author: David Miranda - @davemiranda
 License: MIT (http://opensource.org/licenses/mit-license.php)

 Description: KnockoutJS binding for expanding and collapsing elements.
 ======================================================================*/

(function (factory) {
    // Module systems magic dance.  Thanks KO validation team!

    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node: hard-coded dependency on "knockout"
        factory(require("knockout"), exports);
    } else if (typeof define === "function" && define["amd"]) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout", "exports"], factory);
    } else {
        // <script> tag: use the global 'ko' object, attaching a 'mapping' property
        factory(ko);
    }
}(function (ko) {

    function ExpanderModel(element, config) {
        var expander = this,
            $expander = $(element),
            $content = null,
            $expand = null,
            $collapse = null,
            expanded = false;

        config = $.extend(true, {
            name: '',
            template: null,
            collapsedHeight: 0,
            animate: {
                animate: 'swing',
                duration: 400
            }
        }, config);

        if (config.template) {
            // Transclude the innerHTML of the expander element into the requested template's data-expander-content element.
            var innerHTML = element.innerHTML;
            $expander.html($('#' + config.template).html());
            $expander.find('[data-expander-content]').eq(0).html(innerHTML);
        }

        var collapsedHeight = config.collapsedHeight;
        var collapsedHeightPx = collapsedHeight + 'px';

        var expandAnimate = $.extend({
            complete: function () {
                $content.css('max-height', 'none');
            }
        }, config.animate);

        function expand() {
            $expander.addClass('expanded').removeClass('collapsed');
            $expand.hide();
            $collapse.show();
            $content.stop(true, false).animate({
                'max-height': $content[0].scrollHeight + 'px'
            }, expandAnimate);
            expanded = true;
        }

        function collapse(instant) {
            $expander.addClass('collapsed').removeClass('expanded');
            $collapse.hide();
            $expand.show();
            if (instant) {
                $content.css('max-height', collapsedHeightPx);
            } else {
                $content.css('max-height', $content[0].scrollHeight + 'px');
                $content.stop(true, false).animate({
                    'max-height': collapsedHeightPx
                }, config.animate);
            }
            expanded = false;
        }

        function toggle() {
            expanded ? collapse() : expand();
        }

        /**
         * Called after Knockout renders this element and its contents.  Allows for binding
         * to child elements not present until after Knockout evaluates.
         */
        expander.elementReady = function () {
            $content = $expander.find('[data-expander-content]').eq(0);
            var $toggles = $expander.find('[data-expander-toggles]').eq(0);
            $expand = $toggles.find('[data-expander-expand]').eq(0);
            $collapse = $toggles.find('[data-expander-collapse]').eq(0);
            var $toggle = $toggles.find('[data-expander-toggle]').eq(0);

            $expander.addClass('expander');
            $content.addClass('contents');

            if (element.offsetHeight > config.collapsedHeight) {
                $content.css({'max-height': collapsedHeightPx});

                $expand.click(function (e) {
                    e.preventDefault();
                    expand();
                });

                $collapse.click(function (e) {
                    e.preventDefault();
                    collapse();
                });

                $toggle.click(function (e) {
                    e.preventDefault();
                    toggle();
                });

                collapse(true);

            } else {
                $toggles.hide();
            }
        };
    }

    ko.bindingHandlers.expander = {
        init: function (element, valueAccessor) {
            var config = valueAccessor() || {};

            var expander = new ExpanderModel(element, config);

            setTimeout(function () {
                expander.elementReady && expander.elementReady();
            }, 1);
        }
    };

}));