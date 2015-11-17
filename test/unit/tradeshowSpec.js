'use strict';

describe('tsportal.tradeshow', function() {
	var $rootScope, $scope, $httpBackend, $http, tradeshowService, cachingService, mockCacheFactory, mockTradeshowResource, mockNgDialog, $q, caches = {};

	beforeEach(function() {
		module('tsportal.cache');
		module('tsportal.busyIndicator');
		module('tsportal.tradeshow');
		

		mockCacheFactory = jasmine.createSpyObj('CacheFactory', ['create', 'new', 'get']);
		mockTradeshowResource = jasmine.createSpyObj('Tradeshow', ['delete']);
		mockNgDialog = jasmine.createSpyObj('ngDialog', ['openConfirm', 'open']);

		mockCacheFactory.get.and.callFake(function(cacheName) {
			if (!caches.hasOwnProperty(cacheName)) {
				caches[cacheName] = {};
			}
			return {
				get: function(key) { 
					return caches[cacheName][key];
				},
				put: function(key, val) {
					caches[cacheName][key] = val;
					return val;
				},
				remove: function(key) {
					delete caches[cacheName][key];
				} 
			};
		});
		module(function($provide) {
			$provide.value('CacheFactory', mockCacheFactory);
			$provide.value('ngDialog', mockNgDialog);
			$provide.value('Tradeshow', mockTradeshowResource);
		});

		inject(function(_$rootScope_, _$httpBackend_, _$http_, _tradeshowService_, _CachingService_, _$q_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			$http = _$http_;
			tradeshowService = _tradeshowService_;
			cachingService = _CachingService_;
			$q = _$q_;
		});

		spyOn(window.location, "reload");

	});

	describe('tradeshowService', function() {
		it('should set default values when calling retrieve() if they are undefined', function() {
			expect(tradeshowService).toBeDefined();
			tradeshowService.retrieve();
			$httpBackend.expectGET('api/tradeshows?page=1&perPage=15&orderBy=updated_at&orderByReverse=1&filter=').respond({tradeshows: {}});
			$httpBackend.flush();
		});
		it('should be able to pass own arguments into retrieve()', function() {
			expect(tradeshowService).toBeDefined();
			tradeshowService.retrieve(2, 3, 'id', 1, 'test');
			$httpBackend.expectGET('api/tradeshows?page=2&perPage=3&orderBy=id&orderByReverse=1&filter=test').respond({tradeshows: {}});
			$httpBackend.flush();
		});	
		it('should open an ngDialog when calling deleteTradeshow() to confirm, and to show success, and reload the page when dialog is closed', function() {
			var finalDialogWasOpened = false;
			// Simluate a close promise that is resolved (closed by user)
			mockNgDialog.open.and.callFake(function() {
				finalDialogWasOpened = true;
				return {
					closePromise: $q.when('closePromise')
				};
			});
			mockNgDialog.openConfirm.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve();
				return deferred.promise;
			});
			mockTradeshowResource.delete.and.callFake(function() {
				var deferred = $q.defer();
				deferred.$promise = deferred.promise;
				deferred.resolve({status: 200, success: true});
				return deferred;
			});
			tradeshowService.deleteTradeshow({id: 99999999});
			$rootScope.$digest();
			expect(mockNgDialog.openConfirm).toHaveBeenCalled();
			expect(mockTradeshowResource.delete).toHaveBeenCalled();
			expect(finalDialogWasOpened).toBeTruthy();
			expect(window.location.reload).toHaveBeenCalled();
		});
	});
});