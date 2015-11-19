'use strict';

describe('tsportal.tradeshows.TradeshowListController', function() {

	var $rootScope, $scope, $controller, mockCacheFactory, formCache,
		ctrl, tradeshowService, leadService, $q, promisedData,
		$timeout, $windowMock, authService;

	beforeEach(function() {
		module('mockCacheFactory');
		module('tsportal.tradeshows');

		$windowMock = {
			location: {
				href: ''
			}
		};

		module(function($provide) {
			$provide.value('$window', $windowMock);
		});
		inject(function(_$rootScope_, _$controller_, _CacheFactory_, _tradeshowService_, _leadService_, _$q_, _$timeout_, _authService_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$controller = _$controller_;
			tradeshowService = _tradeshowService_;
			leadService = _leadService_;
			mockCacheFactory = _CacheFactory_;
			formCache = mockCacheFactory.get('formCache');
			$q = _$q_;
			$timeout = _$timeout_;
			authService = _authService_;
		});	
	});

	describe('TradeshowListController defaults', function() {
		beforeEach(function() {
			promisedData = {
				status: 200, 
				data: {
					current_page: 1,
					last_page: 4,
					data: [
						{
							id: 1, 
							name: 'test show', 
							location: 'test location', 
							active: 1, 
							updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
						},
						{
							id: 2, 
							name: 'test show 2', 
							location: 'test location 2', 
							active: 1, 
							updated_at: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss')
						}
					]
				}
			};
			ctrl = $controller('TradeshowListController', {
				$scope: $scope,
				promisedFormCache: formCache,
				leadService: leadService,
				tradeshowService: tradeshowService,
				promisedData: promisedData,
				authService: authService
			});
			authService.token.set('test');
			$rootScope.$digest();
		});
		it('should have a tradeshowListController and set page state based on promisedData and defaults (when formCache is empty)', function() {
			expect(ctrl).toBeDefined();
			expect(ctrl.tradeshows.length).toEqual(2);
			expect(ctrl.tradeshows[0].name).toEqual('test show');
			expect(ctrl.currentPage).toEqual(1);
			expect(ctrl.totalPages).toEqual(4);
			expect(ctrl.query).toEqual('');
			expect(ctrl.orderBy).toEqual('updated_at');
			expect(parseInt(ctrl.orderByReverse)).toEqual(1);
			expect(parseInt(ctrl.perPage)).toEqual(15);
		});
		it('should pluck a tradeshow and call tradeshowService.deleteTradeshow() when TradeshowListController.deleteTradeshow() is called', function() {
			spyOn(tradeshowService, "deleteTradeshow");
			spyOn(ctrl, "pluckTradeshow").and.callThrough();

			// Check it returns false for undefined tradeshow
			expect(ctrl.pluckTradeshow(99999999)).toBeFalsy();

			ctrl.deleteTradeshow(1);
			expect(ctrl.pluckTradeshow).toHaveBeenCalledWith(1);
			expect(tradeshowService.deleteTradeshow).toHaveBeenCalledWith(ctrl.tradeshows[0]);
		});
		it('should pluck a lead and call leadService.deleteLead() when TradeshowListController.deleteLead() is called', function() {
			var lead = {id: 1, first_name: 'john', last_name: 'doe'};
			ctrl.leads = [lead];

			spyOn(leadService, "deleteLead");
			spyOn(ctrl, "pluckLead").and.callThrough();

			// Check it returns false for undefined lead
			expect(ctrl.pluckLead(99999999)).toBeFalsy();
			
			ctrl.deleteLead(1);
			expect(ctrl.pluckLead).toHaveBeenCalledWith(1);
			expect(leadService.deleteLead).toHaveBeenCalledWith(lead);
		});
		it('should be able to determine if tradeshow is recent if it has been updated within the past hour', function() {
			// invalid date should just return false
			expect(ctrl.isRecent({updated_at: '-invalid'})).toBeFalsy();
			// updated within an hour = recent
			expect(ctrl.isRecent(ctrl.tradeshows[0])).toBeTruthy();
			// updated over an hour ago = not recent
			expect(ctrl.isRecent(ctrl.tradeshows[1])).toBeFalsy();
		});
		it('should call getTradeshows() when refreshTradeshows() is called', function() {
			spyOn(ctrl, "getTradeshows").and.callThrough();
			ctrl.refreshTradeshows();
			expect(ctrl.getTradeshows).toHaveBeenCalled();
		});
		it('should call getTradeshows() with pageNum set to last available page when refreshTradeshows() is called and lastFetchedPage is larger than the new data set\'s last page', function() {
			var tradeshows = ctrl.tradeshows;
			spyOn(ctrl, "getTradeshows").and.callThrough();
			spyOn(tradeshowService, "retrieve").and.callFake(function() {
				ctrl.lastFetchedPage = 15;
				return $q.when(promisedData);
			});
			ctrl.refreshTradeshows();
			$rootScope.$digest();
			expect(ctrl.getTradeshows.calls.mostRecent().args[0]).toEqual(4);
		});
		it('should call leadService.retrieve() when getLeads() is called', function() {
			spyOn(leadService, "retrieve").and.callFake(function() {
				return $q.when({
					status: 200, 
					data: {
						current_page: 1,
						last_page: 1,
						data: [
							{id: 1, first_name: "john", last_name: "doe"}
						]
					}
				});
			});
			var tradeshow = {id: 1};
			ctrl.getLeads(1, tradeshow);
			$rootScope.$digest();
			$timeout.flush();
			expect(leadService.retrieve).toHaveBeenCalledWith(1, 1, 50, 'id', 0);
		});
		it('should use tradeshow stored in variable selectedTradeshow if getLeads is passed an undefined tradeshow', function() {
			spyOn(leadService, "retrieve").and.callFake(function() {
				return $q.when({data: {}});
			});
			ctrl.selectedTradeshow = {id: 49};
			ctrl.getLeads(1, undefined);
			$rootScope.$digest();
			$timeout.flush();
			expect(leadService.retrieve.calls.mostRecent().args[0]).toEqual(49);
		});
		it('should change $window.location.href when calling downloadReport()', function() {
			ctrl.downloadReport(1);
			$rootScope.$digest();
			expect($windowMock.location.href).toContain('/api/tradeshows/1/report');
		});
	});
	describe('TradeshowListController with cache', function() {
		it('should defer to formCache to set page state if it is available', function() {
			formCache.put('currentPage', 5);
			formCache.put('query', 'test cached query');
			formCache.put('orderBy', 'name');
			formCache.put('orderByReverse', 0);
			formCache.put('perPage', 50);

			ctrl = $controller('TradeshowListController', {
				$scope: $scope,
				promisedFormCache: formCache,
				leadService: leadService,
				tradeshowService: tradeshowService,
				promisedData: {
					status: 200, 
					data: {
						current_page: 1,
						last_page: 4,
						data: []
					}
				}
			});

			$rootScope.$digest();

			expect(ctrl.currentPage).toEqual(5);
			expect(ctrl.query).toEqual('test cached query');
			expect(ctrl.orderBy).toEqual('name');
			expect(parseInt(ctrl.orderByReverse)).toEqual(0);
			expect(parseInt(ctrl.perPage)).toEqual(50);
		});
		it('should update cache when scope variables change', function() {
			ctrl = $controller('TradeshowListController', {
				$scope: $scope,
				promisedFormCache: formCache,
				promisedData: {
					status: 200, 
					data: {
						current_page: 1,
						last_page: 4,
						data: []
					}
				}
			});
			
			$scope.ctrl = {query: 'test new query'};
			$rootScope.$digest();
			
			expect(ctrl.formCache.get('query')).toEqual('test new query');
		});
	});
});