'use strict';

// @link: http://stackoverflow.com/questions/25554797/how-to-ng-click-an-a-directive-in-a-phantomjs-test
function click(el){
    var ev = document.createEvent('MouseEvent');
    ev.initMouseEvent(
        'click',
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}
// mock of authService (external service from http-auth-interceptor)
window.authService = {
	loginConfirmed: function() { }
};

describe('Tradeshow List Controller', function() {
    var $scope, $rootScope, tradeshowServiceMock, loginServiceMock, leadServiceMock, eventMock;
    var ctrl, $httpBackend, $q, $compile, compiled, element, stateMock;
	var html = '<table class="table table-striped">' +
                '<thead>' +
                    '<tr>' +
                        '<th>ID</th>' +
                        '<th>NAME</th>' +
                        '<th>LOCATION</th>' +
                        '<th>ACTIVE</th>' +
                        '<th class="text-right">ACTIONS</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr markable ng-repeat="tradeshow in tradeshows | filter:query" ng-click="getLeads(tradeshow.id)" data-id="{{tradeshow.id}}" class="clickable">' +
                    '<td class="tradeshow-id">{{tradeshow.id}}</td>' +
                    '<td>{{tradeshow.name}}</td>' +
                    '<td>{{tradeshow.location}}</td>' +
                    '<td>' +
                        '<span ng-show="{{tradeshow.active}}" class="green">Active</span>' +
                        '<span ng-hide="{{tradeshow.active}}" class="red">Inactive</span>' +
                    '</td>' +
                    '<td class="text-right">' +
                        '<a class="btn btn-warning" href="#/tradeshows/{{tradeshow.id}}/edit">Edit</a>' +
                        '<a class="btn btn-danger" href="" ng-click="deleteTradeshow(tradeshow.id, $event)">Delete</a>' +
                        '&nbsp;&nbsp;&nbsp;' +
                        '<a class="btn btn-primary" ng-click="downloadReport(tradeshow.id, $event)">Excel Report</a>' +
                    '</td>' +
                '</tr>' +
                '</tbody>' +
            '</table>';
    beforeEach(function() {

    	module('tsportal');

    	localStorage.setItem('satellizer_token', 'token');
    	localStorage.setItem('_satellizer_token', 'token');

    	loginServiceMock = jasmine.createSpyObj('loginService', ['authenticate', 'checkApiAccess', 'refresh', 'logout']);
    	tradeshowServiceMock = jasmine.createSpyObj('tradeshowService', ['retrieve', 'deleteTradeshow']);
    	leadServiceMock = jasmine.createSpyObj('leadService', ['retrieve']);

		eventMock = {
			stopped: false,
			defaultPrevented: false,
			preventDefault: function() {
				this.defaultPrevented = true;
			},
			stopPropagation: function() {
				this.stopped = true;
			}
		};
		module(function($provide) {
			$provide.value('$event', eventMock);
		});
    	inject(function (_$httpBackend_, $controller, _$rootScope_, _$q_, _$compile_) {
    		$q = _$q_;
	      	$httpBackend = _$httpBackend_;
	      	$rootScope = _$rootScope_;
	      	$scope = $rootScope.$new();

			$compile = _$compile_;
	      	element = angular.element(html);
	      	compiled = $compile(element)($scope);

			loginServiceMock.checkApiAccess.and.callThrough();

            loginServiceMock.token = {
                get: function() {
                    return localStorage.getItem('satellizer_token');
                },
                set: function(tokenString) {
                    localStorage.setItem('satellizer_token', tokenString);
                }
            };
            loginServiceMock.tokenCopy = {
                get: function() {
                    return localStorage.getItem('_satellizer_token');
                },
                set: function(tokenString) {
                    localStorage.setItem('_satellizer_token', tokenString);
                }
            };

			tradeshowServiceMock.retrieve.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({
					data: {
						current_page: 1,
						last_page: 1,
						data: [{
							id: 1,
							name: 'tradeshow',
							location: 'a place'
						}, {
							id: 2,
							name: 'tradeshow 2',
							location: 'another place'
						}]
					}
				});
				return deferred.promise;
			});

			tradeshowServiceMock.deleteTradeshow.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({success: true});
				return deferred.promise;
			});

			leadServiceMock.retrieve.and.callFake(function() {
			  	var deferred = $q.defer();
				deferred.resolve({
					data: {
						current_page: 1,
						last_page: 1,
						data: [{
							id: 1,
							first_name: 'john',
							last_name: 'doe'
						}, {
							id: 2,
							first_name: 'jane',
							last_name: 'doe'
						}]
					}
				});
				return deferred.promise;
			});

			ctrl = $controller('TradeshowController', {
                $rootScope: $rootScope,
				$scope: $scope,
				loginService: loginServiceMock,
				tradeshowService: tradeshowServiceMock,
				leadService: leadServiceMock
			});

		    $scope.$digest();

		    spyOn(eventMock, "preventDefault").and.callThrough();
		    spyOn(eventMock, "stopPropagation").and.callThrough();
		    spyOn($scope, "getTradeshows").and.callThrough();
		  //  spyOn($scope, "handleTradeshows").and.callThrough();
		    spyOn($scope, "getLeads").and.callThrough();
		  //  spyOn($scope, "handleLeads").and.callThrough();
		    spyOn($scope, "$broadcast");
		    spyOn(authService, "loginConfirmed").and.callThrough();
	    });

    });
    it('should have a TradeshowController with defaults and call checkApiAccess on loginService', function() {
      expect(ctrl).toBeDefined();
      expect($scope.orderBy).toBe('id');
      expect($scope.orderByReverse).toEqual('0');
      expect($scope.perPage).toEqual('15');
      expect(loginServiceMock.checkApiAccess).toHaveBeenCalled();
    });
	it ('should call loginService refresh when rootScope emits event:auth-loginRequired event', function() {
		loginServiceMock.refresh.and.callFake(function() {
			var deferred = $q.defer();
			deferred.resolve({data:{token:'adasds'}});
			return deferred.promise;
		});
		$rootScope.$broadcast('event:auth-loginRequired');
		expect(loginServiceMock.refresh).toHaveBeenCalled();
		$scope.$digest();
		expect(authService.loginConfirmed).toHaveBeenCalled();
	});
	it ('should call loginService.logout if refresh fails', function() {
		loginServiceMock.refresh.and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({status: 500, data:{token:'adasds'}});
			return deferred.promise;
		});
		$rootScope.$broadcast('event:auth-loginRequired');
		expect(loginServiceMock.refresh).toHaveBeenCalled();
		$scope.$digest();
		expect(loginServiceMock.logout).toHaveBeenCalled();
	});
    it ('should fetch 2 tradeshows when event:auth-logged-in is broadcast', function() {
        $rootScope.$broadcast('event:auth-logged-in');
        $rootScope.$apply();
    	expect(tradeshowServiceMock.retrieve).toHaveBeenCalled();
    	expect($scope.tradeshows.length).toEqual(2);
    	expect($scope.tradeshows[0].name).toEqual('tradeshow');
    	expect($scope.perPage).toEqual(tradeshowServiceMock.retrieve.calls.mostRecent().args[1]);
		expect($scope.currentPage).toEqual(tradeshowServiceMock.retrieve.calls.mostRecent().args[0]);
		expect($scope.orderBy).toEqual(tradeshowServiceMock.retrieve.calls.mostRecent().args[2]);
		expect($scope.orderByReverse).toEqual(tradeshowServiceMock.retrieve.calls.mostRecent().args[3]);

    	$scope.refreshTradeshows();
	    $httpBackend.expectGET('api/tradeshows?page=1&perPage=' + $scope.perPage + '&orderBy=' + $scope.orderBy + '&orderByReverse=' + $scope.orderByReverse)
      		.respond(200);
	    $scope.$digest();
    	expect($scope.getTradeshows).toHaveBeenCalled();
    	expect($scope.tradeshows.length).toEqual(2);
    });
    it('should return tradeshow from pluckTradeshow if index is range, otherwise return false', function() {
        $rootScope.$broadcast('event:auth-logged-in');
        $rootScope.$apply();
    	expect($scope.pluckTradeshow(999999)).toBeFalsy();
    	expect($scope.pluckTradeshow(1)).toBeDefined();
    	expect($scope.pluckTradeshow(1).name).toEqual('tradeshow');
    });
    it('should call getLeads when a tradeshow is clicked', function() {
        $rootScope.$broadcast('event:auth-logged-in');
        $rootScope.$apply();
    	var result = element[0].querySelectorAll('.clickable');
    	$httpBackend.expectGET('api/tradeshows/1/leads?page=' + $scope.currentPage + '&perPage=50&orderBy=' + $scope.orderBy + '&orderByReverse=' + $scope.orderByReverse)
			.respond(200);
    	click(result[0]);
    	$scope.$digest();
    	expect($scope.getLeads).toHaveBeenCalledWith(1);
    	//expect($scope.handleLeads).toHaveBeenCalled();
    	$scope.$digest();
    	//expect(leadServiceMock.getCurrentTradeshowId()).toEqual(1)
    });
    it('should call deleteTradeshow on tradeshow service when $scope.deleteTradeshow is called', function() {
        $rootScope.$broadcast('event:auth-logged-in');
        $rootScope.$apply();
    	$scope.deleteTradeshow(1, eventMock);
    	$scope.$digest();
    	expect(eventMock.preventDefault).toHaveBeenCalled();
    	expect(eventMock.stopPropagation).toHaveBeenCalled();
    	expect(eventMock.stopped).toBeTruthy();
    	expect(eventMock.defaultPrevented).toBeTruthy();
    	expect(tradeshowServiceMock.deleteTradeshow).toHaveBeenCalledWith($scope.pluckTradeshow(1));
    });
});



