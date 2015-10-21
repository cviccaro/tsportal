'use strict';

describe('user login form', function() {
    
    beforeEach(angular.mock.module('tsportal'));
    var AuthController, $scope, $controller, $compile;
    beforeEach(inject(function (_$controller_, _$rootScope_, _$compile_) {
      $controller = _$controller_;
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
    }));
    it('should have a AuthController controller', function() {
      AuthController = $controller('AuthController', {$scope: $scope});
      expect(AuthController).toBeDefined();
    });
    // critical
    it('ensure invalid email addresses are caught', inject(['loginService', function(loginService) {
         // test cases - testing for failure
         var invalidEmails = [
           'test@testcom',
           'test@ test.co.uk',
           'ghgf@fe.com.co.',
           'tes@t@test.com',
           ''
         ];

         for (var i in invalidEmails) {
           var valid = loginService.isValidEmail(invalidEmails[i]);
           expect(valid).toBeFalsy();
         }
      }])
    );
    it('ensure valid email addresses pass validation', inject(['loginService', function(loginService) {
      // test cases - testing for success
         var validEmails = [
           'test@test.com',
           'test@test.co.uk',
           'test734ltylytkliytkryety9ef@jb-fe.com'
         ];

         // you can loop through arrays of test cases like this
         for (var i in validEmails) {
           var valid = loginService.isValidEmail(validEmails[i]);
           expect(valid).toBeTruthy();
         }
      }])
    );


    it('ensure submitting form changes path', function() { 
      // var form = $compile("#login_form");
      // var submitCallback = jasmine.createSpy().andReturn(false);
      // form.submit(submitCallback);
      // expect(submitCallback).toHaveBeenCalled();
    });

});