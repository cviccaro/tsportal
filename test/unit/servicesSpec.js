'use strict';
describe('loginService', function() {
	var loginService, $httpBackend, $rootScope, $scope, $q, authMock, stateMock;
	beforeEach(function() {
		module('tsportal');
		authMock = {
			login: function(creds) {
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
		}
		module(function($provide) {
			$provide.value('$auth', authMock);
			$provide.value('$state', stateMock);
		})
		inject(function(_$httpBackend_, _$rootScope_, _$q_, _loginService_) {
			$httpBackend = _$httpBackend_;
			$q = _$q_;
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			loginService = _loginService_;
		});
		spyOn(loginService, "authenticate").and.callThrough();
		spyOn(loginService, "refresh").and.callThrough();
		spyOn(stateMock, "go");
		spyOn(loginService.tokenCopy, "get").and.callThrough()
		spyOn(loginService, "login").and.callThrough();
		spyOn(loginService, "logout").and.callThrough();
		spyOn(authMock, "login").and.callThrough();
		spyOn(authMock, "logout").and.callThrough();
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
		})
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
			success = true;
		})
		.catch(function() {
			fail = true;
		})
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
		//expect(loginService.tokenCopy.get()).not.toBeNull();
		loginService.token.set('test');
		expect(loginService.token.get()).toEqual('test');
	});
	it('loginService.tokenCopy: should be able to get and set', function() {
		expect(loginService.tokenCopy.get()).not.toBeNull();
		//expect(loginService.tokenCopy.get()).not.toBeNull();
		loginService.tokenCopy.set('test');
		expect(loginService.tokenCopy.get()).toEqual('test');
	});
	it('loginService.logout: should call auth.logout and remove tokens', function() {
		loginService.logout();
		$scope.$digest();
		expect(authMock.logout).toHaveBeenCalled();
		expect(localStorage.getItem('satellizer_token')).toBeNull();
		expect(localStorage.getItem('_satellizer_token')).toBeNull();
	});
	it('loginService.checkApiAccess check tokenCopy if token is null, and to call state.go if tokenCopy is null, too', function() {
		loginService.token.remove();
		loginService.checkApiAccess();
		expect(loginService.tokenCopy.get).toHaveBeenCalled();
		expect(stateMock.go).toHaveBeenCalledWith('auth', {});
	})
	it('loginService.checkApiAccess check tokenCopy if token is null, and to call loginService.refresh if tokenCopy is not null', function() {
		loginService.token.remove();
		loginService.tokenCopy.set('test');
		loginService.checkApiAccess();
		expect(loginService.tokenCopy.get).toHaveBeenCalled();
		expect(loginService.refresh).toHaveBeenCalledWith('test');
		$httpBackend.expectGET('api/authenticate/refresh').respond(200);
	})
});
