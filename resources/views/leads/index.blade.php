@extends('layout')

@section('content')
    <div class="page-header">
        <h1>Leads</h1>
    </div>


    <div class="row">
        <div class="col-md-12">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th class="foreign" data-column="tradeshow_id">Tradeshow</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Representative Name</th>
                        <th>Company Name</th>
                        <th>Phone Number</th>
                        <th>Email Address</th>
                        <th>Timestamp</th>
                        <th class="text-right">OPTIONS</th>
                    </tr>
                </thead>

                <tbody>

                @foreach($leads as $lead)
                <tr>
                    <td>{{$lead->id}}</td>
                    <td>{{$lead->getTradeshow()->name}}</td>
                    <td>{{$lead->first_name}}</td>
                    <td>{{$lead->last_name}}</td>
                    <td>{{$lead->representative_name}}</td>
                    <td>{{$lead->company_name}}</td>
                    <td>{{$lead->phone_number}}</td>
                    <td>{{$lead->email_address}}</td>
                    <td>{{$lead->timestamp}}</td>

                    <td class="text-right">
                        <a class="btn btn-primary" href="{{ route('leads.show', $lead->id) }}">View</a>
                        <a class="btn btn-warning " href="{{ route('leads.edit', $lead->id) }}">Edit</a>
                        <form action="{{ route('leads.destroy', $lead->id) }}" method="POST" style="display: inline;" onsubmit="if(confirm('Delete? Are you sure?')) { return true } else {return false };"><input type="hidden" name="_method" value="DELETE"><input type="hidden" name="_token" value="{{ csrf_token() }}"> <button class="btn btn-danger" type="submit">Delete</button></form>
                    </td>
                </tr>

                @endforeach

                </tbody>
            </table>

            <a class="btn btn-success" href="{{ route('leads.create') }}">Create</a>
        </div>
    </div>


@endsection