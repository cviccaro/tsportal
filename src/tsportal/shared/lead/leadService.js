(function() {

	'use strict';

	angular
		.module('tsportal.lead')
		.factory('leadService', leadService);

	function leadService($http, ngDialog, Lead, $rootScope, busyService) {
			var activeDialog;

			var service = {
				deleteLead: deleteLead,
				retrieve: retrieve
			};

			return service;

			/////////

			function retrieve(tradehow_id, pageNumber, perPage, orderBy, orderByReverse, filter) {
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
				if (filter === undefined) {
					filter = '';
				}
				return $http.
					get('api/tradeshows/' + tradehow_id + '/leads?page='+pageNumber+'&perPage='+perPage+
						'&orderBy=' +orderBy + '&orderByReverse=' + parseInt(orderByReverse) + '&filter=' + filter, {cache: true});
			}

			function deleteLead(lead) {
				var lead_name = lead.first_name + ' ' + lead.last_name;
				var dialog_html = '<span class="glyphicon glyphicon-trash red icon-large"></span><span>Are you sure you want to delete Lead <em>' + lead_name +
								  '</em>?<br><strong>This cannot be undone.</strong></span><div class="dialog-buttons">' +
								  '<button class="btn btn-danger" ng-click="confirm()">Yes, delete</button> ' +
								  '<button class="btn btn-cancel" ng-click="closeThisDialog()">Cancel</button></div>';
				ngDialog.openConfirm({
					plain: true,
					className: 'dialog-destroy ngdialog-theme-default',
					template: dialog_html,
					showClose: false
				})
				.then(function() {
					busyService.setMessage('Deleting');
					Lead.
						delete({id:lead.id}).
						$promise.
						then(function(payload) {
							if (payload.hasOwnProperty('success') && payload.success === true) {
								ngDialog.open({
									plain: true,
									className: 'dialog-success ngdialog-theme-default',
									template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Lead <em>' + lead_name + '</em> has been successfully deleted.</span>',
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
									template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Lead <em>' + lead_name + '</em>.</span>  Please try again or contact support.',
								});
							}
						}, function(errorResponse) {
							ngDialog.open({
								plain: true,
								className: 'dialog-error ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Lead <em>' + lead_name + '</em>.</span>  Please try again or contact support.',
							});
						});
				});
			}
		}
})();
