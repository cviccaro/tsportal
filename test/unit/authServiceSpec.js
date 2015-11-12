'use strict';

describe('authService', function() {
	var $rootScope, $scope, authService, CacheFactory, cacheFactoryMock;
	beforeEach(function() {
		module('ui.router');
		module('tsportal.auth');

		CacheFactory = function CacheFactory () {
			this.get = function() {
				return true;
			}
		};

		var cacheFactoryMock = new CacheFactory();
		// spyOn(cacheFactoryMock, 'get');
		// cacheFactoryMock.get.and.callFake(function() {
		// 	console.log('cachefactorymock.get');
		// });
		module(function($provide) {
			$provide.value('CacheFactory', CacheFactory);
		});
		inject(function(_$rootScope_, _authService_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			authService = _authService_;
		});
	});

	it('should do stuff', function() {
		expect(1).toEqual(1);
		expect($scope.isLoggedIn).toBeFalsy();
	})

});