'use strict';

describe('tsportal.cache', function() {
	var $rootScope, mockCacheFactory, cachingService, caches = {};

	beforeEach(function() {
		module('tsportal.cache');

		window.mockCacheFactory = jasmine.createSpyObj('CacheFactory', ['create', 'new', 'get']);
		module(function($provide) {
			$provide.value('CacheFactory', jasmine.createSpy('CacheFactorySpy').and.callFake(function() {
				return mockCacheFactory;
			}));
		});
		inject(function(_$rootScope_, _CachingService_) {
			$rootScope = _$rootScope_;
			cachingService = _CachingService_;
		});
	});
	describe('CachingService', function() {
		it('should call new CacheFactory when calling createNewCache()', inject(function(CacheFactory) {
			spyOn(window, "mockCacheFactory");
			cachingService.createNewCache('test', {test: 'test'});
			expect(CacheFactory).toHaveBeenCalledWith('test', {test: 'test'});
		}));
	});

});