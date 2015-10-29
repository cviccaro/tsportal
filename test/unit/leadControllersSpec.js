'use strict';
describe('LeadController', function() {
	var $httpBackend, $q, $scope, ctrl;
	var leadServiceMock, leadResourceMock, stateMock;
	beforeEach(function() {
		module('tsportal');

		leadServiceMock = jasmine.createSpyObj('leadService', ['retrieve']);
		leadResourceMock = jasmine.createSpyObj('Lead', ['get', 'save']);

		inject(function(_$httpBackend_, _$q_, $controller, $rootScope) {
			$scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			$q = _$q_;

			leadResourceMock.get.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({lead:{id: 1, first_name: 'john', last_name: 'doe', tradeshow_id: 1}});
				deferred.$promise = deferred.promise;
				return deferred;
			});
			leadResourceMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({lead:{id: 1, first_name: 'jane', location: 'xdoe', tradeshow_id: 1}});
				deferred.$promise = deferred.promise;
				return deferred;
			});

			ctrl = $controller('LeadController', {
				$scope: $scope,
				leadService: leadServiceMock,
				Lead: leadResourceMock,
				$stateParams: {
					id: 1
				}
			});
		});
		$httpBackend.expectGET('api/tradeshows/1').respond(200);
		$httpBackend.expectGET('api/leads/1').respond(200);
		$scope.$digest();
	});

	it('should have a LeadController instance and values set based on lead', function() {
		expect(ctrl).toBeDefined();
		$scope.$digest();
		expect($scope.lead).toBeDefined();
		expect($scope.lead.first_name).toEqual('john');
		expect($scope.lead.last_name).toEqual('doe');
		expect($scope.lead.tradeshow_id).toEqual(1);
	});
	it('should call save on Tradeshow Resource when calling $scope.save() and replace $scope.tradeshow with saved values', function() {
		var newValues = {first_name: 'test', last_name: 'save', id: 1};
		$scope.leadForm = $scope.lead = newValues;
		$scope.save();
		expect(leadResourceMock.save).toHaveBeenCalledWith(newValues);
		expect($scope.lead.first_name).toEqual('test');
		expect($scope.lead.last_name).toEqual('save');
	});
});