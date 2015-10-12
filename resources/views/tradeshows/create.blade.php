@extends('layout')

@section('content')
    <div class="page-header">
        <h1>Tradeshows / Create </h1>
    </div>


    <div class="row">
        <div class="col-md-12">

            <form action="{{ route('tradeshows.store') }}" method="POST">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">

                <div class="form-group">
                     <label for="name">NAME</label>
                     <input type="text" name="name" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="location">LOCATION</label>
                     <input type="text" name="location" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="active">ACTIVE</label>
                     <input type="checkbox" name="active" class="form-control" checked />
                </div>



            <a class="btn btn-default" href="{{ route('tradeshows.index') }}">Back</a>
            <button class="btn btn-primary" type="submit" >Create</a>
            </form>
        </div>
    </div>


@endsection