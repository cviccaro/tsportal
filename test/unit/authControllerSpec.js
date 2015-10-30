'use strict';

describe('AuthController', function() {
	var loginServiceMock, $rootScope, $scope, ctrl, messageService, busyService, $httpBackend, $q;

	beforeEach(function() {
		loginServiceMock = jasmine.createSpyObj('loginService', ['authenticate', 'login', 'token', 'tokenCopy']);
		module('tsportal');
		inject(function(_$rootScope_, $controller, _$q_, _messageService_, _$httpBackend_, _busyService_) {
			$rootScope = _$rootScope_;
			$q = _$q_;
			$httpBackend = _$httpBackend_;

			$httpBackend.expectGET('../partials/tradeshow-list.html').respond(200);
			$httpBackend.expectGET('../partials/login-form.html').respond(200);
			//$httpBackend.flush();
			$scope = $rootScope.$new();
			busyService = _busyService_;
			messageService = _messageService_;
			spyOn(busyService, "show").and.callThrough();
			spyOn(busyService, "hide").and.callThrough();
			loginServiceMock.token = {
				get: function() {
					return localStorage.getItem('satellizer_token');
				},
				set: function(tokenString) {
					localStorage.setItem('satellizer_token', tokenString);
				}
			};
			loginServiceMock.tokenCopy = {
				get: function() {
					return localStorage.getItem('_satellizer_token');
				},
				set: function(tokenString) {
					localStorage.setItem('_satellizer_token', tokenString);
				}
			};
			spyOn(messageService, "removeMessage").and.callThrough();
			ctrl = $controller('AuthController', {$scope: $scope, loginService: loginServiceMock, busyService: busyService, messageService: messageService});
			spyOn($scope, "$broadcast").and.callThrough()
			spyOn($scope, "loginError").and.callThrough()
			$scope.$digest();;
		});
		localStorage.setItem('satellizer_token', 'token');
	})
	it('should have busyService variables defined and should be able to set message on busyService', function() {
		expect(busyService.getMessage()).toEqual('Working on it...');
		expect(busyService.isVisible()).toBeFalsy()
		busyService.setMessage('test')
		expect(busyService.getMessage()).toEqual('test')
	});

	it('should delete message from messageService when calling $scope.removeMessage', function() {
		expect(messageService).toBeDefined();
		messageService.addMessage({type: 'success', message: 'test'});
		expect(messageService.messages.length).toEqual(1);
		expect(messageService.messages[0].message).toEqual('test');
		$scope.$digest();

		// use scope to delete
		$scope.removeMessage(1);
		expect(messageService.messages.length).toEqual(0)
		expect($scope.messages.length).toEqual(0)
		expect(messageService.removeMessage).toHaveBeenCalled();
	})
	it('should purge messages from messageService when messageService.purge', function() {
		expect(messageService).toBeDefined();
		messageService.addMessage({type: 'success', message: 'test'});
		expect(messageService.messages.length).toEqual(1);
		expect(messageService.messages[0].message).toEqual('test');
		$scope.$digest();

		// delete messages
		messageService.purge();
		$scope.$digest();
		expect(messageService.messages.length).toEqual(0)
		expect($scope.messages.length).toEqual(0)
		expect(messageService.removeMessage.calls.count()).toEqual(1)
	})
	it('should purge messages from messageService when calling $scope.clearErrors', function() {
		expect(messageService).toBeDefined();
		messageService.addMessage({type: 'success', message: 'test'});
		expect(messageService.messages.length).toEqual(1);
		expect(messageService.messages[0].message).toEqual('test');
		$scope.$digest();

		// use scope to delete
		$scope.clearErrors();
		expect(messageService.messages.length).toEqual(0)
		expect($scope.messages.length).toEqual(0)
		expect(messageService.removeMessage).toHaveBeenCalled();
	})

	it('should call loginService when calling $scope.login and receive successful promise', function() {
		expect(busyService.hide).toHaveBeenCalled();
		$scope.email = 'test@test.com';
		$scope.password = 'test';
		loginServiceMock.login.and.callFake(function() {
			var deferred = $q.defer();
			deferred.resolve({data: {token: 'test'}});
			return deferred.promise;
		})
		$scope.login();
		$scope.$digest()
		expect(loginServiceMock.login).toHaveBeenCalledWith({email: $scope.email, password: $scope.password})
		expect(busyService.show).toHaveBeenCalled();
		expect(busyService.hide.calls.count()).toEqual(2)

	})
	it('should call loginError when loginService fails', function() {
		$scope.email = 'test@test.com';
		$scope.password = 'test';

		loginServiceMock.login.and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({success: false});
			return deferred.promise;
		});

		$scope.login();
		expect(loginServiceMock.login).toHaveBeenCalledWith({email: $scope.email, password: $scope.password})
		$scope.$digest()
		expect($scope.loginError).toHaveBeenCalled();
	})
	it('should call loginError if an event is emitted to rootScope', function() {
		$rootScope.$broadcast('event:auth-loginRequired')
		expect($scope.loginError).toHaveBeenCalled();
	})
});