<?php

namespace TSPortal\Api\Controllers;

use Illuminate\Http\Request;
use TSPortal\Http\Controllers\Controller;
use TSPortal\Lead;
use TSPortal\Tradeshow;

class OldAPIEmulation extends Controller {
	public function handle(Request $request) {
		if ($request->has('do')) {
			$do = $request->input('do');
			switch($do) {
				case 'getTradeshows':
					$tradeshows = Tradeshow::all();
					return [
						'method' => $do,
						'response' => $tradeshows,
						'error' => false
					];
				break;
				case 'pushLeads':
					$queue = $request->input('queue');
					$num_saved = 0;
					$num_processed = 0;
					$error = 0;
					if ($queue) {
						foreach($queue as $data) {
							$lead = new Lead();
							// get UDID from request
							$lead->udid = $request->input('deviceID', '');
							$keys = array(
								'objectID' => 'objectID',
								'tradeshow_id' => 'tradeshow',
								'first_name' => 'first_name',
								'last_name' => 'last_name',
								'address1' => 'address1',
								'address2' => 'address2',
								'city' => 'city',
								'state' => 'state',
								'country' => 'country',
								'zip_code' => 'zip_code',
								'representative_name' => 'representative_name',
								'phone_number' => 'phone_number',
								'email_address' => 'email_address',
								'company_email_address' => 'company_email_address',
								'title' => 'title',
								'purpose_of_visit' => 'purpose_of_visit',
								'department' => 'department',
								'event_type' => 'event_type',
								'date_next_appointment' => 'date_next_appointment',
								'existing_customer' => 'existing_customer',
								'notes' => 'notes',
								'contact_by_phone' => 'contact_by_phone',
								'contact_by_email' => 'contact_by_email',
								'answers_path' => 'answers_path',
							);
							// iterate through the keys to try to locate
							// data in $data array
							foreach($keys as $leadKey => $findKey) {
								switch($leadKey) {
									default:
										if (isset($data[$findKey])) {
											$lead->{$leadKey} = $data[$findKey];
										}
								}
							}
							// Save
							$saved = $lead->save();
							if ($saved) {
								$num_saved++;
							}
							$num_processed++;
						}
						$response = 'success';
					}
					else {
						$error = 1;
						$response = 'error';
					}
					return [
						'method' => $do,
						'response' => $response,
						'error' => $error,
						'num_saved' => $num_saved,
						'num_processed' => $num_processed
					];
				break;
				case 'getLeadsForTradeshow':
					$tradeshow_id = $request->input('tradeshow');
					$leads = Lead::where('tradeshow_id',$tradeshow_id)->get();
					// fill in old DB primary key
					foreach($leads as $lead) {
						$lead->idleads = $lead->id;
					}
					return [
						'method' => $do,
						'response' => $leads,
						'error' => 0
					];
				break;
			}
		}
	}
}

