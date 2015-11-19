'use strict';

describe('tsportal.auth', function() {
	var $rootScope, $scope, authService, $stateMock,
		mockCacheFactory, cachingService, caches, $httpBackend, $http;

	caches = {};
	
	beforeEach(function() {
		module('tsportal.auth');
		module('mockCacheFactory');
		$stateMock = jasmine.createSpyObj('$state', ['go']);
		mockCacheFactory = jasmine.createSpyObj('CacheFactory', ['create', 'new', 'get']);

		mockCacheFactory.get.and.callFake(function(cacheName) {
			if (!caches.hasOwnProperty(cacheName)) {
				caches[cacheName] = {};
			}
			return {
				get: function(key) { 
					return caches[cacheName][key];
				},
				put: function(key, val) {
					caches[cacheName][key] = val;
					return val;
				},
				remove: function(key) {
					delete caches[cacheName][key];
				} 
			};
		});
		module(function($provide) {
			$provide.value('$state', $stateMock);
			// $provide.value('CacheFactory', mockCacheFactory);
		});
		inject(function(_$rootScope_, _authService_, _CachingService_, _$httpBackend_, _$http_, _CacheFactory_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			authService = _authService_;
			cachingService = _CachingService_;
			$httpBackend = _$httpBackend_;
			$http = _$http_;
			mockCacheFactory = _CacheFactory_;
		});
		spyOn(authService, "refresh").and.callThrough();
		spyOn(authService, "logout").and.callThrough();
		spyOn(authService, "loginConfirmed").and.callThrough();
		spyOn(authService, "loginCancelled").and.callThrough();
		spyOn(authService, "hasToken").and.callThrough();
		spyOn($rootScope, "$broadcast");
	});
	describe('authService', function() {
		it('should return false from authService.hasToken() when not set', function() {
			authService.token.remove()
			expect(authService.hasToken()).toBeFalsy();
		});
		it('should return true from authService.hasToken() when set', function() {
			authService.token.set('test');
			expect(authService.hasToken()).toBeTruthy();
		});
		it('should check for token when calling checkApiAccess, and set isLoggedIn to true on root scope if token is present', function() {
		    authService.token.set('test');
		    authService.checkApiAccess();
		    expect(authService.hasToken).toHaveBeenCalled();
		    // expect($rootScope.$broadcast).toHaveBeenCalledWith("event:auth-logged-in");
		    expect($rootScope.isLoggedIn).toBeTruthy();
		});

		it('should check for token when calling checkApiAccess and call loginCancelled if no token is present, which broadcasts event on rootScope', function() {
		    authService.token.remove();
		    authService.checkApiAccess();
		    expect(authService.hasToken).toHaveBeenCalled();
		    expect(authService.loginCancelled).toHaveBeenCalled();
		    expect($rootScope.$broadcast).toHaveBeenCalledWith("event:auth-login-cancelled", undefined);
		    expect(authService.logout).toHaveBeenCalled();
		    expect($stateMock.go).toHaveBeenCalledWith('auth');
		});

		it('should initiate request using $http when calling authService.login', function() {
			$httpBackend.whenPOST(authService.loginUrl).respond({
				token: 'test'
			});
			authService.login({
				email: 'test',
				password: 'test'
			});
			$httpBackend.expectPOST(authService.loginUrl);
			$httpBackend.flush()
		});

		it('should initiate request using $http when calling authService.refresh.  should call authService.loginConfirmed and set token to new value if authService.refresh succeeds', function() {
			$httpBackend.whenGET(authService.refreshUrl).respond({
				token: 'newToken'
			});
			authService.refresh('test');
			$httpBackend.expectGET(authService.refreshUrl);
			$httpBackend.flush()
			expect(authService.token.get()).toEqual('newToken');
			expect(authService.loginConfirmed).toHaveBeenCalled();
		});
		it('should call authService.loginCancelled if authService.refresh fails', function() {
			$httpBackend.whenGET(authService.refreshUrl).respond(500);
			authService.refresh('test');
			$httpBackend.expectGET(authService.refreshUrl);
			$httpBackend.flush();
			expect(authService.loginCancelled).toHaveBeenCalled();
		});
	});
	describe('authInterceptor', function() {
		it('should call authService.loginCancelled when receiving 400 response', function() {
			$httpBackend.whenPOST(authService.loginUrl).respond(400);
			authService.login({email: '', password: ''});
			$httpBackend.expectPOST(authService.loginUrl);
			$httpBackend.flush();
			expect(authService.loginCancelled).toHaveBeenCalled();
		});
		it('should call authService.loginCancelled and broadcast event:auth-forbidden when receiving 403 response', function() {
			$httpBackend.whenPOST(authService.loginUrl).respond(403);
			authService.login({email: '', password: ''});
			$httpBackend.expectPOST(authService.loginUrl);
			$httpBackend.flush();
			expect(authService.loginCancelled).toHaveBeenCalled();
			expect($rootScope.$broadcast).toHaveBeenCalled();
			expect($rootScope.$broadcast.calls.first().args[0]).toEqual('event:auth-forbidden');
			expect($rootScope.$broadcast.calls.mostRecent().args[0]).toEqual('event:auth-login-cancelled');
		});
		it('should goto auth view when trying api request with no token', function() {
			authService.token.remove();
			// Try request which will return 401
			$http.get('/api/test');
			$httpBackend.expectGET('/api/test').respond(500);
			$httpBackend.flush();
			expect($stateMock.go).toHaveBeenCalledWith('auth');
		});
		it('should trigger a refresh when receiving a 401 response and token is set', function() {
			// Set a token in order to refresh when 401 received
			authService.token.set('test');
			$httpBackend.expectGET('/api/test').respond(401, {
				error: 'token_expired'
			});
			// Try request which will return 401
			$http.get('/api/test');
			// Respond with token
			$httpBackend.expectGET(authService.refreshUrl).respond(200, {
				token: 'test'
			});
			$httpBackend.expectGET('/api/test').respond(200);
			$httpBackend.flush();
			expect(authService.refresh).toHaveBeenCalled();
			// Broadcast should have first broadcasted login-required, then logged-in
			expect($rootScope.$broadcast).toHaveBeenCalled();
			expect($rootScope.$broadcast.calls.first().args[0]).toEqual('event:auth-login-required');
			expect($rootScope.$broadcast.calls.mostRecent().args[0]).toEqual('event:auth-logged-in');
		});
	});
	
});