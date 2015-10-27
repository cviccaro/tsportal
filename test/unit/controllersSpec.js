// 'use strict';

// // describe('user login form', function() {
    
// //     beforeEach(angular.mock.module('tsportal'));
// //     var AuthController, $scope, $controller, $compile;
// //     beforeEach(inject(function (_$controller_, _$rootScope_, _$compile_) {
// //       $controller = _$controller_;
// //       $compile = _$compile_;
// //       $scope = _$rootScope_.$new();
// //     }));
// //     it('should have a AuthController controller', function() {
// //       AuthController = $controller('AuthController', {$scope: $scope});
// //       expect(AuthController).toBeDefined();
// //     });
// //     // critical
// //     it('ensure invalid email addresses are caught', inject(['loginService', function(loginService) {
// //          // test cases - testing for failure
// //          var invalidEmails = [
// //            'test@testcom',
// //            'test@ test.co.uk',
// //            'ghgf@fe.com.co.',
// //            'tes@t@test.com',
// //            ''
// //          ];

// //          for (var i in invalidEmails) {
// //            var valid = loginService.isValidEmail(invalidEmails[i]);
// //            expect(valid).toBeFalsy();
// //          }
// //       }])
// //     );
// //     it('ensure valid email addresses pass validation', inject(['loginService', function(loginService) {
// //       // test cases - testing for success
// //          var validEmails = [
// //            'test@test.com',
// //            'test@test.co.uk',
// //            'test734ltylytkliytkryety9ef@jb-fe.com'
// //          ];

// //          // you can loop through arrays of test cases like this
// //          for (var i in validEmails) {
// //            var valid = loginService.isValidEmail(validEmails[i]);
// //            expect(valid).toBeTruthy();
// //          }
// //       }])
// //     );


// //     it('ensure submitting form changes path', function() { 

// //     });

// // });
// // 
// var token;
// describe('Auth test', function() {
//   var AuthController, $scope, $controller, $compile, $httpBackend, $injector, loginService;
//   beforeEach(function() {
//     module('tsportal');
//     module(function($provide) {
//       // Fake StoreService Implementation returning a promise
//          $provide.value('loginService', {
//            authenticate: function() {
//              return { 
//                then: function(callback) {return callback([{ some: "thing", hoursInfo: {isOpen: true}}]);},
//                catch: function(callback) {return callback([{ some: "thing", hoursInfo: {isOpen: true}}]);},
//              };
//            },
//            isValidEmail: function() {
//             return true;
//            }
//          });
//     })
//   });
//   beforeEach(inject(function (_$httpBackend_, _$controller_, _$rootScope_, _$compile_, $q, _loginService_) {
//     $httpBackend = _$httpBackend_;
//     $controller = _$controller_;
//     $compile = _$compile_;
//     $scope = _$rootScope_.$new();
//     loginService = _loginService_;
//     spyOn($scope, "$emit")
//   }));

//   it('should have a AuthController controller', function() {
//     AuthController = $controller('AuthController', {$scope: $scope});
//     expect(AuthController).toBeDefined();
//   });
//   it('should retrieve a json web token', function() {
//     var user = {
//         email: 'philips@wesco.com',
//         password: 'wescoapp'
//     };
//     expect(loginService.isValidEmail(user.email)).toBeTruthy();
//     // $httpBackend.expectGET('../partials/login-form.html').respond(200);
//     // $httpBackend.flush();
//     var success = false;
//     loginService.authenticate(user)
//       .then(function(payload) {
//           success = true;
//       })
//     //$httpBackend.flush();        
//     expect(success).toBeTruthy();
//   })
// });
// describe('test busyService', function() {
//   beforeEach(function() {
//     module('tsportal')
//   });
//   var busyService, $rootScope;
//   beforeEach(inject(function(_$rootScope_, _busyService_) {
//       busyService = _busyService_;
//       $rootScope = _$rootScope_.$new();
//     }));
//   it('busyService should set rootScope workingMessage', function() {
//     busyService.setMessage('test message');
//     expect(busyService.getMessage()).toEqual('test message');
//     expect($rootScope.workingMessage).toEqual('test message');
//   })
//   it('busyService should track if it is showing or not', function() {
//     // default
//     expect(busyService.isVisible()).toBeFalsy();
    
