(function() {

    'use strict';

    angular.module('tsportal.clickable')
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
                elem.siblings().removeClass('active');
                elem.addClass("active");
            });
        }
    }
})();
