@extends('layout')

@section('content')
    <div class="page-header">
        <h1>Tradeshows</h1>
    </div>


    <div class="row">
        <div class="col-md-12">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>LOCATION</th>
                        <th>ACTIVE</th>
                        <th class="text-right">OPTIONS</th>
                    </tr>
                </thead>

                <tbody>

                @foreach($tradeshows as $tradeshow)
                <tr>
                    <td>{{$tradeshow->id}}</td>
                    <td>{{$tradeshow->name}}</td>
                    <td>{{$tradeshow->location}}</td>
                    <td>
                        @if ($tradeshow->active) 
                            <span class="green">Active</span>
                        @else
                            <span class="red">Inactive</span>
                        @endif
                    </td>

                    <td class="text-right">
                        <a class="btn btn-primary" href="{{ route('tradeshows.show', $tradeshow->id) }}">View</a>
                        <a class="btn btn-warning " href="{{ route('tradeshows.edit', $tradeshow->id) }}">Edit</a>
                        <form action="{{ route('tradeshows.destroy', $tradeshow->id) }}" method="POST" style="display: inline;" onsubmit="if(confirm('Delete? Are you sure?')) { return true } else {return false };"><input type="hidden" name="_method" value="DELETE"><input type="hidden" name="_token" value="{{ csrf_token() }}"> <button class="btn btn-danger" type="submit">Delete</button></form>
                    </td>
                </tr>

                @endforeach

                </tbody>
            </table>

            <a class="btn btn-success" href="{{ route('tradeshows.create') }}">Create</a>
        </div>
    </div>


@endsection