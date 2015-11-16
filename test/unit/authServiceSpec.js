'use strict';

describe('authService', function() {
	var $rootScope, $scope, authService, $stateMock,
		mockCachingService, caches;

	caches = {};
	
	beforeEach(function() {
		module('ui.router');
		module('tsportal.cache');
		module('tsportal.auth');

		$stateMock = jasmine.createSpyObj('$state', ['go']);

		mockCachingService = function CachingService(name, config) {
			return {
				get: function() {
					return 'yes';
				}	
			};
		};
		mockCachingService.getCache = function(name) {
			if (caches[name]) {
				return {
					get: function(key) { return caches[name][key];},
					put: function(key, val) {caches[name][key] = val; },
					remove: function(key) {}
				};
			}
			return false;
		};
		mockCachingService.createNewCache = function(name, config) {
			caches[name] = config;
		};
		spyOn(mockCachingService, 'getCache').and.callThrough();
		spyOn(mockCachingService, 'createNewCache').and.callThrough();
		// cacheFactoryMock.get.and.callFake(function() {
		// 	console.log('cachefactorymock.get');
		// });
		module(function($provide) {
			$provide.value('$state', $stateMock);
			$provide.value('CachingService', mockCachingService);
		});
		inject(function(_$rootScope_, _authService_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			authService = _authService_;
		});
		spyOn(authService, "logout").and.callThrough();
		spyOn(authService, "loginConfirmed").and.callThrough();
		spyOn(authService, "loginCancelled").and.callThrough();
		spyOn(authService, "hasToken").and.callThrough();
	});

	it('should get authCache from CacheFactory', function() {
		expect(mockCachingService.getCache).toHaveBeenCalledWith('authCache');
		expect(mockCachingService.createNewCache).toHaveBeenCalled();
		expect(mockCachingService.getCache.calls.count()).toEqual(2);
		expect(caches.authCache).toBeDefined();
	});

	it('should check for token when calling checkApiAccess, and set isLoggedIn to true on root scope if token is present', function() {
		authService.token.set('test');
		authService.checkApiAccess();
		expect(authService.hasToken).toHaveBeenCalled();
		expect($rootScope.isLoggedIn).toBeTruthy();
	});


	it('should check for token when calling checkApiAccess and call loginCancelled if no token is present', function() {
		authService.token.set(null);
		authService.checkApiAccess();
		expect(authService.hasToken).toHaveBeenCalled();
		expect(authService.loginCancelled).toHaveBeenCalled();
		expect(authService.logout).toHaveBeenCalled();
		expect($stateMock.go).toHaveBeenCalledWith('auth');
	});
});