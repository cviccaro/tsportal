<?php 
namespace TSPortal\Api\Controllers;

use TSPortal\Http\Requests;
use TSPortal\Http\Controllers\Controller;

use TSPortal\Tradeshow;
use Illuminate\Http\Request;

class TradeshowController extends Controller {
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
		$tradeshows = Tradeshow::orderBy($orderBy, $direction)->paginate($paginate);
		return $tradeshows;
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		return view('tradeshows.create');
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param Request $request
	 * @return Response
	 */
	public function store(Request $request)
	{
		$tradeshow = new Tradeshow();

		$tradeshow->name = $request->input("name");
        $tradeshow->location = $request->input("location");
        $tradeshow->active = $request->input("active");

		$tradeshow->save();

		return $tradeshow;
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return Tradeshow::findOrFail($id);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		$tradeshow = Tradeshow::findOrFail($id);

		return view('tradeshows.edit', compact('tradeshow'));
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
		$tradeshow = Tradeshow::findOrFail($id);
		$tradeshow->name = $request->input("name");
        $tradeshow->location = $request->input("location");
        $tradeshow->active = $request->input("active");

		$saved = $tradeshow->save();
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
		$tradeshow = Tradeshow::findOrFail($id);
		$deleted = $tradeshow->delete();

		return ['success' => $deleted];
	}

}
