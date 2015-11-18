'use strict';

describe('tsportal.login', function() {
	var $rootScope, $controller, mockCacheFactory, mockState;

	beforeEach(function() {
		
		module('mockCacheFactory');
		module('tsportal.login');

		mockState = jasmine.createSpyObj('$state', ['go']);
		module(function($provide) {
			$provide.value('$state', mockState);
		});

		inject(function(_$rootScope_, _$controller_, _CacheFactory_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			mockCacheFactory = _CacheFactory_;
		});
	});

	describe('LoginController', function() {
		var loginController, $scope, loginCache, $q, authService;

		beforeEach(function() {
			$scope = $rootScope.$new();
			loginCache = mockCacheFactory.get('login');
			inject(function(_authService_, _$q_) {
				authService = _authService_;
				$q = _$q_;
			});
		});
		it('should remember user if user previous enabled it', function() {
			loginCache.put('rememberMe', true);
			loginCache.put('email', 'johndoe@email.com');

			loginController = $controller('LoginController', {
				$scope: $scope, 
				promisedCache: loginCache, 
				authService: authService
			});
			expect(loginController.rememberMe).toBeTruthy();
			expect(loginController.email).toEqual('johndoe@email.com');
		});
		it('should try to navigate to main state if authService has a token', function() {
			authService.token.set('test');
			loginController = $controller('LoginController', {
				$scope: $scope, 
				promisedCache: loginCache, 
				authService: authService
			});
			$rootScope.$digest();
			expect(mockState.go).toHaveBeenCalledWith('tradeshows');
		});
		it('should go to main state when calling login() and performing a successful authorization with authService.  and should store in cache email/rememberMe if checked.', function() {
			loginController = $controller('LoginController', {
				$scope: $scope, 
				promisedCache: loginCache, 
				authService: authService
			});
			spyOn(loginCache, "put").and.callThrough();
			spyOn(authService, "login").and.callFake(function() {
				return $q.when({token: 'testtoken'});
			});

			loginController.purgeMessages = function() {};
			spyOn(loginController, "purgeMessages");

			loginController.email = 'test@test.com';
			loginController.password = 'testpass';
			loginController.rememberMe = true;

			loginController.login();
			expect(loginController.purgeMessages).toHaveBeenCalled();

			expect(authService.login).toHaveBeenCalledWith({
				email: 'test@test.com',
				password: 'testpass'
			});
			$rootScope.$digest();
			expect(loginCache.put).toHaveBeenCalledWith('email', 'test@test.com');
			expect(loginCache.put).toHaveBeenCalledWith('rememberMe', true);
			expect(mockState.go).toHaveBeenCalledWith("tradeshows");
		});
		it('should show an error message when calling login() and not succesfully authorizing', function() {
			loginController = $controller('LoginController', {
				$scope: $scope, 
				promisedCache: loginCache, 
				authService: authService
			});
			loginController.purgeMessages = function() {};
			loginController.addErrorMessage = function() {};
			spyOn(loginController, "addErrorMessage");

			spyOn(authService, "login").and.callFake(function() {
				return $q.reject({status: 500, data:{error: 'invalid_credentials'}});
			});
			loginController.email = 'test@test.com';
			loginController.password = 'testpass';
			loginController.login();

			expect(authService.login).toHaveBeenCalledWith({
				email: 'test@test.com',
				password: 'testpass'
			});
			$rootScope.$digest();
			expect(loginController.addErrorMessage).toHaveBeenCalled();

		});
	});

	describe('LogoutController', function() {
		var logoutController, $scope, $q, authService;

		beforeEach(function() {
			$scope = $rootScope.$new();
			inject(function(_authService_) {
				authService = _authService_;
			});
		});
		it('should call logout on authService when loading this controller', function() {
			spyOn(authService, "logout").and.callThrough();

			logoutController = $controller('LogoutController', {
				authService: authService
			});

			$rootScope.$digest();
			expect(authService.logout).toHaveBeenCalled();
		});
	});
});