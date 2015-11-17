'use strict';
describe('tsportal.slideMenu', function() {
	var slideMenuService, $rootScope, $scope, $http, $httpBackend, slideMenuProvider;
	beforeEach(function() {
		var fakeModule = angular.module('test.app.config', []);
		fakeModule.config( function (slideMenuServiceProvider) {
		    slideMenuProvider = slideMenuServiceProvider;
		});
		module('tsportal.slideMenu');
		module('test.app.config');
		inject(function(_$rootScope_, _$httpBackend_, _$http_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			$http = _$http_;
		});
	});
	describe('slideMenuProvider', function() {
		it('should be able to register a menu in the slideMenuProvider using a config block', function() {
			expect(slideMenuProvider).toBeDefined();
			slideMenuProvider.registerMenu('testMenu', {items:{test: {url: '', title: ''}}});
			var slideMenuService = slideMenuProvider.$get($rootScope);
			var i = 0, first_key;
			for (var key in slideMenuService.menus) {
				if (i++ === 0) {
					first_key = key;
				}
			}
			expect(first_key).toEqual('testMenu');
			expect(1).toEqual(1);
		});
	});
	describe('slideMenuService', function() {
		it('buildMenu() should properly build a menu with ul, li, and a tags', function() {
			slideMenuProvider.registerMenu('testMenu', {
				items: {
					test: {
						url: 'test', 
						title: 'test title'
					}, 
					test2: {
						url: 'url/with/paths',
						title: 'url with paths',
					},
					clickTest: {
						click: 'someController.someMethod',
						title: 'A link with ng-click',
					},
					linkWithShow: {
						show: 'someController.someExpress',
						title: 'A link with ng-show',
						url: 'test'
					}
				}
			});
			var slideMenuService = slideMenuProvider.$get($rootScope);
			var built = slideMenuService.buildMenu(slideMenuService.menus.testMenu);
			var expectedHtml = '<ul class="list-unstyled"><li><a title="test" href="/#/test">test title</a></li><li><a title="test2" href="/#/url/with/paths">url with paths</a></li><li><a title="clickTest" href="javascript:void(0)" ng-click="someController.someMethod">A link with ng-click</a></li><li><a title="linkWithShow" href="/#/test" ng-show="someController.someExpress">A link with ng-show</a></li></ul>';
			expect(built).toEqual(expectedHtml);
		});
	});
});