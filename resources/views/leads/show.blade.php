@extends('layout')

@section('content')
    <div class="page-header">
        <h1>Leads / Show </h1>
    </div>


    <div class="row">
        <div class="col-md-12">

            <form action="#">
                <div class="form-group">
                    <label for="nome">ID</label>
                    <p class="form-control-static">{{$lead->id}}</p>
                </div>
                <div class="form-group">
                     <label for="objectid">OBJECTID</label>
                     <p class="form-control-static">{{$lead->objectid}}</p>
                </div>
                    <div class="form-group">
                     <label for="first_name">FIRST_NAME</label>
                     <p class="form-control-static">{{$lead->first_name}}</p>
                </div>
                    <div class="form-group">
                     <label for="last_name">LAST_NAME</label>
                     <p class="form-control-static">{{$lead->last_name}}</p>
                </div>
                    <div class="form-group">
                     <label for="title">TITLE</label>
                     <p class="form-control-static">{{$lead->title}}</p>
                </div>
                    <div class="form-group">
                     <label for="department">DEPARTMENT</label>
                     <p class="form-control-static">{{$lead->department}}</p>
                </div>
                    <div class="form-group">
                     <label for="event_type">EVENT_TYPE</label>
                     <p class="form-control-static">{{$lead->event_type}}</p>
                </div>
                    <div class="form-group">
                     <label for="purpose_of_visit">PURPOSE_OF_VISIT</label>
                     <p class="form-control-static">{{$lead->purpose_of_visit}}</p>
                </div>
                    <div class="form-group">
                     <label for="date_next_appointment">DATE_NEXT_APPOINTMENT</label>
                     <p class="form-control-static">{{$lead->date_next_appointment}}</p>
                </div>
                    <div class="form-group">
                     <label for="representative_name">REPRESENTATIVE_NAME</label>
                     <p class="form-control-static">{{$lead->representative_name}}</p>
                </div>
                    <div class="form-group">
                     <label for="company_name">COMPANY_NAME</label>
                     <p class="form-control-static">{{$lead->company_name}}</p>
                </div>
                    <div class="form-group">
                     <label for="phone_number">PHONE_NUMBER</label>
                     <p class="form-control-static">{{$lead->phone_number}}</p>
                </div>
                    <div class="form-group">
                     <label for="email_address">EMAIL_ADDRESS</label>
                     <p class="form-control-static">{{$lead->email_address}}</p>
                </div>
                    <div class="form-group">
                     <label for="address1">ADDRESS1</label>
                     <p class="form-control-static">{{$lead->address1}}</p>
                </div>
                    <div class="form-group">
                     <label for="address2">ADDRESS2</label>
                     <p class="form-control-static">{{$lead->address2}}</p>
                </div>
                    <div class="form-group">
                     <label for="city">CITY</label>
                     <p class="form-control-static">{{$lead->city}}</p>
                </div>
                    <div class="form-group">
                     <label for="state">STATE</label>
                     <p class="form-control-static">{{$lead->state}}</p>
                </div>
                    <div class="form-group">
                     <label for="zip_code">ZIP_CODE</label>
                     <p class="form-control-static">{{$lead->zip_code}}</p>
                </div>
                    <div class="form-group">
                     <label for="existing_customer">EXISTING_CUSTOMER</label>
                     <p class="form-control-static">{{$lead->existing_customer}}</p>
                </div>
                    <div class="form-group">
                     <label for="notes">NOTES</label>
                     <p class="form-control-static">{{$lead->notes}}</p>
                </div>
                    <div class="form-group">
                     <label for="udid">UDID</label>
                     <p class="form-control-static">{{$lead->udid}}</p>
                </div>
                    <div class="form-group">
                     <label for="timestamp">TIMESTAMP</label>
                     <p class="form-control-static">{{$lead->timestamp}}</p>
                </div>
                    <div class="form-group">
                     <label for="modified">MODIFIED</label>
                     <p class="form-control-static">{{$lead->modified}}</p>
                </div>
            </form>



            <a class="btn btn-default" href="{{ route('leads.index') }}">Back</a>
            <a class="btn btn-warning" href="{{ route('leads.edit', $lead->id) }}">Edit</a>
            <form action="#/$lead->id" method="DELETE" style="display: inline;" onsubmit="if(confirm('Delete? Are you sure?')) { return true } else {return false };"><button class="btn btn-danger" type="submit">Delete</button></form>
        </div>
    </div>


@endsection