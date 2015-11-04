'use strict';
describe('Services', function() {
	var stateMock, $httpBackend, $timeout, $q, httpSvcMock, httpMockWrapper;
	beforeEach(function() {
		localStorage.removeItem('_satellizer_token');
		localStorage.removeItem('satellizer_token');
		module('tsportal');
		stateMock = jasmine.createSpyObj('$state', ['go']);
		httpMockWrapper = jasmine.createSpyObj('$http', ['get', 'defaults']);
	});

	describe('loginService', function() {
		var loginService, $rootScope, $scope, authMock;
		beforeEach(function() {
			authMock = jasmine.createSpyObj('$auth', ['login', 'logout']);
	
			module(function($provide) {
				$provide.value('$auth', authMock);
				$provide.value('$state', stateMock);
				$provide.value('$http', httpMockWrapper);
			});
			inject(function(_$httpBackend_, _$rootScope_, _loginService_, _$q_, _$timeout_, $http) {
				$q = _$q_;
				$httpBackend = _$httpBackend_;
				$rootScope = _$rootScope_;
				$scope = $rootScope.$new();
				loginService = _loginService_;
				$timeout = _$timeout_;
				authMock.login.and.callFake(function(creds) {
					var d = $q.defer();
					if (creds) {
						d.resolve();
					}
					else {
						d.reject();
					}
					return d.promise;
				});
			});
			spyOn(loginService, "authenticate").and.callThrough();
			spyOn(loginService, "refresh").and.callThrough();
			spyOn(loginService, "checkApiAccess").and.callThrough();
	
			spyOn(loginService, "hasToken").and.callThrough();
			spyOn(loginService, "hasRefreshToken").and.callThrough();
			spyOn(loginService, "login").and.callThrough();
			spyOn(loginService, "logout").and.callThrough();

			localStorage.setItem('satellizer_token', 'token');
			localStorage.setItem('_satellizer_token', 'token');
			$scope.$digest();
		});

		it('should validate a proper email', function() {
			var valid = loginService.isValidEmail('valid@email.com');
			expect(valid).toBeTruthy();
		});
		it('should invalidate an improper email', function() {
			var valid = loginService.isValidEmail('invalid@emailcom');
			expect(valid).toBeFalsy();
		});
		it('should receive a resolved promise when calling login with credentials', function() {
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
		it('should receive a rejected promise when calling login with no credentials', function() {
			var success = false,
				fail 	= false,
				creds 	= false;

			// on our mocked $auth service, passing false in will deliver a reject to simulate failed login
			loginService.login(creds).then(function() {
				success = true;
			})
			.catch(function() {
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
		it('should be able to get and set token', function() {
			expect(loginService.token.get()).not.toBeNull();
			loginService.token.set('test');
			expect(loginService.token.get()).toEqual('test');
		});
		it('should be able to get and set refreshToken', function() {
			expect(loginService.refreshToken.get()).not.toBeNull();
			loginService.refreshToken.set('test');
			expect(loginService.refreshToken.get()).toEqual('test');
		});
		it('logout() should call $auth.logout() and remove tokens from localStorage', function() {
			loginService.logout();
			$scope.$digest();
			expect(loginService.logout).toHaveBeenCalled();
			expect(authMock.logout).toHaveBeenCalled();
			expect(localStorage.getItem('satellizer_token')).toBeNull();
			expect(localStorage.getItem('_satellizer_token')).toBeNull();
		});
		it('checkApiAccess() should use $state to goto Auth Page if refreshToken nor token are found', function() {
			loginService.token.remove();
			loginService.refreshToken.remove();
			loginService.checkApiAccess();
			expect(loginService.hasToken).toHaveBeenCalled();
			expect(loginService.hasRefreshToken).toHaveBeenCalled();
			expect(stateMock.go).toHaveBeenCalledWith('auth', {});
		});
		it('checkApiAccess() should call refresh() if refreshToken is found but token is not', function() {
			httpMockWrapper.get.and.callFake(function() {
				var d = $q.defer();
    			d.resolve({data: {token: 'test'}});
    			return d.promise;
  			});
			loginService.token.remove();
			loginService.refreshToken.set('test');
			
			loginService.checkApiAccess();
			expect(loginService.hasToken).toHaveBeenCalled();
			// no token!
			expect(loginService.hasToken()).toBeFalsy();

			$httpBackend.expectGET('api/authenticate/refresh').respond(200);
			$timeout.flush()

			expect(loginService.hasRefreshToken).toHaveBeenCalled();
			expect(loginService.refresh).toHaveBeenCalledWith('test');
			
			$scope.$digest();
			// now.. token
			expect(loginService.token.get()).toEqual('test');
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
		it('should set busyServiceIsBusy to TRUE on $rootScope when show() is called', function() {
			busyService.show();
			expect(busyService.isBusy()).toBeTruthy();
		});
		it('should set busyServiceIsBusy on $rootScope when hide() is called', function() {
			busyService.hide();
			expect(busyService.isBusy()).toBeFalsy();
		});
	});


	describe('leadService', function() {
		var leadService, success = false;
		beforeEach(function() {
			module('tsportal');
			inject(function(_leadService_, _$httpBackend_, _$timeout_) {
				leadService = _leadService_;
				$httpBackend = _$httpBackend_;
				$timeout = _$timeout_;
			});
		});
		it('retrieve() should set defaults when passed undefined parameters', function() {
			leadService.retrieve(1).then(function() {
					success = true;
					console.log('leadService.retrieve success: ', arguments)
			})
			.catch(function() {
				success = false;
				console.log('leadService.retrieve catch: ', arguments)
			});
			$httpBackend.expectGET('api/tradeshows/1/leads?page=1&perPage=15&orderBy=id&orderByReverse=0&filter=')
				.respond(200);
			$timeout.flush();
		});
		it('retrieve() should make HTTP GET request', function() {
			expect(leadService).toBeDefined();
			var tradeshow_id 	= 1,
				pageNumber 		= 1,
				perPage	   		= 15,
				orderBy    		= 'id',
				orderByReverse 	= 0,
				query			= 'test',
				success			= false;

			leadService.retrieve(tradeshow_id, pageNumber, perPage, orderBy, orderByReverse, query).then(function() {
				success = true;
				console.log('leadService.retrieve success: ', arguments)
			})
			.catch(function() {
				success = false;
				console.log('leadService.retrieve catch: ', arguments)
			});
			$httpBackend.expectGET('api/tradeshows/' + tradeshow_id + '/leads?page=' + pageNumber + '&perPage=' + perPage + 
									'&orderBy=' + orderBy + '&orderByReverse=' + orderByReverse + '&filter=' + query)
				.respond(200);
			$timeout.flush();
		});
	});

	describe('tradeshowService', function() {
		var tradeshowService, success = false;
		beforeEach(function() {
			module('tsportal');
			inject(function(_tradeshowService_, _$httpBackend_, _$timeout_) {
				tradeshowService = _tradeshowService_;
				$httpBackend = _$httpBackend_;
				$timeout = _$timeout_;
			});
		});
		it('retrieve() should set defaults when passed undefined parameters', function() {
			tradeshowService.retrieve().then(function() {
					success = true;
					console.log('tradeshowService.retrieve success: ', arguments)
			})
			.catch(function() {
				success = false;
				console.log('tradeshowService.retrieve catch: ', arguments)
			});
			$httpBackend.expectGET('api/tradeshows?page=1&perPage=15&orderBy=id&orderByReverse=0&filter=')
				.respond(200);
			$timeout.flush();
		});
		it('retrieve() should make HTTP GET request', function() {
			var	pageNumber 		= 1,
				perPage	   		= 15,
				orderBy    		= 'id',
				orderByReverse 	= 0,
				query			= 'test',
				success			= false;

			tradeshowService.retrieve(pageNumber, perPage, orderBy, orderByReverse, query).then(function() {
				success = true;
				console.log('tradeshowService.retrieve success: ', arguments)
			})
			.catch(function() {
				success = false;
				console.log('tradeshowService.retrieve catch: ', arguments)
			});
			$httpBackend.expectGET('api/tradeshows?page=' + pageNumber + '&perPage=' + perPage + 
									'&orderBy=' + orderBy + '&orderByReverse=' + orderByReverse + '&filter=' + query)
				.respond(200);
			$timeout.flush();
		});
	});
});