//     // show
//     busyService.show();
//     expect(busyService.isVisible()).toBeTruthy();

//     // hide
//     busyService.hide();
//     expect(busyService.isVisible()).toBeFalsy();
//   })
// });
// describe('test messageService', function() {
//   var messageService, $scope, AuthController, $controller, $httpBackend, loginService;
//   beforeEach(function() {
//     module('tsportal');
//   })
//   beforeEach(inject(function(_messageService_, $rootScope, _$controller_, _$httpBackend_, _loginService_) {
//     messageService = _messageService_;
//     $scope = $rootScope.$new();
//     $controller = _$controller_;
//     $httpBackend = _$httpBackend_;
//     AuthController = $controller('AuthController', {$scope: $scope});
//     messageService
//     spyOn($scope, "$emit")
//   }));
//   it('messageService should be able to add a message', function() {
//     $httpBackend.expectGET('../partials/tradeshow-list.html').respond(200);
//     $httpBackend.expectGET('../partials/login-form.html').respond(200);
//     $httpBackend.flush();

//     messageService.addMessage({message:'test', type: 'success'});
//     $scope.$digest();
//     expect(messageService.messages.length).toEqual(1);
//     expect(messageService.messages[0].message).toEqual('test');
//     expect($scope.$emit).toHaveBeenCalled();
//   });
// })
// describe('tradeshow list', function() {
//     var TradeshowController, $scope, $controller, $compile, $httpBackend, tradeshowService, loginServiceMock;
//     beforeEach(function() {
//       angular.mock.module('tsportal')
//       angular.mock.module('tradeshowControllers');
//       //angular.mock.module('tradeshowServices');
//       loginServiceMock =  {
//         called: false,
//         refresh: function(token) {

//         },
//         checkApiAccess: function() {
//           this.called = true;
//         },
//         wasCalled: function() {
//           return this.called;
//         }
//       }
//     });
//     beforeEach(inject(function (_$httpBackend_, _$controller_, _$rootScope_, _$compile_, _tradeshowService_) {
//       $httpBackend = _$httpBackend_;
//       $controller = _$controller_;
//       $compile = _$compile_;
//       if (!$scope) {
//         $scope = _$rootScope_.$new();
//       }
//       tradeshowService = _tradeshowService_;
//     }));
//     it('should have a TradeshowController and call checkApiAccess on mocked jwtRefreshService', function() {
//       TradeshowController = $controller('TradeshowController', {$scope: $scope, loginService: loginServiceMock});
//       expect(TradeshowController).toBeDefined();
//       expect(loginServiceMock.wasCalled()).toBeTruthy();
//     });
//     it('should have default scope variables set in TradeshowController', function() {
//       expect($scope.orderBy).toBe('id');
//       expect($scope.orderByReverse).toEqual('0');
//       expect($scope.perPage).toEqual('15');
//     });
//     it('should use scope params to retrieve from tradeshowService', function() {
//       spyOn(loginServiceMock, 'checkApiAccess');

//       $httpBackend.expectGET('api/tradeshows?page=1&perPage=' + $scope.perPage + '&orderBy=' + $scope.orderBy + '&orderByReverse=' + $scope.orderByReverse)
//       .respond(200);
//       var succeeded;
//       var promise = tradeshowService.retrieve(1, $scope.perPage, $scope.orderBy, $scope.orderByReverse);
//       expect(promise).toBeDefined();
//       promise.then(function(payload) {
//         succeeded = true;
//         var response = payload.data;

//         $scope.tradeshows = [];
//         $scope.currentPage = 1;
//         $scope.lastPage = 2;
//         $scope.range = [1,2];
//         $scope.totalPages = 2;
//       })
//       $httpBackend.flush();
//       expect(succeeded).toBeTruthy();

//       expect(tradeshowService.getTradeshows().length).toEqual(0);
//       expect($scope.range).toEqual([1,2]);
//       expect($scope.tradeshows).toEqual([]);
//       expect($scope.totalPages).toEqual(2);
//       expect($scope.currentPage).toEqual(1);
//     });
// });