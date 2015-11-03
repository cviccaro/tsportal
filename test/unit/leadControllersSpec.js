
describe('LeadController', function() {
	var $httpBackend, $q, $rootScope, $scope, ctrl, messageService;
	var leadServiceMock, leadResourceMock, stateMock, busyServiceMock, tradeshowResourceMock;
	beforeEach(function() {
		// localStorage.removeItem('_satellizer_token')
		// localStorage.removeItem('satellizer_token')
		localStorage.setItem('satellizer_token', 'token');
		localStorage.setItem('_satellizer_token', 'token');

		module('tsportal');

		leadServiceMock = jasmine.createSpyObj('leadService', ['retrieve']);
		leadResourceMock = jasmine.createSpyObj('Lead', ['get', 'save']);
		loginServiceMock = jasmine.createSpyObj('loginService', ['checkApiAccess', 'token', 'refreshToken']);
		busyServiceMock = jasmine.createSpyObj('busyService', ['show', 'hide', 'setMessage']);
		tradeshowResourceMock = jasmine.createSpyObj('Tradeshow', ['get', 'save']);

		loginServiceMock.token = {
			get: function() {
				return localStorage.getItem('satellizer_token');
			},
			set: function(str) {
				localStorage.setItem('satellizer_token', str);
			}
		};
		loginServiceMock.refreshToken = {
			get: function() {
				return localStorage.getItem('_satellizer_token');
			},
			set: function(str) {
				localStorage.setItem('_satellizer_token', str);
			}
		};	
		inject(function(_$httpBackend_, _$q_, $controller, _$rootScope_, _messageService_) {
			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			$q = _$q_;
			messageService = _messageService_;


			leadResourceMock.get.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({id: 1, first_name: 'john', last_name: 'doe', tradeshow_id: 1});
				deferred.$promise = deferred.promise;
				return deferred;
			});
			leadResourceMock.save.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({id: 1, first_name: 'jane', location: 'xdoe', tradeshow_id: 1});
				deferred.$promise = deferred.promise;
				return deferred;
			});

			tradeshowResourceMock.get.and.callFake(function() {
				var deferred = $q.defer();
				deferred.resolve({id: 1, name: 'tradeshow', location: 'a place', active: 1});
				deferred.$promise = deferred.promise;
				return deferred;
			});

			spyOn(messageService, "addMessage").and.callThrough();
			spyOn($scope, "$emit").and.callThrough()
			loginServiceMock.checkApiAccess.and.callFake(function() {
				spyOn($scope, "getLead").and.callThrough();
				$scope.$emit("event:auth-logged-in");
				
			});
			
			ctrl = $controller('LeadController', {
				$scope: $scope,
				leadService: leadServiceMock,
				loginService: loginServiceMock,
				busyService: busyServiceMock,
				Lead: leadResourceMock,
				Tradeshow: tradeshowResourceMock,
				messageService: messageService,
				$stateParams: {
					id: 1
				}
			});
			$httpBackend.expectGET('api/tradeshows/1').respond(200);
			$httpBackend.expectGET('api/leads/1').respond(200);
		});

	});

	it('should have a LeadController instance and values set based on lead', function() {
		expect(ctrl).toBeDefined();

 		$scope.$digest();		

 		expect($scope.$emit).toHaveBeenCalledWith('event:auth-logged-in'); 	
 		expect($scope.getLead).toHaveBeenCalled();
 		expect($scope.lead).toBeDefined();
 		expect($scope.lead.first_name).toEqual('john');
 		expect($scope.lead.last_name).toEqual('doe');
 		expect($scope.lead.tradeshow_id).toEqual(1);
 		expect(busyServiceMock.hide).toHaveBeenCalled()
	});
	it('should call save on Lead Resource when calling $scope.save() and replace $scope.tradeshow with saved values', function() {
		var newValues = {first_name: 'test', last_name: 'save', id: 1};
		$scope.leadForm = $scope.lead = newValues;
		$scope.save();
		expect(leadResourceMock.save).toHaveBeenCalledWith(newValues);
		expect($scope.lead.first_name).toEqual('test');
		expect($scope.lead.last_name).toEqual('save');
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
	it('should call save on Lead Resource when calling $scope.save() and if received rejection of promise, display error message', function() {
		leadResourceMock.save.and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({status: 500, data:[]});
			deferred.$promise = deferred.promise;
			return deferred;
		});
		var newValues = {first_name: 'test', last_name: 'save', id: 1};
		$scope.leadForm = $scope.lead = newValues;
		$scope.save();
		expect(leadResourceMock.save).toHaveBeenCalledWith(newValues);
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