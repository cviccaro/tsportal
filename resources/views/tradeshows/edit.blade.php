@extends('layout')

@section('content')
    <div class="page-header">
        <h1>Tradeshows / Edit </h1>
    </div>


    <div class="row">
        <div class="col-md-12">

            <form action="{{ route('tradeshows.update', $tradeshow->id) }}" method="POST">
                <input type="hidden" name="_method" value="PUT">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">

                <div class="form-group" style="display:none">
                    <label for="nome">ID</label>
                    <p class="form-control-static">{{$tradeshow->id}}</p>
                </div>
                <div class="form-group">
                     <label for="name">NAME</label>
                     <input type="text" name="name" class="form-control" value="{{$tradeshow->name}}"/>
                </div>
                    <div class="form-group">
                     <label for="location">LOCATION</label>
                     <input type="text" name="location" class="form-control" value="{{$tradeshow->location}}"/>
                </div>
                    <div class="form-group">
                     <label for="active">ACTIVE</label>
                     @if ($tradeshow->active == 1)
                        <input type="checkbox" name="active" class="form-control" checked />
                     @else
                         <input type="checkbox" name="active" class="form-control" />
                     @endif
                </div>



            <a class="btn btn-default" href="{{ route('tradeshows.index') }}">Back</a>
            <button class="btn btn-primary" type="submit" >Save</a>
            </form>
        </div>
    </div>


@endsection