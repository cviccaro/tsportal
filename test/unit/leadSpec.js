'use strict';

describe('tsportal.lead', function() {
	var $rootScope, $scope, $httpBackend, $http, leadService, cachingService, mockCacheFactory, mockLeadResource, mockNgDialog, $q, caches = {};

	beforeEach(function() {
		module('tsportal.cache');
		module('tsportal.busyIndicator');
		module('tsportal.lead');
		

		mockCacheFactory = jasmine.createSpyObj('CacheFactory', ['create', 'new', 'get']);
		mockLeadResource = jasmine.createSpyObj('Lead', ['delete']);
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
			$provide.value('Lead', mockLeadResource);
		});

		inject(function(_$rootScope_, _$httpBackend_, _$http_, _leadService_, _CachingService_, _$q_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			$http = _$http_;
			leadService = _leadService_;
			cachingService = _CachingService_;
			$q = _$q_;
		});

		spyOn(window.location, "reload");

	});

	describe('leadService', function() {
		it('should set default values when calling retrieve() if they are undefined (except tradeshow_id)', function() {
			expect(leadService).toBeDefined();
			leadService.retrieve(1);
			$httpBackend.expectGET('api/tradeshows/1/leads?page=1&perPage=15&orderBy=updated_at&orderByReverse=1&filter=').respond({});
			$httpBackend.flush();
		});
		it('should be able to pass own arguments into retrieve()', function() {
			expect(leadService).toBeDefined();
			leadService.retrieve(22, 2, 3, 'id', 1, 'test');
			$httpBackend.expectGET('api/tradeshows/22/leads?page=2&perPage=3&orderBy=id&orderByReverse=1&filter=test').respond({});
			$httpBackend.flush();
		});	
		it('should open an ngDialog when calling deleteLead() to confirm, and to show success, and reload the page when dialog is closed', function() {
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
			mockLeadResource.delete.and.callFake(function() {
				var deferred = $q.defer();
				deferred.$promise = deferred.promise;
				deferred.resolve({status: 200, success: true});
				return deferred;
			});
			leadService.deleteLead({id: 99999999});
			$rootScope.$digest();
			expect(mockNgDialog.openConfirm).toHaveBeenCalled();
			expect(mockLeadResource.delete).toHaveBeenCalled();
			expect(finalDialogWasOpened).toBeTruthy();
			expect(window.location.reload).toHaveBeenCalled();
		});
	});
});