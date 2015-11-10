<!DOCTYPE html>
<html ng-app="tsportal" lang="en">
<head>
<title>Tradeshow Portal</title>

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.0/yeti/bootstrap.min.css">

    <!-- Application Styles -->
    <link rel="stylesheet" type="text/css" href="/css/app.plugins.css" />
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

<script src="/js/app.plugins.js"></script>
    <!-- Application Components -->
    <script src="/js/app.base.js"></script>
</body>
</html>