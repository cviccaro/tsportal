'use strict';
describe('tsportal.busyIndicator config', function() {
	var busyService, busyProvider, $rootScope;
	beforeEach(function() {
		var fakeModule = angular.module('test.tsportal.busy.config', []);
		fakeModule.config( function (busyServiceProvider) {
		    busyProvider = busyServiceProvider;
		});
		module('tsportal.busyIndicator');
		module('test.tsportal.busy.config');

		inject(function(_$rootScope_) {
			$rootScope = _$rootScope_;
		});

		busyService = busyProvider.$get($rootScope);
	});
	describe('busyServiceProvider', function() {
		it("should be able to set the interceptor's API pattern", function() {
			var origApiPattern = busyProvider.apiPattern;

			busyProvider.setApiPattern('test');
			busyService = busyProvider.$get($rootScope);
			expect(busyService.apiPattern).toEqual('test');

			busyProvider.setApiPattern(origApiPattern);
			busyService = busyProvider.$get($rootScope);
		});
	});
});

describe('tsportal.busyIndicator', function() {
	var busyService, $rootScope, $scope, $http, $httpBackend;
	beforeEach(function() {
		module('tsportal.busyIndicator');
		module('templates');
		inject(function(_$rootScope_, _busyService_, _$httpBackend_, _$http_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			busyService = _busyService_;
			$httpBackend = _$httpBackend_;
			$http = _$http_;
		});
	});

	describe('busyService', function() {
		it('should have a busyService with defaults', function() {
			expect(busyService).toBeDefined();
			expect(busyService.getMessage()).toEqual('Working on it');
			expect(busyService.isBusy()).toBeFalsy();
		});

		it('should be able to change the working message which should update on $rootScope', function() {
			busyService.setMessage('test message');
			expect(busyService.getMessage()).toEqual('test message');
			expect($rootScope.workingMessage).toEqual('test message');
		});
		it('should return message to default when resetMessage() is called', function() {
			busyService.setMessage('test message');
			expect(busyService.getMessage()).toEqual('test message');
			expect($rootScope.workingMessage).toEqual('test message');
			busyService.resetMessage();
			expect(busyService.getMessage()).toEqual('Working on it');
			expect($rootScope.workingMessage).toEqual('Working on it');
		});
		it('should return true from isBusy when show() is called', function() {
			busyService.show();
			expect(busyService.isBusy()).toBeTruthy();
		});
		it('should return false from isBusy when hide() is called', function() {
			busyService.hide();
			expect(busyService.isBusy()).toBeFalsy();
		});
		it('should return false from isBusy when forceHide() is called before show()', function() {
			busyService.forceHide();
			busyService.show();
			expect(busyService.isBusy()).toBeFalsy();
		});
	});
	describe('busyServiceInterceptor', function() {
		beforeEach(function() {
			spyOn(busyService, "show").and.callThrough();
			spyOn(busyService, "hide").and.callThrough();
		});
		it('should show busyService when $http request matching API pattern is made', function() {
			$http.get('/api/test');
			$httpBackend.expectGET('/api/test').respond(200);
			$httpBackend.flush();
			expect(busyService.show).toHaveBeenCalled();
		});
		it('should NOT show busyService when $http request NOT matching API pattern is made', function() {
			$http.get('test.html');
			$httpBackend.expectGET('test.html').respond(200);
			$httpBackend.flush();
			expect(busyService.show).not.toHaveBeenCalled();
		});
		it('should hide busyService when $http receives responseError from request matching API pattern', function() {
			$http.get('/api/test');
			$httpBackend.expectGET('/api/test').respond(500);
			$httpBackend.flush();
			expect(busyService.hide).toHaveBeenCalled();
		});		
	});

	describe('busyIndicatorDirective', function() {
		var $compile, element;
		beforeEach(function() {
			inject(function(_$compile_) {
				$compile = _$compile_;
			});
			element = $compile('<busy-indicator></busy-indicator>')($rootScope);
			$rootScope.$digest();
			spyOn(busyService, "hide").and.callThrough();
			spyOn(busyService, "show").and.callThrough();
			spyOn(busyService, "resetMessage").and.callThrough();
		});
		it('should replace directive with template', function() {
	        expect(element.html()).toContain('<div class="loading-indicator-body">');
			expect(element.html()).toContain('<h3 class="loading-title ng-binding">Working on it...</h3>');
		});

		it('should reset message and show busyIndicator on $stateChangeStart', function() {
			$rootScope.$emit('$stateChangeStart');
			expect(busyService.resetMessage).toHaveBeenCalled();
			expect(busyService.show).toHaveBeenCalled();
		});

		it('should hide busyIndicator on $stateChangeSuccess', function() {
			$rootScope.$emit('$stateChangeSuccess');
			expect(busyService.hide).toHaveBeenCalled();
		});
	});
});