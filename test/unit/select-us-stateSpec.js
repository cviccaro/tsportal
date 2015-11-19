'use strict';

describe('tsportal.select-us-state', function() {
	var $rootScope, $compile, element;

	beforeEach(function() {

		module('tsportal.select-us-state');

		inject(function(_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$compile = _$compile_;
		});
	});

	describe('select-us-stateDirective', function() {
		it ('should replace directive with appropriate content', function() {
			element = $compile('<ang-select-usstates class="form-control" name="state" ng-model="state"></ang-select-usstates>')($rootScope);
			$rootScope.$digest();
			// check for a few states
			expect(element.html()).toContain('<option label="California" value="string:CA">California</option>');
			expect(element.html()).toContain('<option label="Ohio" value="string:OH">Ohio</option>');
			expect(element.html()).toContain('<option label="North Dakota" value="string:ND">North Dakota</option>');
			expect(element.html()).toContain('<option label="Pennsylvania" value="string:PA">Pennsylvania</option>');
		});
	});
});