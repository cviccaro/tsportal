<!-- resources/views/auth/login.blade.php -->
@extends('layout')
 
@section('content')

<form method="POST" action="/auth/login" class="form-signin">
    {!! csrf_field() !!}

    <div class="account-wall">
        <div>
            Email
            <input type="email" name="email" value="{{ old('email') }}" class="form-control">
        </div>

        <div>
            Password
            <input type="password" name="password" id="password" class="form-control">
        </div>

        <div>
            <label class="checkbox pull-left">
              <input type="checkbox" value="remember">
                  Remember me
            </label>
        </div>
    </div>
    <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
</form>

@endsection