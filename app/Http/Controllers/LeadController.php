<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\showByTradeshowId;
use App\Lead;
use App\Tradeshow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

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

		if ($request->has('filter') && !empty($request->input('filter'))) {
			$columns = Schema::getColumnListing('leads');
			$collection = Lead::orderBy($orderBy, $direction);
			foreach($columns as $column) {
				$collection = $collection->orWhere($column, 'LIKE', '%' . $request->input('filter') . '%');
			}
			$paginated = $collection->paginate($paginate);
		}
		else {
			// Get paginated collection
			$paginated = Lead::orderBy($orderBy, $direction)->paginate($paginate);
		}

		return $paginated;
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
		$lead = Lead::findOrFail($id);
        if ($lead) {
            $lead->tradeshow_name = Tradeshow::find(1)->pluck('name');
        }
        return $lead;
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

		if ($request->has('filter') && !empty($request->input('filter'))) {
			$filter = $request->input('filter');
			$columns = Schema::getColumnListing('leads');
			$collection = Lead::orderBy($orderBy, $direction);
			$collection
				->where('tradeshow_id', $tradeshow_id)
				->where(function($query) use ($columns, $filter) {
					foreach($columns as $column) {
						if ($column != 'tradeshow_id') {
							$query->orWhere($column, 'LIKE', '%' . $filter . '%');
						}
					}
				});
			$paginated = $collection->where('tradeshow_id', $tradeshow_id)->paginate($paginate);
		}
		else {
			// Get paginated collection
			$paginated = Lead::where('tradeshow_id', $tradeshow_id)->orderBy($orderBy, $direction)->paginate($paginate);
		}
		return $paginated;
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
		if ($request->has('objectID') || $request->has('objectid')) {
			$lead->objectID = $request->input("objectID", $request->input('objectid'));
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

		return self::show($id);
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
