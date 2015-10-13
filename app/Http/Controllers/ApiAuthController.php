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
	// public function __construct() {
	// 	// Apply the jwt.auth middleware to all methods in this controller
	//     // except for the authenticate method. We don't want to prevent
	//     // the user from retrieving their token if they don't already have it
	//     $this->middleware('jwt.auth');
	// }
	public function authenticate(Request $request) {
		$credentials = $request->only('email', 'password');

		// $rsa = new \Crypt_RSA();
		// //$rsa->loadKey(file_get_contents(base_path() . '/rsa_1024_priv.pem'));
		// $rsa->loadKey(file_get_contents(base_path() . '/rsa_1024_pub.pem'));
		// $credentials['email'] = $rsa->decrypt($credentials['email']);
		// $credentials['password'] = $rsa->decrypt($credentials['password']);
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
}