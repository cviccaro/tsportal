'use strict';

describe('tsportal.tradeshows.TradeshowEditController', function() {
	var $rootScope, $scope, $controller, mockCacheFactory, formCache, 
		ctrl, authService, $stateMock, TradeshowMock, ngDialogMock, $q,
		leadService, $httpMock;

	$stateMock = jasmine.createSpyObj("$state", ["go"]);
	TradeshowMock = jasmine.createSpyObj("Tradeshow", ['save']);
	ngDialogMock = jasmine.createSpyObj("ngDialog", ['open']);

	var leadData = {
		status: 200,
		data: {
			current_page: 1,
			last_page: 1,
			data: [
				{id: 1, tradeshow_id: 1, first_name: "john", last_name: "doe", email_address: "johndoe@gmail.com", phone_number: '1-234-567-8901'}
			],
		}
	};
	var tradeshow = {
		id: 1,
		name: 'test show',
		location: 'test show',
		active: 1,
		updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
	};

	$httpMock = {
		defaults: {
			cache: {
				removeAll: function() {

				}
			}
		}
	};

	beforeEach(function() {
		module('tsportal.tradeshows');
		module('mockCacheFactory');

		module(function($provide) {
			$provide.value('$state', $stateMock);
		});

		inject(function(_$rootScope_, _$controller_, _authService_, _$q_, _CacheFactory_, _leadService_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$controller = _$controller_;
			authService = _authService_;
			$q = _$q_;
			mockCacheFactory = _CacheFactory_;
			formCache = mockCacheFactory.get('formCache');
			leadService = _leadService_;
		});

		ngDialogMock.open.and.callFake(function() {
			var deferred = $q.defer();
			deferred.resolve();
			return {
				closePromise: deferred.promise
			};
		});

		spyOn(authService, "checkApiAccess").and.callThrough();

	});

	describe('TradeshowEditController defaults', function() {
		beforeEach(function() {
			ctrl = $controller('TradeshowEditController', {
				$scope: $scope,
				authService: authService,
				$state: $stateMock,
				Tradeshow: TradeshowMock,
				ngDialog: ngDialogMock,
				promisedData: tradeshow,
				promisedLeadData: leadData,
				promisedFormCache: formCache,
				leadService: leadService,
				$http: $httpMock
			});
			spyOn($httpMock.defaults.cache, "removeAll");
		});
		it('should have a TradeshowEditController', function() {
			expect(ctrl).toBeDefined();
		});
		it('should be able to determine if lead is recent if it has been updated within the past hour', function() {
			// invalid date should just return false
			expect(ctrl.isRecent({updated_at: '-invalid'})).toBeFalsy();
			// updated within an hour = recent
			expect(ctrl.isRecent({
				id: 1, 
				updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
			})).toBeTruthy();

			// updated over an hour ago = not recent
			expect(ctrl.isRecent({
				id: 2, 
				updated_at: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss')
			})).toBeFalsy();
		});
		it('should goto tradeshows view when goBack() is called', function() {
			ctrl.goBack();
			$rootScope.$digest();
			expect($stateMock.go).toHaveBeenCalledWith("tradeshows");
		});
		it('should pluck a lead and call leadService.deleteLead() when deleteLead() is called', function() {
			$rootScope.$digest();

			spyOn(leadService, "deleteLead");
			spyOn(ctrl, "pluckLead").and.callThrough();

			// Check it returns false for undefined lead
			expect(ctrl.pluckLead(99999999)).toBeFalsy();

			expect(ctrl.leads[0].id).toEqual(1);
			expect(ctrl.pluckLead(1)).not.toBeFalsy();
			
			ctrl.deleteLead(1);
			expect(ctrl.pluckLead).toHaveBeenCalledWith(1);
			expect(leadService.deleteLead).toHaveBeenCalledWith(leadData.data.data[0]);
		});
		it('should not proceed with save if form is invalid', function() {
			ctrl.tradeshowForm = {};
			ctrl.tradeshowForm.$invalid = true;
			ctrl.save();
			expect(TradeshowMock.save).not.toHaveBeenCalled();
		});
		it('should proceed with save if form is valid, clear http cache and show sucess message if Tradeshow.save() succeeds', function() {
			ctrl.addSuccessMessage = function() {};
			spyOn(ctrl, "addSuccessMessage");
			TradeshowMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.$promise = deferred.promise;
				deferred.resolve({id: 999999});
				return deferred;
			});
			ctrl.tradeshowForm = {};
			ctrl.tradeshowForm.$valid = true;
			ctrl.save();
			$rootScope.$digest();
			expect(TradeshowMock.save).toHaveBeenCalled();
			expect(ctrl.addSuccessMessage).toHaveBeenCalled();
			expect($httpMock.defaults.cache.removeAll).toHaveBeenCalled();
		});
		it('should proceed with save if form is valid, show error message if Tradeshow.save() fails', function() {
			ctrl.addErrorMessage = function() {};
			spyOn(ctrl, "addErrorMessage");
			TradeshowMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.$promise = deferred.promise;
				deferred.reject();
				return deferred;
			});
			ctrl.tradeshowForm = {};
			ctrl.tradeshowForm.$valid = true;
			ctrl.save();
			$rootScope.$digest();
			expect(TradeshowMock.save).toHaveBeenCalled();
			expect(ctrl.addErrorMessage).toHaveBeenCalled();
		});
		it('should call getLeads() when refreshLeads() is called', function() {
			spyOn(ctrl, "getLeads").and.callThrough();
			ctrl.refreshLeads();
			expect(ctrl.getLeads).toHaveBeenCalled();
		});
		it('should call getLeads() with pageNum set to last available page when refreshLeads() is called and lastFetchedPage is larger than the new data set\'s last page', function() {
			var leads = ctrl.leads;
			spyOn(ctrl, "getLeads").and.callThrough();
			spyOn(leadService, "retrieve").and.callFake(function() {
				ctrl.lastFetchedPage = 99999;
				return $q.when(leadData);
			});
			ctrl.refreshLeads();
			$rootScope.$digest();
			expect(ctrl.getLeads.calls.mostRecent().args[0]).toEqual(1);
		});
	});
	
	describe('TradeshowEditController with cache', function() {
		it('should defer to formCache to set page state if it is available', function() {
			formCache.put('currentPage', 5);
			formCache.put('query', 'test cached query');
			formCache.put('orderBy', 'name');
			formCache.put('orderByReverse', 0);
			formCache.put('perPage', 50);

			ctrl = $controller('TradeshowEditController', {
				$scope: $scope,
				ngDialog: ngDialogMock,
				promisedData: tradeshow,
				promisedLeadData: leadData,
				promisedFormCache: formCache,
				leadService: leadService
			});

			$rootScope.$digest();

			expect(ctrl.currentPage).toEqual(5);
			expect(ctrl.query).toEqual('test cached query');
			expect(ctrl.orderBy).toEqual('name');
			expect(parseInt(ctrl.orderByReverse)).toEqual(0);
			expect(parseInt(ctrl.perPage)).toEqual(50);
		});
		it('should update cache when scope variables change', function() {
			ctrl = $controller('TradeshowEditController', {
				$scope: $scope,
				ngDialog: ngDialogMock,
				promisedData: tradeshow,
				promisedLeadData: leadData,
				promisedFormCache: formCache,
				leadService: leadService
			});
			
			$scope.ctrl = {query: 'test new query'};
			$rootScope.$digest();
			
			expect(ctrl.formCache.get('query')).toEqual('test new query');
		});
	});
});