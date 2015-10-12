@extends('layout')

@section('content')
    <div class="page-header">
        <h1>Leads / Create </h1>
    </div>


    <div class="row">
        <div class="col-md-12">

            <form action="{{ route('leads.store') }}" method="POST">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">

                <div class="form-group">
                     <label for="tradeshow_id">Tradeshow</label>
                     <select name="tradeshow_id" class="form-control">
                     <option value="-1">-- Select One --</option>
                     @if (isset($tradeshows))
                        @foreach ($tradeshows as $tradeshow)
                            <option value="{{$tradeshow->id}}">{{$tradeshow->name}}</option>
                        @endforeach
                     @endif
                     </select>
                </div>
                <div class="form-group">
                     <label for="objectid">OBJECTID</label>
                     <input type="text" name="objectid" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="first_name">First Name</label>
                     <input type="text" name="first_name" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="last_name">Last Name</label>
                     <input type="text" name="last_name" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="title">Title</label>
                     <input type="text" name="title" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="department">Department</label>
                     <input type="text" name="department" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="event_type">Event Type</label>
                     <input type="text" name="event_type" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="purpose_of_visit">Purpose of Visit</label>
                     <input type="text" name="purpose_of_visit" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="date_next_appointment">Date of Next Appointment</label>
                     <input type="text" name="date_next_appointment" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="representative_name">Representative Name</label>
                     <input type="text" name="representative_name" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="company_name">Company Name</label>
                     <input type="text" name="company_name" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="phone_number">Phone Number</label>
                     <input type="text" name="phone_number" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="email_address">Email Address</label>
                     <input type="text" name="email_address" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="address1">Address 1</label>
                     <input type="text" name="address1" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="address2">Address 2</label>
                     <input type="text" name="address2" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="city">City</label>
                     <input type="text" name="city" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="state">State</label>
                     <input type="text" name="state" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="zip_code">Zip Code</label>
                     <input type="text" name="zip_code" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="existing_customer">Existing Customer</label>
                     <input type="checkbox" name="existing_customer" class="form-control" checked />
                </div>
                    <div class="form-group">
                     <label for="notes">Notes</label>
                     <textarea name="notes" class="form-control" value=""></textarea>
                </div>
                    <div class="form-group">
                     <label for="udid">UDID</label>
                     <input type="text" name="udid" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="timestamp">Timestamp</label>
                     <input type="text" name="timestamp" class="form-control" value=""/>
                </div>
                    <div class="form-group">
                     <label for="modified">Modified</label>
                     <input type="text" name="modified" class="form-control" value=""/>
                </div>



            <a class="btn btn-default" href="{{ route('leads.index') }}">Back</a>
            <button class="btn btn-primary" type="submit" >Create</a>
            </form>
        </div>
    </div>


@endsection