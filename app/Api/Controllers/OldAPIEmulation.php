<?php

namespace TSPortal\Api\Controllers;

use TSPortal\Http\Controllers\Controller;
use TSPortal\Api\Controllers\TradeshowController;
use Illuminate\Http\Request;
use TSPortal\Tradeshow;

class OldAPIEmulation extends Controller {
	public function handle(Request $request) {
		if ($request->has('do')) {
			$do = $request->input('do');
			switch($do) {
				case 'getTradeshows':
					$controller = new TradeshowController($request);
					$response = $controller->index();
					return [
						'method' => $do,
						'response' => $response,
						'error' => false
					];
				break;
			}
		}
	}
}

