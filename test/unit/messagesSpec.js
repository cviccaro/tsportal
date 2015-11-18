'use strict';
describe('tsportal.messages', function() {
	var messageService, $rootScope, $scope, $http, $httpBackend;
	beforeEach(function() {
		module('tsportal.messages');
		module('templates');
		inject(function(_$rootScope_, _messageService_, _$httpBackend_, _$http_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			messageService = _messageService_;
			$httpBackend = _$httpBackend_;
			$http = _$http_;
		});
		spyOn(messageService, "addMessage").and.callThrough();
		spyOn(messageService, "getMessages").and.callThrough();
		spyOn(messageService, "purge").and.callThrough();
		spyOn(messageService, "removeMessage").and.callThrough();
	});


	describe('messageService', function() {
		it('should set id to 1 of a newly added message on newly instantied messageService', function() {
			expect(messageService).toBeDefined();
			messageService.addMessage({type: 'success', message: 'test'});
			expect(messageService.getMessages()[0].id).toEqual(1);
			expect(messageService.getMessages()[0].message).toEqual('test');
		});
		it('should remove a message when calling removeMessage on a valid index', function() {
			messageService.addMessage({type: 'success', message: 'test'});
			expect(messageService.getMessages()[0].id).toEqual(1);
			expect(messageService.getMessages()[0].message).toEqual('test');
			messageService.removeMessage(1);
			expect(messageService.getMessages().length).toEqual(0);
		});
		it('should remove all messages when calling purge()', function() {
			messageService.addMessage({type: 'success', message: 'test'});
			messageService.addMessage({type: 'success', message: 'test'});
			messageService.addMessage({type: 'success', message: 'test'});
			expect(messageService.getMessages().length).toEqual(3);
			messageService.purge();
			expect(messageService.getMessages().length).toEqual(0);
		});
	});

	describe('messageDirective', function() {
		var $compile, $timeout;
		beforeEach(function() {
			inject(function(_$compile_, _$timeout_) {
				$compile = _$compile_;
				$timeout = _$timeout_;
			});
		});
		it('should replace with messages template', function() {
			$rootScope.ctrl = {};
			messageService.addMessage({type: 'success', message: 'test'});
			var element = $compile('<messages></messages>')($rootScope);
			$rootScope.$digest();
			expect(element.html()).toContain('<div ng-repeat="message in ctrl.messages" message-id="1" class="alert fade alert-success" role="alert">');
			expect(element.html()).toContain('<span class="ng-binding">test...</span>');
		});
		it('should purge messages when $rootScope broadcasts $stateChangeSuccess', function() {
			spyOn($rootScope, "$on").and.callThrough();

			var element = $compile('<messages></messages>')($rootScope);
			// Digest now so $stateChangeSuccess is called automatically.. will test msnually below
			$rootScope.$digest();

			messageService.addMessage({type: 'success', message: 'test'});
			expect(messageService.getMessages().length).toEqual(1);

			$rootScope.$emit('$stateChangeSuccess');
			$rootScope.$digest();

			expect(messageService.purge).toHaveBeenCalled();
			expect(messageService.getMessages().length).toEqual(0);
		});

		it('should attach methods to scope or controller if available under propertyName ctrl', function() {
			$rootScope.ctrl = {};
			var element = $compile('<messages></messages>')($rootScope);
			$rootScope.$digest();
			expect($rootScope.ctrl.addMessage).toBeDefined();
			expect($rootScope.ctrl.removeMessage).toBeDefined();
			expect($rootScope.ctrl.addSuccessMessage).toBeDefined();
			expect($rootScope.ctrl.addErrorMessage).toBeDefined();
			expect($rootScope.ctrl.purgeMessages).toBeDefined();
		});
		it('attached method, addMessage, should work', function() {
			// none to start
			expect(messageService.getMessages().length).toEqual(0);

			$rootScope.ctrl = {};
			var element = $compile('<messages></messages>')($rootScope);
			$rootScope.$digest();
			$rootScope.ctrl.addMessage({type: 'success', message: 'test'});
			$rootScope.$digest();
			expect(element.html()).toContain('<div ng-repeat="message in ctrl.messages" message-id="1" class="alert fade alert-success" role="alert">');
			expect(element.html()).toContain('<span class="ng-binding">test...</span>');
			$timeout.flush();
		});

		it('attached method, removeMessage, should remove message from messageService', function() {
			// none to start
			expect(messageService.getMessages().length).toEqual(0);

			$rootScope.ctrl = {};
			var element = $compile('<messages></messages>')($rootScope);
			$rootScope.$digest();
			messageService.addMessage({type: 'success', message: 'test'});
			$rootScope.$digest();
			$timeout.flush();
			expect(messageService.getMessages().length).toEqual(1);

			$rootScope.ctrl.removeMessage(1);
			$timeout.flush();
			$rootScope.$digest();
			expect(messageService.getMessages().length).toEqual(0);
		});

		it('attached method, addSuccessMessage, should provide defaults that can be overriden and pass to addMessage', function() {
			// none to start
			expect(messageService.getMessages().length).toEqual(0);

			$rootScope.ctrl = {};
			var element = $compile('<messages></messages>')($rootScope);
			$rootScope.$digest();

			spyOn($rootScope.ctrl, "addMessage").and.callThrough();

			$rootScope.ctrl.addSuccessMessage();
			$timeout.flush();
			$rootScope.$digest();
			expect(messageService.getMessages().length).toEqual(1);
			expect($rootScope.ctrl.addMessage).toHaveBeenCalled();
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].icon).toEqual('ok');
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].type).toEqual('success');
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].iconClass).toEqual('icon-medium');
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].dismissible).toBeTruthy();
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].message).toEqual('Your changes have been saved');

			messageService.purge();
			$rootScope.$digest();

			// Try configured success message
			$rootScope.ctrl.addSuccessMessage({iconClass: 'icon-test'});
			$timeout.flush();
			$rootScope.$digest();
			expect(messageService.getMessages().length).toEqual(1);
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].iconClass).toEqual('icon-test');
		});

		it('attached method, addErrorMessage, should provide defaults that can be overriden and pass to addMessage', function() {
			// none to start
			expect(messageService.getMessages().length).toEqual(0);

			$rootScope.ctrl = {};
			var element = $compile('<messages></messages>')($rootScope);
			$rootScope.$digest();

			spyOn($rootScope.ctrl, "addMessage").and.callThrough();

			$rootScope.ctrl.addErrorMessage();
			$rootScope.$digest();
			$timeout.flush();

			expect(messageService.getMessages().length).toEqual(1);
			expect($rootScope.ctrl.addMessage).toHaveBeenCalled();
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].icon).toEqual('exclamation-sign');
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].type).toEqual('danger');
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].iconClass).toEqual('icon-medium');
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].dismissible).toBeTruthy();
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].message).toEqual('Sorry, something went wrong.');

			messageService.purge();
			$rootScope.$digest();

			// Try configured success message
			$rootScope.ctrl.addErrorMessage({iconClass: 'icon-test'});
			$timeout.flush();
			$rootScope.$digest();
			expect(messageService.getMessages().length).toEqual(1);
			expect($rootScope.ctrl.addMessage.calls.mostRecent().args[0].iconClass).toEqual('icon-test');
		});

		it('attached method, purgeMessages, should purge messages from messageService', function() {
			expect(messageService.getMessages().length).toEqual(0);

			$rootScope.ctrl = {};
			var element = $compile('<messages></messages>')($rootScope);
			$rootScope.$digest();

			spyOn($rootScope.ctrl, "addMessage").and.callThrough();
			spyOn($rootScope.ctrl, "purgeMessages").and.callThrough();

			$rootScope.ctrl.addErrorMessage();
			$rootScope.$digest();
			$timeout.flush();

			expect(messageService.getMessages().length).toEqual(1);
			expect($rootScope.ctrl.addMessage).toHaveBeenCalled();

			$rootScope.ctrl.purgeMessages();
			expect(messageService.purge).toHaveBeenCalled();
		});
	});
});