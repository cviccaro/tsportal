'use strict';

describe('tsportal.tradeshows.TradeshowCreateController', function() {
	var $rootScope, $scope, $controller, mockCacheFactory, formCache, 
		ctrl, authService, $stateMock, TradeshowMock, ngDialogMock, $q;

	$stateMock = jasmine.createSpyObj("$state", ["go"]);
	TradeshowMock = jasmine.createSpyObj("Tradeshow", ['create']);
	ngDialogMock = jasmine.createSpyObj("ngDialog", ['open']);

	beforeEach(function() {
		module('tsportal.tradeshows');
		module('mockCacheFactory');

		module(function($provide) {
			$provide.value('$state', $stateMock);
		});

		inject(function(_$rootScope_, _$controller_, _authService_, _$q_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$controller = _$controller_;
			authService = _authService_;
			$q = _$q_;
		});

		ngDialogMock.open.and.callFake(function() {
			var deferred = $q.defer();
			deferred.resolve();
			return {
				closePromise: deferred.promise
			};
		});

		spyOn(authService, "checkApiAccess").and.callThrough();

		ctrl = $controller('TradeshowCreateController', {
			$scope: $scope,
			authService: authService,
			$state: $stateMock,
			Tradeshow: TradeshowMock,
			ngDialog: ngDialogMock
		});
	});

	it('should call authService.checkApiAccess() on load', function() {
		authService.token.set('test');
		$rootScope.$digest();
		expect(authService.checkApiAccess).toHaveBeenCalled();
	});
	it('should use $state service to change state to auth when no token is present', function() {
		$rootScope.$digest();
		expect(authService.checkApiAccess).toHaveBeenCalled();
		expect($stateMock.go).toHaveBeenCalledWith("auth");
	});
	it('should goto tradeshows view when goBack() is called', function() {
		ctrl.goBack();
		$rootScope.$digest();
		expect($stateMock.go).toHaveBeenCalledWith("tradeshows");
	});
	it('should not proceed with save if form is invalid', function() {
		ctrl.tradeshowForm = {};
		ctrl.tradeshowForm.$invalid = true;
		ctrl.save();
		expect(TradeshowMock.create).not.toHaveBeenCalled();
	});
	it('should proceed with save if form is valid, and head to tradeshowEdit state if Tradeshow.create() succeeds', function() {
		TradeshowMock.create.and.callFake(function() {
			var deferred = $q.defer();
			deferred.$promise = deferred.promise;
			deferred.resolve({id: 999999});
			return deferred;
		});
		ctrl.tradeshowForm = {};
		ctrl.tradeshowForm.$valid = true;
		ctrl.save();
		$rootScope.$digest();
		expect(TradeshowMock.create).toHaveBeenCalled();
		expect(ngDialogMock.open).toHaveBeenCalled();
		expect($stateMock.go).toHaveBeenCalledWith('tradeshowEdit', {id: 999999});
	});
	it('should proceed with save if form is valid, and show error message if Tradeshow.create() fails', function() {
		ctrl.addErrorMessage = function() {};
		spyOn(ctrl, "addErrorMessage");
		TradeshowMock.create.and.callFake(function() {
			var deferred = $q.defer();
			deferred.$promise = deferred.promise;
			deferred.reject({});
			return deferred;
		});
		ctrl.tradeshowForm = {};
		ctrl.tradeshowForm.$valid = true;
		ctrl.save();
		$rootScope.$digest();
		expect(TradeshowMock.create).toHaveBeenCalled();
		expect(ctrl.addErrorMessage).toHaveBeenCalled();
	});
});