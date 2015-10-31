(function() {
	/**
	 * Wrapper around $auth service
	 */
	var loginService = angular.module('loginService',[]);
	loginService.factory('loginService',
		['$auth', 'authService', '$http', '$state', '$rootScope', '$q',
		function loginService($auth, authService, $http, $state, $rootScope, $q) {
		return {
			isValidEmail: function(email) {
				var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return pattern.test(email);
			},
			token: {
				get: function() {
					return localStorage.getItem('satellizer_token');
				},
				set: function(tokenString) {
					localStorage.setItem('satellizer_token', tokenString);
				},
				remove: function() {
					localStorage.removeItem('satellizer_token');
				}
			},
			tokenCopy: {
				get: function() {
					return localStorage.getItem('_satellizer_token');
				},
				set: function(tokenString) {
					localStorage.setItem('_satellizer_token', tokenString);
				},
				remove: function() {
					localStorage.removeItem('_satellizer_token');
				}
			},
			authenticate: function(credentials) {
				return $auth.login(credentials);
			},
			login: function(credentials) {
				var that = this;
				var deferred = $q.defer();

				this.authenticate(credentials)
					.then(function(payload) {
						deferred.resolve(payload);
						$rootScope.$emit('event:auth-logged-in');
						$rootScope.isLoggedIn = true;
					})
					.catch(function(payload) {
						console.log('rejected payload', payload);
						deferred.reject(payload);
					});
				return deferred.promise;
			},
			logout: function() {
				// Remove tokens
				this.token.remove();
				this.tokenCopy.remove();

				var logout = $auth.logout();

				$state.go('auth');

				return logout;
			},
			refresh: function(token) {
				var ajaxCall =
					$http({
						method: 'GET',
						url: 'api/authenticate/refresh',
						headers: {
							'Authorization': 'Bearer ' + token
						}
					});
				return ajaxCall;
			},
			checkApiAccess: function() {
				if (this.token.get() === null) {
					if (this.tokenCopy.get() !== null) {
						var that = this;
						// Try to refresh
						this.refresh(this.tokenCopy.get())
						.then(function(payload) {

							that.token.set(payload.data.token);

							// Save a copy of the token to use for future refresh requests
							that.tokenCopy.set(payload.data.token);

							$rootScope.isLoggedIn = true;

							// Broadcast events
							$rootScope.$emit('event:auth-logged-in');
							authService.loginConfirmed();
						})
						.catch(function(payload) {
							if (payload.status == 500) {
								// token is totally expired, cannot be refreshed
								that.token.remove();
								that.tokenCopy.remove();
								that.checkApiAccess();
							}
						});
					}
					else {
						// Go to auth view
						this.token.remove();
						$state.go('auth', {});
					}
				}
				else {
					$rootScope.isLoggedIn = true;
					$rootScope.$emit('event:auth-logged-in');
				}
			}
		};
	}]);

	/**
	 * Message service
	 */
	var messageService = angular.module('messageService', []);
	messageService.factory('messageService', function() {
		var messages = [];
		return {
			messages: [],
			addMessage: function(opts) {
				opts.id = this.messages.length + 1;
				this.messages.push(opts);
				setTimeout(function() {
					$('.messages .alert').css('opacity', 1);
				},50);
			},
			purge: function() {
				if (this.messages.length) {
					for (var i = 0, msg; (msg = this.messages[i]); i++) {
						this.removeMessage(msg.id);
					}
				}
			},
			removeMessage: function(message_id) {
				if (this.messages[message_id - 1]) {
					var that = this;
					if (window.navigator.userAgent.match(/PhantomJS/g) !== null) {
						var removed = that.messages.splice(message_id - 1, 1);
					}
					else {
						$('.messages .alert').eq(message_id - 1).css('opacity', 0).on('transitionend',function() {
							var removed = that.messages.splice(message_id - 1, 1);
							$('.messages .alert').eq(message_id - 1).remove();
						});
					}
				}
			}
		};
	});

	/**
	 * Busy Indicator Service
	 */
	var busyService = angular.module('busyService',[]);
	busyService.factory('busyService', ['$rootScope', function busyService($rootScope) {
		var message = 'Working on it...';
		$rootScope.workingMessage = message;
		$rootScope.busyServiceIsBusy = true;
		return {
			message: message,
			isBusy: function() {
				return $rootScope.busyServiceIsBusy;
			},
			setMessage: function(msg) {
				$rootScope.workingMessage = msg;
				this.message = msg;
			},
			getMessage: function() {
				return this.message;
			},
			isVisible: function() {
				return $('.loading-indicator').is(':visible');
			},
			show: function() {
				$rootScope.busyServiceIsBusy = true;
			},
			hide: function() {
				$rootScope.busyServiceIsBusy = false;
				setTimeout(function() {
					if ($('.loading-indicator').is(':visible')) {
						$('.loading-indicator').fadeOut(500);
					}
				}, 600);
			}
		};
	}]);
	/**
	 * Tradeshow Services module
	 */
	var tradeshowServices = angular.module('tradeshowServices', ['ngResource']);

	// Tradeshow Resource using angular-resource
	tradeshowServices.factory('Tradeshow', ['$resource', function($resource) {
		return $resource('api/tradeshows/:tradeshowId', {tradeshowId: '@id'}, {
			list: {method: 'GET', params:{}, isArray: true, transformResponse: function(data) {
				var data = angular.fromJson(data);
				return data.tradeshows;
			}},
			query: {method: 'GET', isArray: false, transformResponse: function(data) {
				var data = angular.fromJson(data);
				return data.tradeshow;
			}},
			create: {method: 'POST', url:'api/tradeshows/create'},
			delete: {method: 'DELETE'}
		});
	}]);

	// Tradeshow service to retrieve paginated, sorted lists of Tradeshows
	tradeshowServices.factory('tradeshowService', ['$http', 'Tradeshow', '$rootScope', 'ngDialog', 'busyService', function($http, Tradeshow, $rootScope, ngDialog, busyService) {
		var tradeshows = [],
			activeDialog;
			return {
				retrieve: function(pageNumber, perPage, orderBy, orderByReverse) {
					if(pageNumber===undefined){
						pageNumber = '1';
					}
					if (orderBy===undefined) {
						orderBy = 'id';
					}
					if (orderByReverse===undefined) {
						orderByReverse = 0;
					}
					if (perPage===undefined) {
						perPage = 15;
					}
					return $http.
						get('api/tradeshows?page='+pageNumber+'&perPage=' + perPage + '&orderBy=' + orderBy + '&orderByReverse=' + parseInt(orderByReverse));
				},
				getTradeshows: function() {
					return tradeshows;
				},
				deleteTradeshow: function(tradeshow) {
					var tradeshow_name = tradeshow.name,
						tradeshow_id   = tradeshow.id;
					activeDialog = ngDialog.openConfirm(
						{
							plain: true,
							className: 'dialog-destroy ngdialog-theme-default',
							template: '<span class="glyphicon glyphicon-trash red icon-large"></span><span>Are you sure you want to delete Tradeshow <em>' + tradeshow_name + '</em>?<br /><strong>This cannot be undone.</strong></span><div class="dialog-buttons"><button class="btn btn-danger" ng-click="confirm()">Yes, delete</button> <button class="btn btn-cancel" ng-click="closeThisDialog()">Cancel</button></div>',
							showClose: false
						}
					).
					then(function() {
						// Alter the working message, show working indicator
						busyService.setMessage('Deleting');
						busyService.show();
						Tradeshow.
							delete({tradeshowId:tradeshow_id}).
							$promise.
							then(function(payload) {

								busyService.hide();

								if (payload.hasOwnProperty('success') && payload.success == true) {
									ngDialog.open({
										plain: true,
										className: 'dialog-success ngdialog-theme-default',
										template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Tradeshow <em>' + tradeshow_name + '</em> has been successfully deleted.</span>',
									})
									.closePromise
									.then(function() {
										window.location.reload();
									})
								}
								else {
									ngDialog.open({
										plain: true,
										className: 'dialog-error ngdialog-theme-default',
										template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
									})
								}
							}, function(errorResponse) {

								busyService.hide();

								ngDialog.open({
									plain: true,
									className: 'dialog-error ngdialog-theme-default',
									template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
								})
							})
					})
				}
			};
	}]);


	/**
	 * Lead Services module
	 */
	var leadServices = angular.module('leadServices', []);

	// Lead Resource using angular-resource
	leadServices.factory('Lead', ['$resource', function ($resource) {
		return $resource('api/leads/:id', {id: '@id'});
	}]);

	// Lead service for fetching paginated, sorted lists of Leads based on a single tradeshow
	leadServices.factory('leadService', ['$http', 'ngDialog', 'Lead', '$rootScope', 'busyService', function($http, ngDialog, Lead, $rootScope, busyService) {
		var activeDialog;
		return {
			retrieve: function(tradehow_id, pageNumber, perPage, orderBy, orderByReverse) {
				if(pageNumber===undefined){
					pageNumber = '1';
				}
				if (orderBy===undefined) {
					orderBy = 'id';
				}
				if (orderByReverse===undefined) {
					orderByReverse = 0;
				}
				if (perPage===undefined) {
					perPage = 15;
				}
				return $http.
					get('api/tradeshows/' + tradehow_id + '/leads?page='+pageNumber+'&perPage='+perPage+'&orderBy=' +orderBy + '&orderByReverse=' + parseInt(orderByReverse));
			},
			deleteLead: function (lead) {
				var lead_name = lead.first_name + ' ' + lead.last_name;
				var dialog_html = '<span class="glyphicon glyphicon-trash red icon-large"></span><span>Are you sure you want to delete Lead <em>' + lead_name +
								  '</em>?<br /><strong>This cannot be undone.</strong></span><div class="dialog-buttons">' +
								  '<button class="btn btn-danger" ng-click="confirm()">Yes, delete</button> ' +
								  '<button class="btn btn-cancel" ng-click="closeThisDialog()">Cancel</button></div>';
				activeDialog = ngDialog.openConfirm({
					plain: true,
					className: 'dialog-destroy ngdialog-theme-default',
					template: dialog_html,
					showClose: false
				})
				.then(function() {
					busyService.setMessage('Deleting');
					busyService.show();
					Lead.
						delete({id:lead.id}).
						$promise.
						then(function(payload) {

							busyService.hide();

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

							busyService.hide();

							ngDialog.open({
								plain: true,
								className: 'dialog-error ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Lead <em>' + lead_name + '</em>.</span>  Please try again or contact support.',
							});
						});
				});
			}
		};
	}]);
})();