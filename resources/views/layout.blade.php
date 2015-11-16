<!DOCTYPE html>
<html ng-app="tsportal" lang="en">
<head>
<title>Tradeshow Portal</title>

    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.0/yeti/bootstrap.min.css">

    <!-- Application Styles -->
    <link rel="stylesheet" type="text/css" href="/css/app.plugins.css" />
    <link rel="stylesheet" type="text/css" href="/css/app.css" />

    <!-- IE9 Satellizer Support -->
    <!--[if lte IE 9]>
        <script src="//cdnjs.cloudflare.com/ajax/libs/Base64/0.3.0/base64.min.js"></script>
    <![endif]-->
    <!--[if lte IE 8]>
        <style type="text/css">
            body { text-align: center; }
           #browserWarning { display:block!important; margin: 75px auto 0; font-size: 22px; font-family: 'Open Sans'; }
           .container { display: none; }
        </style>
    <![endif]-->
</head>
<body>
    <div id="browserWarning" style="display: none">Sorry, IE8 and older versions are not supported.  Please upgrade to at least IE9 or higher to use this web-app.</div>
    <div class="container relative">
        <nav class="navbar navbar-default row">
            <div class="navbar-header col-md-12 col-sm-12 col-xs-12">
                <button type="button" class="navbar-toggle navbar-right collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <img src="/images/jplogolg.png" class="logo" />
                <a class="navbar-brand" href="/#/">Tradeshow Portal</a>
                <div id="navbar" class="collapse navbar-collapse col-md-6 col-sm-12 col-xs-12">
                    <ul class="nav navbar-nav">
                        <li><a href="/#/tradeshows" title="Tradeshows"><span class="glyphicon glyphicon-home"></span>Tradeshows</a></li>
                        <li ng-show="!isLoggedIn">
                            <a href="/#/auth" title="Login"><span class="glyphicon glyphicon-log-in"></span>Login</a>
                        </li>
                        <li ng-show="isLoggedIn" class="ng-hide">
                            <a href="/#/logout" title="Logout"><span class="glyphicon glyphicon-log-out"></span>Logout</a>
                        </li>
                    </ul>
                </div><!--/.nav-collapse -->
            </div>
        </nav>
        @yield('content')
    </div>

    <!-- Application Dependencies -->
    <script src="/js/app.plugins.js"></script>

    <!-- Application Components -->
    <script src="/js/app.base.js"></script>
    
</body>
</html>