describe('TradeshowDetailController', function() {
    var tradeshowServiceMock, loginServiceMock, tradeshowResourceMock, leadServiceMock, messageService, eventMock, stateMock;
    var ctrl, $scope, $rootScope, $httpBackend, $q, $compile, compiled, element;
    beforeEach(module('tsportal'));
	beforeEach(function() {
		eventMock = {
			stopped: false,
			defaultPrevented: false,
			preventDefault: function() {
				this.defaultPrevented = true;
			},
			stopPropagation: function() {
				this.stopped = true;
			}
		};

		loginServiceMock = jasmine.createSpyObj('loginService', ['authenticate', 'checkApiAccess', 'refresh', 'logout']);
		leadServiceMock = jasmine.createSpyObj('leadService', ['retrieve', 'setCurrentTradeshowId', 'deleteLead']);
		tradeshowServiceMock = jasmine.createSpyObj('tradeshowService', ['retrieve']);

		tradeshowResourceMock = jasmine.createSpyObj('Tradeshow', ['get', 'save']);
		stateMock = jasmine.createSpyObj('$state', ['go']);
		inject(function(_$rootScope_, _$httpBackend_, _$q_, $controller, _messageService_) {
			$httpBackend = _$httpBackend_;
			$q = _$q_;

			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();

			messageService = _messageService_;

	        loginServiceMock.checkApiAccess.and.callThrough();
            loginServiceMock.token = {
                get: function() {
                    return localStorage.getItem('satellizer_token');
                },
                set: function(tokenString) {
                    localStorage.setItem('satellizer_token', tokenString);
                }
            };
            loginServiceMock.tokenCopy = {
                get: function() {
                    return localStorage.getItem('_satellizer_token');
                },
                set: function(tokenString) {
                    localStorage.setItem('_satellizer_token', tokenString);
                }
            };

			tradeshowResourceMock.get.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({id: 1, name: 'tradeshow', location: 'a place', active: 1});
				deferred.$promise = deferred.promise;
				return deferred;
			});
			tradeshowResourceMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({id: 1, name: 'tradeshow', location: 'a place', active: 1});
				deferred.$promise = deferred.promise;
				return deferred;
			});
			leadServiceMock.retrieve.and.callFake(function() {
			  	var deferred = $q.defer();
				deferred.resolve({
					data: {
						current_page: 1,
						last_page: 1,
						data: [{
							id: 1,
							first_name: 'john',
							last_name: 'doe'
						}, {
							id: 2,
							first_name: 'jane',
							last_name: 'doe'
						}]
					}
				});
				return deferred.promise;
			});
			leadServiceMock.deleteLead.and.callFake(function() {
			  	var deferred = $q.defer();
				deferred.resolve({success: true});
				return deferred.promise;
			}).and.callThrough();

			ctrl = $controller('TradeshowDetailController', {
                $rootScope: $rootScope,
				$scope: $scope,
				loginService: loginServiceMock,
				Tradeshow: tradeshowResourceMock,
				tradeshowService: tradeshowServiceMock,
				leadService: leadServiceMock,
				messageService: messageService,
				$stateParams: {
					tradeshowId: 1
				},
				$state: stateMock
			});
            $rootScope.$broadcast('event:auth-logged-in');
            $rootScope.$apply();
            $scope.$digest();

		    spyOn(messageService, "removeMessage").and.callThrough();
		    spyOn(messageService, "addMessage").and.callThrough();
		    spyOn($scope, "setTitle").and.callThrough();
		    spyOn($scope, "getTradeshow").and.callThrough();
		    spyOn($scope, "getLeads").and.callThrough();
		    spyOn($scope, "$broadcast");
		    spyOn(authService, "loginConfirmed").and.callThrough();
		    spyOn(eventMock, "stopPropagation").and.callThrough();
		    spyOn(eventMock, "preventDefault").and.callThrough();
            spyOn($rootScope, "$broadcast").and.callThrough();
		});
	});
	it('should have an instance of TradeshowDetailController with default values in scope, and loginService.checkApiAccess was called', function() {
		expect(ctrl).toBeDefined();
        $rootScope.$broadcast('event:auth-logged-in');
        $rootScope.$apply();
		expect($rootScope.$broadcast).toHaveBeenCalledWith('event:auth-logged-in');
		expect(loginServiceMock.checkApiAccess).toHaveBeenCalled();
		$httpBackend.expectGET('../partials/login-form.html').respond(200);
		$httpBackend.expectGET('api/tradeshows/1').respond(200);
		expect($scope.tradeshow.name).toEqual('tradeshow');
		expect($scope.tradeshow.location).toEqual('a place');
	});
	it('should set title of page based on tradeshow', function() {
		$scope.getTradeshow();
		expect($scope.title).toEqual('Editing Tradeshow <em>' + $scope.tradeshow.name + '</em>');
		$scope.$digest();
		expect($scope.setTitle).toHaveBeenCalled();
	});
	it('should have a working messageService implementation', function() {
		messageService.addMessage({type: 'success', message: 'test'});
		$scope.$digest();
		// $scope.messages should be identical to messageService.messages
		expect(messageService.messages.length).toEqual(1);
		expect($scope.messages.length).toEqual(1);
		expect($scope.messages).toBe(messageService.messages);

		$scope.removeMessage(1);
		$scope.$digest();
		expect(messageService.removeMessage).toHaveBeenCalledWith(1);
		expect(messageService.messages.length).toEqual(0);
		expect($scope.messages.length).toEqual(0);
		expect($scope.messages).toBe(messageService.messages);
	});
	it ('should use $state.go to go back when $scope.goBack() is called', function() {
		$scope.goBack();
		$scope.$digest();
		expect(stateMock.go).toHaveBeenCalledWith('tradeshows');
	});
	it ('should call loginService refresh when rootScope emits event:auth-loginRequired event', function() {
		loginServiceMock.refresh.and.callFake(function() {
			var deferred = $q.defer();
			deferred.resolve({data:{token:'adasds'}});
			return deferred.promise;
		});
		$rootScope.$broadcast('event:auth-loginRequired');
		expect(loginServiceMock.refresh).toHaveBeenCalled();
		$scope.$digest();
		expect(authService.loginConfirmed).toHaveBeenCalled();
	});
	it ('should call loginService.logout if refresh fails', function() {
		loginServiceMock.refresh.and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({status: 500, data:{token:'adasds'}});
			return deferred.promise;
		});
		$rootScope.$broadcast('event:auth-loginRequired');
		expect(loginServiceMock.refresh).toHaveBeenCalled();
		$scope.$digest();
		expect(loginServiceMock.logout).toHaveBeenCalled();
	});
	it('should get a lead when using pluckLead with a valid ID, false if not', function() {
		var lead = $scope.pluckLead(1);
		expect(lead).toBeDefined();
		expect(lead.first_name).toEqual('john');
		expect(lead.last_name).toEqual('doe');

		var nolead = $scope.pluckLead(999999);
		expect(nolead).toBeFalsy();
	});
	it('should call getLeads when calling updatePagination when currentPage is not 1', function() {
		$scope.leadCurrentPage = 2;
		$scope.updatePagination();
		expect($scope.getLeads).toHaveBeenCalledWith(1);
	});
	it('should call delete lead on leadService with lead object when $scope.deleteLead(lead_id) is called, and event should call preventDefault and stopPropagation', function() {
		$scope.deleteLead(1, eventMock);
		$scope.$digest();
		expect(eventMock.preventDefault).toHaveBeenCalled();
		expect(eventMock.stopPropagation).toHaveBeenCalled();
		expect(eventMock.stopped).toBeTruthy();
		expect(eventMock.defaultPrevented).toBeTruthy();
		expect(leadServiceMock.deleteLead).toHaveBeenCalledWith($scope.pluckLead(1));
	});
	it('should call save on Tradeshow Resource when calling $scope.save() and replace $scope.tradeshow with saved values', function() {
		var newValues = {name: 'test save', location: 'test save', active: 1, id: 1};
		$scope.tradeshowForm = $scope.tradeshow = newValues;
		$scope.save();
		expect(tradeshowResourceMock.save).toHaveBeenCalledWith(newValues);
		expect($scope.tradeshow.name).toEqual('test save');
		$scope.$digest();
		expect(messageService.addMessage).toHaveBeenCalledWith({
							icon: 'ok',
							type: 'success',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Your changes have been saved',
							id: 1
						});
	});
	it('should call save on Tradeshow Resource when calling $scope.save() and if received rejection of promise, display error message', function() {
		tradeshowResourceMock.save.and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({status: 500, data:[]});
			deferred.$promise = deferred.promise;
			return deferred;
		});
		var newValues = {name: 'test save', location: 'test save', active: 1, id: 1};
		$scope.tradeshowForm = $scope.tradeshow = newValues;
		$scope.save();
		expect(tradeshowResourceMock.save).toHaveBeenCalledWith(newValues);
		$scope.$digest();
		expect(messageService.addMessage).toHaveBeenCalledWith({
							icon: 'exclamation-sign',
							type: 'danger',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Sorry, something went wrong.',
							id: 1
						});
	});
});


