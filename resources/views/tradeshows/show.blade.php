@extends('layout')

@section('content')
    <div class="page-header">
        <h1>Tradeshows / Show </h1>
    </div>


    <div class="row">
        <div class="col-md-12">

            <form action="#">
                <div class="form-group">
                    <label for="nome">ID</label>
                    <p class="form-control-static">{{$tradeshow->id}}</p>
                </div>
                <div class="form-group">
                     <label for="name">NAME</label>
                     <p class="form-control-static">{{$tradeshow->name}}</p>
                </div>
                    <div class="form-group">
                     <label for="location">LOCATION</label>
                     <p class="form-control-static">{{$tradeshow->location}}</p>
                </div>
                    <div class="form-group">
                     <label for="active">ACTIVE</label>
                     <p class="form-control-static">
                        @if ($tradeshow->active) 
                            <span class="green">Active</span>
                        @else
                            <span class="red">Inactive</span>
                        @endif
                     </p>
                </div>
            </form>



            <a class="btn btn-default" href="{{ route('tradeshows.index') }}">Back</a>
            <a class="btn btn-warning" href="{{ route('tradeshows.edit', $tradeshow->id) }}">Edit</a>
            <form action="#/$tradeshow->id" method="DELETE" style="display: inline;" onsubmit="if(confirm('Delete? Are you sure?')) { return true } else {return false };"><button class="btn btn-danger" type="submit">Delete</button></form>
        </div>
    </div>


@endsection