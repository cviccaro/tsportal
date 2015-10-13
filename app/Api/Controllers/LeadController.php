<?php 
namespace TSPortal\Api\Controllers;

use Illuminate\Http\Request;
use TSPortal\Http\Controllers\Controller;
use TSPortal\Http\Requests;
use TSPortal\Lead;
use TSPortal\Tradeshow;

class LeadController extends Controller {
	public function __construct() {
	    $this->middleware('jwt.auth');
	}
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index(Request $request)
	{
		$orderBy = $request->input('orderBy', 'id');
		$direction = $request->input('orderByReverse', 0) == 0 ? 'asc' : 'desc';
		$paginate = $request->input('perPage', 15);
		$leads = Lead::orderBy($orderBy, $direction)->paginate($paginate);
		return $leads;
	}

	/**
	 * Collect data from request, pass to $this->create()
	 *
	 * @param Request $request
	 * @return Response
	 */
	public function store(Request $request)
	{
		$data = new stdClass();
		
		$data->tradeshow_id = $request->input('tradeshow_id');
		$data->objectID = $request->input("objectid");
        $data->first_name = $request->input("first_name");
        $data->last_name = $request->input("last_name");
        $data->title = $request->input("title");
        $data->department = $request->input("department");
        $data->event_type = $request->input("event_type");
        $data->purpose_of_visit = $request->input("purpose_of_visit");
        $data->date_next_appointment = $request->input("date_next_appointment");
        $data->representative_name = $request->input("representative_name");
        $data->company_name = $request->input("company_name");
        $data->phone_number = $request->input("phone_number");
        $data->email_address = $request->input("email_address");
        $data->address1 = $request->input("address1");
        $data->address2 = $request->input("address2");
        $data->city = $request->input("city");
        $data->state = $request->input("state");
        $data->zip_code = $request->input("zip_code");
        $data->existing_customer = $request->input("existing_customer");
        $data->notes = $request->input("notes");
        $data->udid = $request->input("udid");
        $data->timestamp = $request->input("timestamp");
        $data->modified = $request->input("modified");

		return $this->create($data);
	}

	/**
	 * Create new resource using data object.
	 * @param  stdClass $data [description]
	 * @return [type]         [description]
	 */
	public function create(stdClass $data) {
		$lead = new Lead();

		$lead->tradeshow_id = $data['tradeshow_id'];
		$lead->objectID = $data['objectid'];
        $lead->first_name = $data["first_name"];
        $lead->last_name = $data["last_name"];
        $lead->title = $data["title"];
        $lead->department = $data["department"];
        $lead->event_type = $data["event_type"];
        $lead->purpose_of_visit = $data["purpose_of_visit"];
        $lead->date_next_appointment = $data["date_next_appointment"];
        $lead->representative_name = $data["representative_name"];
        $lead->company_name = $data["company_name"];
        $lead->phone_number = $data["phone_number"];
        $lead->email_address = $data["email_address"];
        $lead->address1 = $data["address1"];
        $lead->address2 = $data["address2"];
        $lead->city = $data["city"];
        $lead->state = $data["state"];
        $lead->zip_code = $data["zip_code"];
        $lead->existing_customer = $data["existing_customer"];
        $lead->notes = $data["notes"];
        $lead->udid = $data["udid"];
        $lead->timestamp = $data["timestamp"];
        $lead->modified = $data["modified"];

        $saved = $lead->save();
		return [
			'saved' => $saved,
			'lead' => $lead
		];
	}
	
	/**
	 * Create many leads.
	 * @param  Request $request [description]
	 * @return [type]           [description]
	 */
	public function createMany(Request $request) {
		$data = $request->input('data');
		$saved = $touched = 0;
		if ($data) {
			foreach($data as $lead_data) {
				$meta = $this->create($lead_data);
				if ($meta['saved']) {
					$saved++;
				}
				$touched++;
			}
		}
		return [
			'success' => $touched == $saved
		];
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return Lead::findOrFail($id);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function showByTradeshowId($id, Request $request)
	{
		$orderBy = $request->input('orderBy', 'id');
		$direction = $request->input('orderByReverse', 0) == 0 ? 'asc' : 'desc';
		$paginate = $request->input('perPage', 15);
		return Lead::where('tradeshow_id', $id)->orderBy($orderBy, $direction)->paginate($paginate);
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
        $lead->company_email_address = $request->input("company_email_address");
        $lead->address1 = $request->input("address1");
        $lead->address2 = $request->input("address2");
        $lead->city = $request->input("city");
        $lead->state = $request->input("state");
        $lead->zip_code = $request->input("zip_code");
        $lead->existing_customer = $request->input("existing_customer");
        $lead->contact_by_phone = $request->input("contact_by_phone");
        $lead->contact_by_email = $request->input("contact_by_email");
        $lead->notes = $request->input("notes");
        $lead->udid = $request->input("udid");
        $lead->timestamp = $request->input("timestamp");
        $lead->modified = $request->input("modified");

		$lead->save();

		return $this->show($id);
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
