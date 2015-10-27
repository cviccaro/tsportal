'use strict';

describe('Testing AuthController', function() {
	var loginServiceMock, $rootScope, $scope, ctrl, messageService, busyService, $httpBackend, $q;

	beforeEach(function() {
		loginServiceMock = jasmine.createSpyObj('loginService', ['authenticate']);
		
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
			spyOn(messageService, "removeMessage").and.callThrough();
			ctrl = $controller('AuthController', {$scope: $scope, loginService: loginServiceMock, busyService: busyService, messageService: messageService});
			spyOn($scope, "$broadcast").and.callThrough()
			spyOn($scope, "loginError").and.callThrough()
			$scope.$digest();;
		});
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
	
		loginServiceMock.authenticate.and.callFake(function() {
			var deferred = $q.defer();
			deferred.resolve({data: {token: 'test'}});
			return deferred.promise;
		});
		$scope.login();
		$scope.$digest()
		expect(loginServiceMock.authenticate).toHaveBeenCalledWith({email: $scope.email, password: $scope.password})
		expect(busyService.show).toHaveBeenCalled();
		expect(busyService.hide.calls.count()).toEqual(2)

	})
	it('should call loginError when loginService fails', function() {
		$scope.email = 'test@test.com';
		$scope.password = 'test';

		loginServiceMock.authenticate.and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({success: false});
			return deferred.promise;
		});

		$scope.login();
		expect(loginServiceMock.authenticate).toHaveBeenCalledWith({email: $scope.email, password: $scope.password})
		$scope.$digest()
		expect($scope.loginError).toHaveBeenCalled();
	})
	it('should call loginError if an event is emitted to rootScope', function() {
		$rootScope.$broadcast('event:auth-loginRequired')
		expect($scope.loginError).toHaveBeenCalled();
	})
});

describe('Tradeshow List Controller', function() {
    var ctrl, $scope, $rootScope, $httpBackend, tradeshowServiceMock, loginServiceMock, $q;
    beforeEach(function() {
    	module('tsportal')
    	loginServiceMock = jasmine.createSpyObj('loginService', ['authenticate', 'checkApiAccess', 'refresh']);
    	tradeshowServiceMock = jasmine.createSpyObj('tradeshowService', ['retrieve']);
    	inject(function (_$httpBackend_, $controller, _$rootScope_, _$q_) {
    	  $q = _$q_;
	      $httpBackend = _$httpBackend_;
	      $rootScope = _$rootScope_;
	      $scope = $rootScope.$new();
	      tradeshowServiceMock.retrieve.and.callFake(function() {
	      	var deferred = $q.defer();
	      	deferred.resolve({current_page: 1, last_page: 1, data: [{id: 1, name: 'tradeshow', location: 'a place'}]});
	      	return deferred.promise;
	      })
	      ctrl = $controller('TradeshowController', {$scope: $scope, loginService: loginServiceMock, tradeshowService: tradeshowServiceMock})
	      $httpBackend.expectGET('api/tradeshows?page=1&perPage=' + $scope.perPage + '&orderBy=' + $scope.orderBy + '&orderByReverse=' + $scope.orderByReverse)
      		.respond(200);
	      $scope.$digest()
	      spyOn($scope, "getTradeshows").and.callThrough();
	      spyOn($scope, "$broadcast")
	    });
    });
    it('should have a TradeshowController with defaults and call checkApiAccess on loginService', function() {
      expect(ctrl).toBeDefined();
      expect($scope.orderBy).toBe('id');
      expect($scope.orderByReverse).toEqual('0');
      expect($scope.perPage).toEqual('15');
      expect(loginServiceMock.checkApiAccess).toHaveBeenCalled();
      $scope.$digest()
    });
    it ('should call loginService refresh when rootScope emits event:auth-loginRequired event', function() {
    	loginServiceMock.refresh.and.callFake(function() {
    		var deferred = $q.defer()
    		deferred.resolve({data:{token:''}})
    		return deferred.promise;
    	})
    	$rootScope.$broadcast('event:auth-loginRequired');
    	expect(loginServiceMock.refresh).toHaveBeenCalled()
    })
    it ('should fetch tradeshows', function() {
    	expect(tradeshowServiceMock.retrieve).toHaveBeenCalled()
    })
    xit('should use scope params to retrieve from tradeshowService', function() {

      $httpBackend.expectGET('api/tradeshows?page=1&perPage=' + $scope.perPage + '&orderBy=' + $scope.orderBy + '&orderByReverse=' + $scope.orderByReverse)
      .respond(200);
      var succeeded;
      var promise = tradeshowService.retrieve(1, $scope.perPage, $scope.orderBy, $scope.orderByReverse);
      expect(promise).toBeDefined();
      promise.then(function(payload) {
        succeeded = true;
        var response = payload.data;

        $scope.tradeshows = [];
        $scope.currentPage = 1;
        $scope.lastPage = 2;
        $scope.range = [1,2];
        $scope.totalPages = 2;
      })
      $httpBackend.flush();
      expect(succeeded).toBeTruthy();

      expect(tradeshowService.getTradeshows().length).toEqual(0);
      expect($scope.range).toEqual([1,2]);
      expect($scope.tradeshows).toEqual([]);
      expect($scope.totalPages).toEqual(2);
      expect($scope.currentPage).toEqual(1);
    });
});