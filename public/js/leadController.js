(function($) {
	'use strict';

	var leadControllers = angular.module('leadControllers', ['ngDialog']);
	leadControllers.controller('LeadController', ['$rootScope', '$scope', 'leadGetter', '$stateParams', 'Lead', 'ngDialog', 'Tradeshow', function($rootScope, $scope, leadGetter, $stateParams, Lead, ngDialog, Tradeshow) {
		$scope.model = 'lead';
		$scope.title = 'Editing Lead';
		$scope.setTitle = function setTitle() {
			$scope.title = 'Editing Lead <em>' + $scope.lead.first_name + ' ' + $scope.lead.last_name + '</em>';
		};
		Lead.
			get({id: $stateParams.id}).
			$promise.
			then(function(payload) {
				$scope.lead = payload.lead;
				$scope.setTitle();
				angular.forEach(['existing_customer', 'contact_by_phone', 'contact_by_email'], function(key) {
					if ($scope.lead[key] == 1) {
						$('input[name="' + key + '"]').bootstrapSwitch('state', true);
					}
				});
				Tradeshow.
					get({tradeshowId: $scope.lead.tradeshow_id}).
					$promise.
					then(function(payload) {
						$scope.tradeshow = payload.tradeshow;
					});
			});

		$scope.goBack = function goBack() {
			window.history.back();
		};

		$scope.save = function save() {
			$rootScope.workingMessage = 'Saving';
			$('.loading-indicator').removeClass('ng-hide').fadeIn(100);
			Lead.
				save($scope.lead).
				$promise.
				then(function(payload) {
					$scope.lead = payload.lead;
					$scope.setTitle();
					$('.loading-indicator').fadeOut(100).addClass('ng-hide');
					ngDialog.open(
						{
							plain: true,
							className: 'dialog-save ngdialog-theme-default',
							template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Your changes have been saved.</span>'
						}
					);
				});

		};
	}])
})(jQuery);