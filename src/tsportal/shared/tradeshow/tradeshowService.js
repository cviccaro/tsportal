(function() {

	'use strict';

	angular
		.module('tsportal.tradeshow')
		.factory('tradeshowService', tradeshowService);

	function tradeshowService($http, Tradeshow, $rootScope, ngDialog, busyService) {
		var activeDialog;

		var service = {
			retrieve: retrieve,
			deleteTradeshow: deleteTradeshow
		};

		return service;

		/////////

		function deleteTradeshow(tradeshow) {
			var tradeshow_name = tradeshow.name,
				tradeshow_id   = tradeshow.id;
			activeDialog = ngDialog.openConfirm(
				{
					plain: true,
					className: 'dialog-destroy ngdialog-theme-default',
					template: '<span class="glyphicon glyphicon-trash red icon-large pull-left"></span><span>Are you sure you want to delete Tradeshow <em>' + tradeshow_name + '</em>?  <strong>This cannot be undone.</strong></span><div class="dialog-buttons"><button class="btn btn-danger" ng-click="confirm()">Yes, delete</button> <button class="btn btn-cancel" ng-click="closeThisDialog()">Cancel</button></div>',
					showClose: false
				}
			).
			then(function() {
				// Alter the working message
				busyService.setMessage('Deleting');

				Tradeshow.
					delete({id:tradeshow_id}).
					$promise.
					then(function(payload) {
						if (payload.hasOwnProperty('success') && payload.success === true) {
							ngDialog.open({
								plain: true,
								className: 'dialog-success ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-check green icon-large pull-left"></span><span>Tradeshow <em>' + tradeshow_name + '</em> has been successfully deleted.</span>',
							})
							.closePromise
							.then(function() {
								window.location.reload();
							});
						}
						else {
							ngDialog.open({
								plain: true,
								className: 'dialog-error ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large pull-left"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
							});
						}
					}, function(errorResponse) {
						ngDialog.open({
							plain: true,
							className: 'dialog-error ngdialog-theme-default',
							template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large pull-left"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
						});
					});
			});
		}

		function retrieve(pageNumber, perPage, orderBy, orderByReverse, filter) {
			if(pageNumber===undefined){
				pageNumber = '1';
			}
			if (orderBy===undefined) {
				orderBy = 'updated_at';
			}
			if (orderByReverse===undefined) {
				orderByReverse = 1;
			}
			if (perPage===undefined) {
				perPage = 15;
			}
			if (filter=== undefined) {
				filter = '';
			}
			return $http.
				get('api/tradeshows?page='+pageNumber+'&perPage=' + perPage + '&orderBy=' + orderBy +
					'&orderByReverse=' + parseInt(orderByReverse) + '&filter=' + filter, {cache: true});
		}
	}
})();
