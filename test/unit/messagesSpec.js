'use strict';
describe('tsportal.messages', function() {
	var messageService, $rootScope, $scope, $http, $httpBackend;
	beforeEach(function() {
		module('tsportal.messages');
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
});