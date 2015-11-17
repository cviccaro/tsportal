'use strict';

describe('tsportal.pager', function() {
	var $rootScope, $compile, $httpBackend;

	var pagerHtml = '<ul class="pagination">';
    pagerHtml += '<li ng-show="currentPage != 1"><a href="javascript:void(0)" ng-click="getResults({num:1})">&laquo;</a></li>';
    pagerHtml += '<li ng-show="currentPage != 1"><a href="javascript:void(0)" ng-click="getResults({num:currentPage-1})">&lsaquo; Prev</a></li>';
    pagerHtml += '<li ng-repeat="i in getRange(totalPages) track by $index" ng-class="{active : currentPage-1 == $index}">';
    pagerHtml += '<a href="javascript:void(0)" ng-click="getResults({num:$index+1})">{{$index + 1}}</a>';
    pagerHtml += '</li>';
    pagerHtml += '<li ng-show="currentPage != totalPages"><a href="javascript:void(0)" ng-click="getResults({num:currentPage+1})">Next &rsaquo;</a></li>';
    pagerHtml += '<li ng-show="currentPage != totalPages"><a href="javascript:void(0)" ng-click="getResults({num:totalPages})">&raquo;</a></li>';
	pagerHtml += '</ul>';

	beforeEach(function() {
		module('tsportal.pager');
		inject(function(_$rootScope_, _$compile_, _$httpBackend_) {
			$rootScope = _$rootScope_;
			$compile = _$compile_;
			$httpBackend = _$httpBackend_;
		});
	});

	describe('pagerDirective', function() {
		it ('should replace content with template and set isolateScope variables', function() {
			$rootScope.currentPage = 1;
			$rootScope.totalPages = 3;
			$rootScope.getResults = function(num) {
				console.log(num);
			};
			var element = $compile('<pager current-page="currentPage" total-pages="totalPages" get-results="getResults(num)"></pager>')($rootScope);
			$httpBackend.expectGET('../views/pagerView.html').respond(pagerHtml);
			$httpBackend.flush();
			$rootScope.$digest();
			expect(element.isolateScope().currentPage).toEqual(1);
			expect(element.isolateScope().totalPages).toEqual(3);

			// Should react to model change
			$rootScope.currentPage = 2;
			$rootScope.$digest();
			expect(element.isolateScope().currentPage).toEqual(2);
			expect(element.html()).toContain('<a href="javascript:void(0)" ng-click="getResults({num:$index+1})" class="ng-binding">3</a></li><!-- end ngRepeat: i in getRange(totalPages) track by $index -->');
		});
	});
});