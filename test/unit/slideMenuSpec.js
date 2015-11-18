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
		module('templates');
		inject(function(_$rootScope_, _$httpBackend_, _$http_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			$http = _$http_;
		});
	});
	describe('tsportal.slideMenu config (slideMenuProvider)', function() {
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

	describe('slideMenuDirective', function() {
		var $compile, $document, $window, $timeout;
		beforeEach(function() {
			inject(function(_$compile_, _$document_, _$window_, _$timeout_) {
				$compile = _$compile_;
				$document = _$document_;
				$window = _$window_;
				$timeout = _$timeout_;
			});
		});

		it('should properly replace element with template and should defer to alignment set on the slide-menu elemenet', function() {
			slideMenuProvider.registerMenu('testMenu', {
				alignment: 'bottom',
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

			var element = $compile('<slide-menu slide-menu-alignment="right"></slide-menu>')($rootScope);
			$rootScope.$digest();
			$rootScope.openMenu('testMenu');
			expect(element.attr('class')).toContain('menu-right');

			// Defer to alignment set in the menu config
			element = $compile('<slide-menu></slide-menu>')($rootScope);
			$rootScope.$digest();
			$rootScope.openMenu('testMenu');
			expect(element.attr('class')).toContain('menu-bottom');
		});

		it('should map object in second argument of openMenu to current scope', function() {
			// Ensure $stateChangeStart is emitted already
			$rootScope.$digest();
			slideMenuProvider.registerMenu('testMenu', {
				responsive: true,
				items: {
					test: {
						url: 'test', 
						title: 'test title'
					}, 
				}
			});
			
			var element = $compile('<slide-menu></slide-menu>')($rootScope);
			$rootScope.$digest();
			$rootScope.openMenu('testMenu', {test: 'test value'});
			$rootScope.$digest();
			expect($rootScope.test).toEqual('test value');
			$timeout.flush();
		});

		it('should hide slideMenu when $stateChangeStart is emitted on $rootScope', function() {
			// Ensure $stateChangeStart is emitted already
			$rootScope.$digest();

			// Defer to alignment set in the menu config
			var element = $compile('<slide-menu></slide-menu>')($rootScope);
			$rootScope.$digest();
			
			spyOn($rootScope, "closeMenu").and.callThrough();

			$rootScope.$emit("$stateChangeStart");
			$rootScope.$digest();

			expect($rootScope.closeMenu).toHaveBeenCalled();
		});


		it('should hide slideMenu when document receives keyup event on ESC key', function() {
			// Ensure $stateChangeStart is emitted already
			$rootScope.$digest();

			// Defer to alignment set in the menu config
			var element = $compile('<slide-menu></slide-menu>')($rootScope);
			$rootScope.$digest();
			
			spyOn($rootScope, "closeMenu").and.callThrough();

			var e = $.Event("keyup");
			e.which = 27;
			$document.trigger(e);
			$rootScope.$digest();

			expect($rootScope.closeMenu).toHaveBeenCalled();
		});	

		it('should rederive cssClasses on window resize if responsive on activeMenu is enabled', function() {
			// Ensure $stateChangeStart is emitted already
			$rootScope.$digest();
			slideMenuProvider.registerMenu('testMenu', {
				responsive: true,
				items: {
					test: {
						url: 'test', 
						title: 'test title'
					}, 
				}
			});
			
			var element = $compile('<slide-menu></slide-menu>')($rootScope);
			$rootScope.$digest();
			
			spyOn($rootScope, "slideMenuClasses").and.callThrough();

			$rootScope.openMenu('testMenu');

			$rootScope.$digest();
			expect($rootScope.slideMenuClasses).toHaveBeenCalled();
			expect($rootScope.slideMenuClasses.calls.count()).toEqual(1);

			$($window).trigger('resize');
			expect($rootScope.slideMenuClasses).toHaveBeenCalled();
			expect($rootScope.slideMenuClasses.calls.count()).toEqual(2);
		});		
	});
});