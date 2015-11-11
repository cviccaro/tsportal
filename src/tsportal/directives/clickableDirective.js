(function() {

    'use strict';

    angular.module('tsportalDirectives')
        .directive("clickable", clickableDirective);

    function clickableDirective() {
        var directive = {
            restict: 'A',

            link: clickableDirectiveLink
        };

        return directive;

        /////////
    
        function clickableDirectiveLink(scope, elem, attrs) {
            elem.addClass("clickable");
            elem.on("click", function($event) {
                if (navigator.userAgent.match(/PhantomJS/g) === null) {
                    elem.siblings().removeClass('active');
                    elem.addClass("active");
                }
            });
        }
    }
})();
