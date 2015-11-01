<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Lead;
use App\Tradeshow;

class LeadController extends Controller {
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
	 * Create many leads.
	 * @param  Request $request [description]
	 * @return [type]           [description]
	 */
	public function createMany(Request $request) {
		if ($request->has('data')) {
            $saved   = 0;
            $touched = 0;
			foreach($request->input('data') as $data) {
				if (Lead::create($data)) {
                    $saved++;
                }
				$touched++;
			}
            return [
                'success' => $touched == $saved,
                'touched' => $touched,
                'saved' => $saved,
            ];
		}
        else {
            return [
                'success' => false,
                'error' => 'missing_data_in_input'
            ];
        }
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
	public function showByTradeshowId(Request $request, $tradeshow_id)
	{
		$orderBy = $request->input('orderBy', 'id');
		$direction = $request->input('orderByReverse', 0) == 0 ? 'asc' : 'desc';
		$paginate = $request->input('perPage', 15);
		return Lead::where('tradeshow_id', $tradeshow_id)
                ->orderBy($orderBy, $direction)
                ->paginate($paginate);
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
		if ($request->has('objectID')) {
			$lead->objectID = $request->input("objectID");
		}
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

		return $lead;
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
		$deleted = $lead->delete();
		return ['success' => TRUE];
	}

}
