'use strict';
describe('LeadController', function() {
	var $httpBackend, $q, $scope, ctrl, messageService;
	var leadServiceMock, leadResourceMock, stateMock;
	beforeEach(function() {
		module('tsportal');

		leadServiceMock = jasmine.createSpyObj('leadService', ['retrieve']);
		leadResourceMock = jasmine.createSpyObj('Lead', ['get', 'save']);

		inject(function(_$httpBackend_, _$q_, $controller, $rootScope, _messageService_) {
			$scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			$q = _$q_;
			messageService = _messageService_;

			leadResourceMock.get.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({id: 1, first_name: 'john', last_name: 'doe', tradeshow_id: 1});
				deferred.$promise = deferred.promise;
				return deferred;
			});
			leadResourceMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({id: 1, first_name: 'jane', location: 'xdoe', tradeshow_id: 1});
				deferred.$promise = deferred.promise;
				return deferred;
			});

			ctrl = $controller('LeadController', {
				$rootScope: $rootScope,
				$scope: $scope,
				leadService: leadServiceMock,
				Lead: leadResourceMock,
				messageService: messageService,
				$stateParams: {
					id: 1
				}
			});
			spyOn(messageService, "addMessage").and.callThrough();
			$httpBackend.expectGET('api/tradeshows/1').respond(200);
			$httpBackend.expectGET('api/leads/1').respond(200);		
			localStorage.setItem('satellizer_token', 'token');
			localStorage.setItem('_satellizer_token', 'token');
			
			// $httpBackend.flush()	

		});

	});

	it('should have a LeadController instance and values set based on lead', function() {
		expect(ctrl).toBeDefined();
		$scope.$digest();		

		expect($scope.lead).toBeDefined();
		expect($scope.lead.first_name).toEqual('john');
		expect($scope.lead.last_name).toEqual('doe');
		expect($scope.lead.tradeshow_id).toEqual(1);
	});
	it('should call save on Lead Resource when calling $scope.save() and replace $scope.tradeshow with saved values', function() {
		var newValues = {first_name: 'test', last_name: 'save', id: 1};
		$scope.leadForm = $scope.lead = newValues;
		$scope.save();
		expect(leadResourceMock.save).toHaveBeenCalledWith(newValues);
		expect($scope.lead.first_name).toEqual('test');
		expect($scope.lead.last_name).toEqual('save');
		$scope.$digest();
		expect(messageService.addMessage).toHaveBeenCalledWith({
							icon: 'ok',
							type: 'success',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Your changes have been saved',
							id: 1
						});
	});
	it('should call save on Lead Resource when calling $scope.save() and if received rejection of promise, display error message', function() {
		leadResourceMock.save.and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({status: 500, data:[]});
			deferred.$promise = deferred.promise;
			return deferred;
		});
		var newValues = {first_name: 'test', last_name: 'save', id: 1};
		$scope.leadForm = $scope.lead = newValues;
		$scope.save();
		expect(leadResourceMock.save).toHaveBeenCalledWith(newValues);
		$scope.$digest();
		expect(messageService.addMessage).toHaveBeenCalledWith({
							icon: 'exclamation-sign',
							type: 'danger',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Sorry, something went wrong.',
							id: 1
						});
	});
});