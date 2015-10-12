<?php 
namespace TSPortal\Http\Controllers;

use Illuminate\Http\Request;
use TSPortal\Http\Controllers\Controller;
use TSPortal\Http\Requests;
use TSPortal\Lead;
use TSPortal\Tradeshow;

class LeadController extends Controller {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$leads = Lead::all();

		return view('leads.index', compact('leads'));
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		$tradeshows = Tradeshow::all();
		return view('leads.create', ['tradeshows' => $tradeshows]);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param Request $request
	 * @return Response
	 */
	public function store(Request $request)
	{
		$lead = new Lead();

		$lead->tradeshow_id = $request->input('tradeshow_id');
		$lead->objectID = $request->input("objectid");
        $lead->first_name = $request->input("first_name");
        $lead->last_name = $request->input("last_name");
        $lead->title = $request->input("title");
        $lead->department = $request->input("department");
        $lead->event_type = $request->input("event_type");
        $lead->purpose_of_visit = $request->input("purpose_of_visit");
        $lead->date_next_appointment = $request->input("date_next_appointment");
        $lead->representative_name = $request->input("representative_name");
        $lead->company_name = $request->input("company_name");
        $lead->phone_number = $request->input("phone_number");
        $lead->email_address = $request->input("email_address");
        $lead->address1 = $request->input("address1");
        $lead->address2 = $request->input("address2");
        $lead->city = $request->input("city");
        $lead->state = $request->input("state");
        $lead->zip_code = $request->input("zip_code");
        $lead->existing_customer = $request->input("existing_customer") == 'on';
        $lead->notes = $request->input("notes");
        $lead->udid = $request->input("udid");
        $lead->timestamp = $request->input("timestamp");
        $lead->modified = $request->input("modified");

		$lead->save();

		return redirect()->route('leads.index')->with('message', 'Item created successfully.');
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		$lead = Lead::findOrFail($id);

		return view('leads.show', compact('lead'));
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		$lead = Lead::findOrFail($id);
		$tradeshows = Tradeshow::all();
		return view('leads.edit', array_merge(compact('lead'), ['tradeshows' => $tradeshows]));
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @param Request $request
	 * @return Response
	 */
	public function update(Request $request, $id)
	{
		$lead = Lead::findOrFail($id);

		$lead->tradeshow_id = $request->input('tradeshow_id');
		$lead->objectID = $request->input("objectid");
        $lead->first_name = $request->input("first_name");
        $lead->last_name = $request->input("last_name");
        $lead->title = $request->input("title");
        $lead->department = $request->input("department");
        $lead->event_type = $request->input("event_type");
        $lead->purpose_of_visit = $request->input("purpose_of_visit");
        $lead->date_next_appointment = $request->input("date_next_appointment");
        $lead->representative_name = $request->input("representative_name");
        $lead->company_name = $request->input("company_name");
        $lead->phone_number = $request->input("phone_number");
        $lead->email_address = $request->input("email_address");
        $lead->address1 = $request->input("address1");
        $lead->address2 = $request->input("address2");
        $lead->city = $request->input("city");
        $lead->state = $request->input("state");
        $lead->zip_code = $request->input("zip_code");
        $lead->existing_customer = $request->input("existing_customer") == 'on';
        $lead->notes = $request->input("notes");
        $lead->udid = $request->input("udid");
        $lead->timestamp = $request->input("timestamp");
        $lead->modified = $request->input("modified");

		$lead->save();

		return redirect()->route('leads.index')->with('message', 'Item updated successfully.');
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		$lead = Lead::findOrFail($id);
		$lead->delete();

		return redirect()->route('leads.index')->with('message', 'Item deleted successfully.');
	}

}
