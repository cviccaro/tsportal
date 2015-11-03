<!DOCTYPE html>
<html ng-app="tsportal" lang="en">
<head>
<title>Tradeshow Portal</title>
    <!-- Bootstrap -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.0/yeti/bootstrap.min.css">

    <!-- jQuery -->
    <script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
    <script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>

    <!-- Bootstrap Switch -->
    <link rel="stylesheet" type="text/css" href="/css/bootstrap-switch.min.css" />
    <script type="text/javascript" src="/js/bootstrap-switch.min.js"></script>

    <!-- Application Styles -->
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
            <nav class="navbar navbar-default">
                <div class="container">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                            <span class="sr-only">Toggle navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </button>
                        <img src="/images/jplogolg.png" class="logo" />
                        <a class="navbar-brand" href="/#/">Tradeshow Portal</a>
                    </div>
                    <div id="navbar" class="collapse navbar-collapse">
                        <ul class="nav navbar-nav">
                            <li><a href="/#/tradeshows">Home</a></li>
                            <li ng-show="!isLoggedIn">
                                <a href="/#/auth">Login</a>
                            </li>
                            <li ng-show="isLoggedIn">
                                <a href="/#/logout">Logout</a>
                            </li>
                        </ul>
                    </div><!--/.nav-collapse -->
                </div>
            </nav>
            @yield('content')
        </div>
    <!-- Application Dependencies -->
    <script src="/bower_components/angular/angular.js"></script>

    <script src="/bower_components/angular-ui-router/release/angular-ui-router.min.js"></script>
    <script src="/bower_components/angular-resource/angular-resource.min.js"></script>
    <script src="/bower_components/angular-animate/angular-animate.min.js"></script>
    <script src="/bower_components/angular-jwt/dist/angular-jwt.min.js"></script>
    <script src="/bower_components/ng-dialog/js/ngDialog.min.js"></script>
    <script src="/bower_components/angular-spinkit/build/angular-spinkit.min.js"></script>
    <script src="/bower_components/satellizer/satellizer.min.js"></script>
    <script src="/bower_components/angular-http-auth/src/http-auth-interceptor.js"></script>
    <script src="/bower_components/ngstorage/ngStorage.min.js"></script>
    <!-- Application Components -->
    <script type="text/javascript" src="/js/services.js"></script>
    <script type="text/javascript" src="/js/tradeshowController.js"></script>
    <script type="text/javascript" src="/js/leadController.js"></script>
    <script type="text/javascript" src="/js/authController.js"></script>
    <script type="text/javascript" src="/js/app.angular.js"></script>
</body>
</html>