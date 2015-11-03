'use strict';
describe('Services', function() {
	var authMock, stateMock, $q;
	beforeEach(function() {
		localStorage.removeItem('_satellizer_token');
		localStorage.removeItem('satellizer_token');
		module('tsportal');
		module(function($provide) {
			$provide.value('$auth', authMock);
			$provide.value('$state', stateMock);
		});
		inject(function(_$q_) {
			$q = _$q_;
			authMock = {
				login: function(creds) {
					console.log('login with ', creds)
					var deferred = $q.defer();
					if (creds) {
						deferred.resolve({data: {token: 'test'}});
					}
					else {
						deferred.reject({data: {token: 'test'}});
					}
					return deferred.promise;
				},
				logout: function() {

				}
			};
			stateMock = {
				go: function() {

				}
			};
		});
		spyOn(stateMock, "go");

	});

	describe('loginService', function() {
		var loginService, $httpBackend, $rootScope, $scope;
		beforeEach(function() {
			spyOn(authMock, "login").and.callThrough();
			spyOn(authMock, "logout").and.callThrough();
			inject(function(_$httpBackend_, _$rootScope_, _loginService_) {
				$httpBackend = _$httpBackend_;
				$rootScope = _$rootScope_;
				$scope = $rootScope.$new();
				loginService = _loginService_;
			});
			spyOn(loginService, "authenticate").and.callThrough();
			spyOn(loginService, "refresh").and.callThrough();
			spyOn(loginService, "checkApiAccess").and.callThrough();
	
			spyOn(loginService, "hasToken").and.callThrough();
			spyOn(loginService, "hasRefreshToken").and.callThrough();
			spyOn(loginService, "login").and.callThrough();
			spyOn(loginService, "logout").and.callFake(function() {
				inject(function($auth) {
					$auth.logout();
				});
				localStorage.removeItem('_satellizer_token');
				localStorage.removeItem('satellizer_token');
			});

			localStorage.setItem('satellizer_token', 'token');
			localStorage.setItem('_satellizer_token', 'token');
			$scope.$digest();
		});

		it('loginService.isValidEmail: should validate a proper email', function() {
			var valid = loginService.isValidEmail('valid@email.com');
			expect(valid).toBeTruthy();
		});
		it('loginService.isValidEmail: should invalidate an improper email', function() {
			var valid = loginService.isValidEmail('invalid@emailcom');
			expect(valid).toBeFalsy();
		});
		it('loginService.login: should receive a resolved promise when calling login with credentials', function() {
			var creds = {
				email: '',
				password: ''
			};
			var success = false;
			loginService.login(creds).then(function() {
				success = true;
			});
			expect(loginService.authenticate).toHaveBeenCalledWith(creds);
			expect(authMock.login).toHaveBeenCalledWith(creds);
			// until we call $digest on $scope, we are not in sync.  this should be false
			expect(success).toBeFalsy();

			// process scope
			$scope.$digest();

			// should now be true
			expect(success).toBeTruthy();
		});
		it('loginService.login: should receive a rejected promise when calling login with no credentials', function() {
			var success = false,
				fail 	= false,
				creds 	= false;

			// on our mocked $auth service, passing false in will deliver a reject to simulate failed login
			loginService.login(creds).then(function() {
				console.log('login success')
				success = true;
			})
			.catch(function() {
				console.log('login fail')
				fail = true;
			});
			expect(loginService.authenticate).toHaveBeenCalledWith(creds);
			expect(authMock.login).toHaveBeenCalledWith(creds);
			// until we call $digest on $scope, we are not in sync.  this should be false
			expect(success).toBeFalsy();
			expect(fail).toBeFalsy();
			// process scope
			$scope.$digest();

			// should now be true
			expect(success).toBeFalsy();
			expect(fail).toBeTruthy();
		});
		it('loginService.token: should be able to get and set', function() {
			expect(loginService.token.get()).not.toBeNull();
			//expect(loginService.refreshToken.get()).not.toBeNull();
			loginService.token.set('test');
			expect(loginService.token.get()).toEqual('test');
		});
		it('loginService.refreshToken: should be able to get and set', function() {
			expect(loginService.refreshToken.get()).not.toBeNull();
			//expect(loginService.refreshToken.get()).not.toBeNull();
			loginService.refreshToken.set('test');
			expect(loginService.refreshToken.get()).toEqual('test');
		});
		it('loginService.logout: should call auth.logout and remove tokens', function() {
			loginService.logout();
			$scope.$digest();
			expect(authMock.logout).toHaveBeenCalled();
			expect(localStorage.getItem('satellizer_token')).toBeNull();
			expect(localStorage.getItem('_satellizer_token')).toBeNull();
		});
		it('loginService.checkApiAccess check refreshToken if token is null, and to call state.go if refreshToken is null, too', function() {
			loginService.token.remove();
			loginService.refreshToken.remove();
			// localStorage.removeItem('satellizer_token')
			// localStorage.removeItem('satellizer_token')
			loginService.checkApiAccess();
			expect(loginService.hasToken).toHaveBeenCalled();
			expect(loginService.hasRefreshToken).toHaveBeenCalled();
			expect(stateMock.go).toHaveBeenCalledWith('auth', {});
		});
		it('loginService.checkApiAccess check refreshToken if token is null, and to call loginService.refresh if refreshToken is not null', function() {
			loginService.token.remove();
			loginService.refreshToken.set('test');
			loginService.checkApiAccess();
			$scope.$digest()
			expect(loginService.hasRefreshToken).toHaveBeenCalled();
			expect(loginService.refresh).toHaveBeenCalledWith('test');
			$httpBackend.expectGET('api/authenticate/refresh').respond(200);
		});
	});

	describe('busyService', function() {
		var $rootScope, busyService;
		beforeEach(function() {
			inject(function(_busyService_, _$rootScope_) {
				$rootScope = _$rootScope_;
				busyService = _busyService_;
			});
		});
		it('should be able to get and set a message', function() {
			busyService.setMessage('test');
			expect(busyService.message).toEqual('test');
		});
		it('should set busyServiceIsBusy on $rootSCope', function() {
			busyService.show();
			expect(busyService.isBusy()).toBeTruthy();
		});
	});
});