<?php

namespace TSPortal\Http\Controllers;

use Illuminate\Http\Request;

use TSPortal\Http\Requests;
use TSPortal\Http\Controllers\Controller;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use TSPortal\Lead;
use TSPortal\User;

/**
 * @link https://github.com/tymondesigns/jwt-auth/wiki/Creating-Tokens
 */

class ApiAuthController extends Controller {
	public function authenticate(Request $request) {
		$credentials = $request->only('email', 'password');
		try {
			if (! $token = JWTAuth::attempt($credentials)) {
				return response()->json(['error' => 'invalid_credentials'], 401);
			}
		}
		catch (JWTException $e) {
			return response()->json(['error' => 'could_not_create_token'], 500);
		}

		return response()->json(compact('token'));
	}
	public function refresh(Request $request){
	     $oldtoken = JWTAuth::getToken();
	     try {
	         // attempt to refresh token for the user
	         if (! $token = JWTAuth::parseToken('bearer','authorization',$oldtoken)->refresh()) {
	             return response()>json(['error' => 'invalid_token'], 401);
	         }
	     } catch (JWTException $e) {
	         return response()->json(['error' => 'could_not_refresh_token'], 500);
	     }
	     return response()->json(compact('token'));
	 }
}