<!DOCTYPE html>
<html ng-app="tsportal" lang="en">
<head>
<title>Tradeshow Portal</title>

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.0/yeti/bootstrap.min.css">

    <!-- Application Styles -->
    <link rel="stylesheet" type="text/css" href="/bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css" />
    <link rel="stylesheet" type="text/css" href="/bower_components/angular-spinkit/build/angular-spinkit.min.css" />
    <link rel="stylesheet" type="text/css" href="/bower_components/ng-dialog/css/ngDialog.min.css" />
    <link rel="stylesheet" type="text/css" href="/bower_components/ng-dialog/css/ngDialog-theme-default.min.css" />
    <link rel="stylesheet" type="text/css" href="/css/app.css" />

    <!-- IE9 Satellizer Support -->
    <!--[if lte IE 9]>
        <script src="//cdnjs.cloudflare.com/ajax/libs/Base64/0.3.0/base64.min.js"></script>
    <![endif]-->

</head>
<body>

        <div class="container">
            <nav class="navbar navbar-default row">
                <div class="navbar-header col-md-12 col-sm-12 col-xs-12">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <img src="/images/jplogolg.png" class="logo" />
                    <a class="navbar-brand" href="/#/">Tradeshow Portal</a>
                    <div id="navbar" class="collapse navbar-collapse col-md-6 col-sm-12 col-xs-12">
                        <ul class="nav navbar-nav">
                            <li><a href="/#/tradeshows">Home</a></li>
                            <li ng-show="!isLoggedIn">
                                <a href="/#/auth">Login</a>
                            </li>
                            <li ng-show="isLoggedIn" class="ng-hide">
                                <a href="/#/logout">Logout</a>
                            </li>
                        </ul>
                    </div><!--/.nav-collapse -->
                </div>
            </nav>
            @yield('content')
        </div>

    <!-- Application Dependencies -->
    <script src="/bower_components/jquery/dist/jquery.min.js"></script>
    <script src="/bower_components/jquery-migrate/jquery-migrate.min.js"></script>
    <script src="/bower_components/angular/angular.min.js"></script>
    <script src="/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="/bower_components/bootstrap-switch/dist/js/bootstrap-switch.min.js"></script>
    <script src="/bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch.min.js"></script>
    <script src="/bower_components/angular-ui-router/release/angular-ui-router.min.js"></script>
    <script src="/bower_components/angular-jwt/dist/angular-jwt.min.js"></script>
    <script src="/bower_components/angular-cache/dist/angular-cache.min.js"></script>
    <script src="/bower_components/angular-resource/angular-resource.min.js"></script>
    <script src="/bower_components/angular-resource/angular-resource.min.js"></script>
    <script src="/bower_components/angular-animate/angular-animate.min.js"></script>
    <script src="/bower_components/ng-dialog/js/ngDialog.min.js"></script>
    <script src="/bower_components/angular-spinkit/build/angular-spinkit.min.js"></script>
    <script src="/bower_components/moment/min/moment.min.js"></script>

    <!-- Application Components -->
    <script src="/js/services/loginService.js"></script>
    <script src="/js/interceptors/authInterceptor.js"></script>

    <script src="/js/services/messageService.js"></script>

    <script src="/js/services/busyService.js"></script>
    <script src="/js/interceptors/busyServiceInterceptor.js"></script>

    <script src="/js/services/leadResource.js"></script>
    <script src="/js/services/leadService.js"></script>
    <script src="/js/services/tradeshowResource.js"></script>
    <script src="/js/services/tradeshowService.js"></script>

    <script src="/js/controllers/controllers.js"></script>
    <script src="/js/controllers/authController.js"></script>

    <script src="/js/controllers/tradeshowCreateController.js"></script>
    <script src="/js/controllers/tradeshowDetailController.js"></script>
    <script src="/js/controllers/tradeshowListController.js"></script>
    <script src="/js/controllers/leadController.js"></script>
    <script src="/js/controllers/logoutController.js"></script>

    <script src="/js/directives/directives.js"></script>
    <script src="/js/app.angular.js"></script>
</body>
</html>