describe('TradeshowCreateController', function() {
	var $scope, $rootScope, loginServiceMock, stateMock;
	var $httpBackend, $q, ctrl;
	beforeEach(function() {

		module('tsportal');

		loginServiceMock = jasmine.createSpyObj('loginService', ['authenticate', 'checkApiAccess', 'refresh', 'logout']);
		stateMock = jasmine.createSpyObj('$state', ['go']);

		inject(function(_$httpBackend_, _$q_, _$rootScope_, $controller) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();

			$httpBackend = _$httpBackend_;
			$q = _$q_;

			ctrl = $controller('TradeshowCreateController', {
                $rootScope: $rootScope,
				$scope: $scope,
				loginService: loginServiceMock,
				$state: stateMock
			});
            loginServiceMock.token = {
                get: function() {
                    return localStorage.getItem('satellizer_token');
                },
                set: function(tokenString) {
                    localStorage.setItem('satellizer_token', tokenString);
                }
            };
            loginServiceMock.tokenCopy = {
                get: function() {
                    return localStorage.getItem('_satellizer_token');
                },
                set: function(tokenString) {
                    localStorage.setItem('_satellizer_token', tokenString);
                }
            };
			loginServiceMock.checkApiAccess.and.callThrough();
		});
	});

	it('should have an instance of TradeshowCreateController with default values in scope, and loginService.checkApiAccess was called', function() {
		expect(ctrl).toBeDefined();
		expect(loginServiceMock.checkApiAccess).toHaveBeenCalled();
        $rootScope.$broadcast('event:auth-logged-in');
        $rootScope.$apply();
		$scope.$digest();
		expect($scope.isNew).toBeTruthy();
		expect($scope.model).toEqual('tradeshow');
		expect($scope.title).toEqual('Create new Tradeshow');
		expect($scope.tradeshow).toEqual({});
		expect($scope.submitted).toBeFalsy();
	});
	it ('should use $state.go to go back when $scope.goBack() is called', function() {
		$scope.goBack();
		$scope.$digest();
		expect(stateMock.go).toHaveBeenCalledWith('tradeshows');
	});
});