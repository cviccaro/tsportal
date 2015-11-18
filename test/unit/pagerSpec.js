'use strict';

describe('tsportal.pager', function() {
	var $rootScope, $compile, $httpBackend;

	beforeEach(function() {
		module('tsportal.pager');
		module('templates');
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

			$rootScope.$digest();
			expect(element.isolateScope().currentPage).toEqual(1);
			expect(element.isolateScope().totalPages).toEqual(3);

			// Should react to model change
			$rootScope.currentPage = 2;
			$rootScope.$digest();
			expect(element.isolateScope().currentPage).toEqual(2);
			expect(element.html()).toContain('<a href="javascript:void(0)" ng-click="getResults({num:$index+1})" class="ng-binding">3</a>');
		});
	});
});