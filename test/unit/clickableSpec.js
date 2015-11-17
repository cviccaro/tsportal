'use strict';

describe('tsportal.clickable', function() {
	describe('clickableDirective', function () {

		var $rootScope, $compile, element;

		beforeEach(function() {
			module('tsportal.clickable');

			inject(function(_$compile_, _$rootScope_) {
				$rootScope = _$rootScope_;
				$compile = _$compile_;
			});
			element = $compile('<div clickable>test</div>')($rootScope);
			$rootScope.$digest();
		});

		it('should add class clickable to anything with attribute clickable', function() {
			expect(element.attr('class')).toContain('clickable');
		});
		it('should add class active when clicked', function() {
			element.click();
			expect(element.attr('class')).toContain('active');
		});
	});
});