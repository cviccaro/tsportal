'use strict';

describe('tsportal.timeago', function() {
	describe('timeagoDirective', function () {

		var $rootScope, $compile, element;

		var isoFormat = 'YYYY-MM-DD HH:mm:ss';

		beforeEach(function() {
			module('tsportal.timeago');

			inject(function(_$compile_, _$rootScope_) {
				$rootScope = _$rootScope_;
				$compile = _$compile_;
			});
		});

		it('should replace content with proper timeago span tag for just now', function() {
			$rootScope.time = moment().format(isoFormat);

			element = $compile('<timeago time="time"></timeago>')($rootScope);
			spyOn(element.isolateScope(), "getTimeAgo").and.callThrough();

			$rootScope.$digest();

			expect(element.html()).toEqual('<span class="time-ago ng-binding">a few seconds ago</span>');
			expect(element.isolateScope().getTimeAgo).toHaveBeenCalledWith($rootScope.time);
		});
		it('should replace content with proper timeago span tag for last week', function() {
			$rootScope.time = moment().subtract(7, 'days').format(isoFormat);

			element = $compile('<timeago time="time"></timeago>')($rootScope);
			spyOn(element.isolateScope(), "getTimeAgo").and.callThrough();

			$rootScope.$digest();

			expect(element.html()).toEqual('<span class="time-ago ng-binding">7 days ago</span>');
			expect(element.isolateScope().getTimeAgo).toHaveBeenCalledWith($rootScope.time);
		});
	});
});