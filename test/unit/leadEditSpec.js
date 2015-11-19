'use strict';

describe('tsportal.leads', function() {
	var $rootScope, $scope, $controller, ctrl, $stateMock,
		LeadMock, TradeshowMock, $httpMock, $q;

	$stateMock = jasmine.createSpyObj("$state", ["go"]);
	LeadMock = jasmine.createSpyObj("Lead", ['save']);
	TradeshowMock = jasmine.createSpyObj("Tradeshow", ['get']);
	$httpMock = {
		defaults: {
			cache: {
				removeAll: function() {

				}
			}
		}
	};

	beforeEach(function() {
		module('tsportal.leads');
		inject(function(_$rootScope_, _$controller_, _$q_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$controller = _$controller_;
			$q = _$q_;
		});
		ctrl = $controller('LeadEditController', {
			$scope: $scope,
			$state: $stateMock,
			Lead: LeadMock,
			Tradeshow: TradeshowMock,
			$http: $httpMock,
			leadData: {
				id: 1,
				tradeshow_id: 54,
				first_name: "john",
				last_name: "doe",
				email_address: "johndoe@gmail.com",
				phone_number: "1-234-657-8901",
				contact_by_phone: 0,
				contact_by_email: 1,
				existing_customer: 1,
				updated_at: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
			}
		});
		spyOn($httpMock.defaults.cache, "removeAll");
	});

	describe('LeadEditController', function() {
		it('should have a Lead Edit Controller', function() {
			expect(ctrl).toBeDefined();
			expect(ctrl.lead).toBeDefined();
			expect(ctrl.lead.id).toEqual(1);
			expect(ctrl.lead.email_address).toEqual('johndoe@gmail.com');
		});
		it('should goto tradeshow edit view when goBack() is called', function() {
			ctrl.goBack();
			$rootScope.$digest();
			expect($stateMock.go).toHaveBeenCalledWith("tradeshowEdit", {id: 54});
		});
		it('should not proceed with save if form is invalid', function() {
			ctrl.leadForm = {};
			ctrl.leadForm.$invalid = true;
			ctrl.save();
			expect(LeadMock.save).not.toHaveBeenCalled();
		});
		it('should proceed with save if form is valid, clear http cache and show sucess message if Lead.save() succeeds', function() {
			ctrl.addSuccessMessage = function() {};
			spyOn(ctrl, "addSuccessMessage");
			LeadMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.$promise = deferred.promise;
				deferred.resolve({});
				return deferred;
			});
			ctrl.leadForm = {};
			ctrl.leadForm.$valid = true;
			ctrl.save();
			$rootScope.$digest();
			expect(LeadMock.save).toHaveBeenCalled();
			expect(ctrl.addSuccessMessage).toHaveBeenCalled();
			expect($httpMock.defaults.cache.removeAll).toHaveBeenCalled();
		});
		it('should proceed with save if form is valid, show error message if Lead.save() fails', function() {
			ctrl.addErrorMessage = function() {};
			spyOn(ctrl, "addErrorMessage");
			LeadMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.$promise = deferred.promise;
				deferred.reject();
				return deferred;
			});
			ctrl.leadForm = {};
			ctrl.leadForm.$valid = true;
			ctrl.save();
			$rootScope.$digest();
			expect(LeadMock.save).toHaveBeenCalled();
			expect(ctrl.addErrorMessage).toHaveBeenCalled();
		});
	});
});