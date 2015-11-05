(function() {
	/**
	 * login Service
	 */
	angular
	.module('loginService',[])
	.factory('loginService', loginService);

	function loginService($state, $rootScope, $q, CacheFactory, $http, httpBuffer) {
		$rootScope.isLoggedIn = false;
		if (!CacheFactory.get('authCache')) {
			CacheFactory('authCache', {
				maxAge: 60 * 60 * 1000,
				deleteOnExpire: 'aggressive',
				storageMode: 'localStorage'
			});
		}
		var cache = CacheFactory.get('authCache');
		return {
			isValidEmail: function(email) {
				var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return pattern.test(email);
			},
			token: {
				get: function() {
					return cache.get('token');
				},
				set: function(tokenString) {
					cache.put('token', tokenString);
				},
				remove: function() {
					cache.remove('token');
				}
			},
			login: function(credentials) {
				var deferred = $q.defer();

				$http.post('/api/authenticate', credentials, {cache: false})
					.then(function(payload) {
						deferred.resolve(payload);
					})
					.catch(function(payload) {
						deferred.reject(payload);
					});
				return deferred.promise;
			},
			logout: function() {
				this.token.remove();
				$state.go('auth');
			},
			refresh: function() {
				var deferred = $q.defer();
				var that = this;
				$http.get('api/authenticate/refresh', {cache: false})
				.then(function(payload) {
					that.token.set(payload.data.token);
					that.loginConfirmed();
					deferred.resolve(payload);
				})
				.catch(function(payload) {
					that.loginCancelled();
					deferred.reject(payload);
				});
				return deferred.promise;
			},
			checkApiAccess: function() {
				var deferred = $q.defer();
				if (this.hasToken()) {
					$rootScope.isLoggedIn = true;
					deferred.resolve();
				}
				else {
					this.loginCancelled();
					deferred.reject();
				}
				return deferred.promise;
			},
			hasToken: function() {
				var t = this.token.get();
				return t !== undefined && t !== null;
			},
			loginConfirmed: function(data, configUpdater) {
				var updater = configUpdater || function(config) {return config;};
				$rootScope.$broadcast('event:auth-logged-in', data);
				$rootScope.isLoggedIn = true;
				httpBuffer.retryAll(updater);
			},
			loginCancelled: function(data, reason) {
			  httpBuffer.rejectAll(reason);
			  $rootScope.$broadcast('event:auth-login-cancelled', data);
			  this.logout();
			}
		};
	}

	/**
	 * Auth Interceptor
	 * 	@credit : largely modified from http-auth-interceptor package
	 */
	angular
		.module('authInterceptor',[])
		.factory('authInterceptor', authInterceptor)
		.factory('httpBuffer', httpBuffer)
		.config(['$httpProvider', function($httpProvider) {
			$httpProvider.interceptors.push(authInterceptor);
		}]);
	
	function authInterceptor ($injector, $rootScope, $q, httpBuffer, $log) {
		// Will get resolved later using $injector to avoid circular dependency issues
		var loginService, ngDialog;

		return {
			request: function(config) {
				loginService = loginService || $injector.get('loginService');

				// Append the token to any request that isn't to login URL
				if (config.url != '/api/authenticate') {
					config.headers.Authorization = 'Bearer ' + loginService.token.get();
				}

				return config;
			},
			response: function(response) {
				var config 	 = response.config;

				loginService = loginService || $injector.get('loginService');

				// Intercept and snatch a successful token from the HTTP response
				if (config.url == '/api/authenticate' && config.method == "POST" && response.status == 200) {
					if (response.data.hasOwnProperty('token')) {
						loginService.token.set(response.data.token);
						loginService.loginConfirmed();
					}
				}
				return response;
			},
			responseError: function(rejection) {
				var deferred = $q.defer();

				loginService = loginService || $injector.get('loginService');

				switch (rejection.status) {
				  case 401:
				  	// If token is expired, refresh it
				  	if (rejection.data.hasOwnProperty('error') && rejection.data.error == 'token_expired') {
					    httpBuffer.append(rejection.config, deferred);
					    $rootScope.$broadcast('event:auth-login-required', rejection);
					    if (loginService.hasToken()) {
						    loginService.refresh();
					    }
					    return deferred.promise;
					}
				    break;
				  case 403:
				    $rootScope.$broadcast('event:auth-forbidden', rejection);
				    loginServe.loginCancelled();
				    break;
			      case 500:
			      	ngDialog = ngDialog || $injector.get('ngDialog');
					ngDialog.open({
						plain: true,
						className: 'dialog-save ngdialog-theme-default',
						template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>Sorry, something went wrong.  Try again later.</span>'
					});
			      	break;
				}
				deferred.reject(rejection);
				return deferred.promise;
			}
		};
	}

	/**
	 * @credit Largely taken and modified from http-auth-interceptor
	 */
	function httpBuffer($injector) {
		var buffer = [];

		var $http;

		function retryHttpRequest(config, deferred) {
		  function successCallback(response) {
		    deferred.resolve(response);
		  }
		  function errorCallback(response) {
		    deferred.reject(response);
		  }
		  $http = $http || $injector.get('$http');
		  $http(config).then(successCallback, errorCallback);
		}

		return {
		  /**
		   * Appends HTTP request configuration object with deferred response attached to buffer.
		   */
		  append: function(config, deferred) {
		    buffer.push({
		      config: config,
		      deferred: deferred
		    });
		  },

		  /**
		   * Abandon or reject (if reason provided) all the buffered requests.
		   */
		  rejectAll: function(reason) {
		    if (reason) {
		      for (var i = 0; i < buffer.length; ++i) {
		        buffer[i].deferred.reject(reason);
		      }
		    }
		    buffer = [];
		  },

		  /**
		   * Retries all the buffered requests clears the buffer.
		   */
		  retryAll: function(updater) {
		    for (var i = 0; i < buffer.length; ++i) {
		      retryHttpRequest(updater(buffer[i].config), buffer[i].deferred);
		    }
		    buffer = [];
		  }
		};
	}

	/**
	 * Message service
	 */
	var messageService = angular.module('messageService', []);
	messageService.factory('messageService', function($timeout) {
		var messages = [];
		return {
			messages: [],
			addMessage: function(opts) {
				opts.id = this.messages.length + 1;
				this.messages.push(opts);
				$timeout(function() {
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
			}
		};
	}]);

	/**
	 * Tradeshow Services module
	 */
	var tradeshowServices = angular.module('tradeshowServices', ['ngResource']);

	// Tradeshow Resource using angular-resource
	tradeshowServices.factory('Tradeshow', ['$resource', 'CacheFactory', function($resource, CacheFactory) {
		return $resource('api/tradeshows/:tradeshowId', {tradeshowId: '@id'}, {
			get: {cache: CacheFactory.get('defaultCache')},
			create: {method: 'POST', url:'api/tradeshows/create'},
			delete: {method: 'DELETE'}
		});
	}]);

	// Tradeshow service to retrieve paginated, sorted lists of Tradeshows
	tradeshowServices.factory('tradeshowService',
		['$http', 'Tradeshow', '$rootScope', 'ngDialog', 'busyService',
		function($http, Tradeshow, $rootScope, ngDialog, busyService) {
		var activeDialog;
			return {
				retrieve: function(pageNumber, perPage, orderBy, orderByReverse, filter) {
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
					if (filter=== undefined) {
						filter = '';
					}
					return $http.
						get('api/tradeshows?page='+pageNumber+'&perPage=' + perPage + '&orderBy=' + orderBy +
							'&orderByReverse=' + parseInt(orderByReverse) + '&filter=' + filter, {cache: true});
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

								if (payload.hasOwnProperty('success') && payload.success === true) {
									ngDialog.open({
										plain: true,
										className: 'dialog-success ngdialog-theme-default',
										template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Tradeshow <em>' + tradeshow_name + '</em> has been successfully deleted.</span>',
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
										template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
									});
								}
							}, function(errorResponse) {

								busyService.hide();

								ngDialog.open({
									plain: true,
									className: 'dialog-error ngdialog-theme-default',
									template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
								});
							});
					});
				}
			};
	}]);


	/**
	 * Lead Services module
	 */
	var leadServices = angular.module('leadServices', []);

	// Lead Resource using angular-resource
	leadServices.factory('Lead', ['$resource', 'CacheFactory', function ($resource, CacheFactory) {
		return $resource('api/leads/:id', {id: '@id'}, {
			get: {cache: CacheFactory.get('defaultCache')}
		});
	}]);

	// Lead service for fetching paginated, sorted lists of Leads based on a single tradeshow
	leadServices.factory('leadService', ['$http', 'ngDialog', 'Lead', '$rootScope', 'busyService',
	 function($http, ngDialog, Lead, $rootScope, busyService) {
		var activeDialog;
		return {
			retrieve: function(tradehow_id, pageNumber, perPage, orderBy, orderByReverse, filter) {
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
				if (filter === undefined) {
					filter = '';
				}
				return $http.
					get('api/tradeshows/' + tradehow_id + '/leads?page='+pageNumber+'&perPage='+perPage+
						'&orderBy=' +orderBy + '&orderByReverse=' + parseInt(orderByReverse) + '&filter=' + filter, {cache: true});
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