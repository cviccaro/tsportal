'use strict';

/* jasmine specs for controllers go here */
describe('tsportal controllers', function() {

  beforeEach(module('tsportal'));

  describe('TradeshowController', function(){
    var scope, ctrl, $httpBackend;
    var $controller;

     beforeEach(inject(function(_$httpBackend_, _$controller_){
       // The injector unwraps the underscores (_) from around the parameter names when matching
       $controller = _$controller_;
       $httpBackend = _$httpBackend_;
     }));
    // beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    //   $httpBackend = _$httpBackend_;
    //   //$httpBackend.expectPOST('api/authenticate')
    //   $httpBackend.expectGET('api/tradeshows?page=1&perPage=15&orderBy=id&orderByReverse=0').
    //       respond([{id: 1, name: 'test', location: 'test', active: 1}, {id: 2, 'name': 'test2', location: 'test2', active: 0}]);
    //   $httpBackend.expectGET('../partials/login-form.html').respond('');
    //   scope = $rootScope.$new();
    //   ctrl = $controller('TradeshowController', {$scope: scope});
    // }));

    describe('$scope.tradeshows', function() {
        it('should create "tradeshows" model with 2 tradeshows fetched from xhr', function() {
          var $scope = {};
          var controller = $controller('TradeshowController', {$scope: $scope});
          // $httpBackend.flush();
          $httpBackend.expectGET('api/tradeshows?page=1&perPage=15&orderBy=id&orderByReverse=0').
            respond([{id: 1, name: 'test', location: 'test', active: 1}, {id: 2, 'name': 'test2', location: 'test2', active: 0}]);
           expect($scope.tradeshows).toEqual([{id: 1, name: 'test', location: 'test', active: 1}, {id: 2, 'name': 'test2', location: 'test2', active: 0}]);
        });


        it('should set the default value of orderBy model', function() {
          var $scope = {};
          var controller = $controller('TradeshowController', {$scope: $scope});
          expect($scope.orderBy).toBe('id');
        });
        it('should set the default value of orderByReverse model', function() {
          var $scope = {};
          var controller = $controller('TradeshowController', {$scope: $scope});
          expect($scope.orderByReverse).toBe('0');
        });
        it('should set the default value of perPage model', function() {
          var $scope = {};
          var controller = $controller('TradeshowController', {$scope: $scope});
          expect($scope.perPage).toBe('15');
        });    
    });
    
  });


//   describe('PhoneDetailCtrl', function(){
//     var scope, $httpBackend, ctrl,
//         xyzPhoneData = function() {
//           return {
//             name: 'phone xyz',
//                 images: ['image/url1.png', 'image/url2.png']
//           }
//         };


//     beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
//       $httpBackend = _$httpBackend_;
//       $httpBackend.expectGET('phones/xyz.json').respond(xyzPhoneData());

//       $routeParams.phoneId = 'xyz';
//       scope = $rootScope.$new();
//       ctrl = $controller('PhoneDetailCtrl', {$scope: scope});
//     }));


//     it('should fetch phone detail', function() {
//       expect(scope.phone).toBeUndefined();
//       $httpBackend.flush();

//       expect(scope.phone).toEqual(xyzPhoneData());
//     });
//   });
});
