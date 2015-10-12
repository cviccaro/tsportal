<?php 
namespace TSPortal\Http\Controllers;

use TSPortal\Http\Requests;
use TSPortal\Http\Controllers\Controller;

use TSPortal\Tradeshow;
use Illuminate\Http\Request;

class TradeshowController extends Controller {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$tradeshows = Tradeshow::all();

		return view('tradeshows.index', compact('tradeshows'));
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
        $tradeshow->active = $request->input("active") == 'on';

		$tradeshow->save();

		return redirect()->route('tradeshows.index')->with('message', 'Item created successfully.');
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		$tradeshow = Tradeshow::findOrFail($id);

		return view('tradeshows.show', compact('tradeshow'));
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
        $tradeshow->active = $request->input("active") == 'on';

		$tradeshow->save();

		return redirect()->route('tradeshows.index')->with('message', 'Item updated successfully.');
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
		$tradeshow->delete();

		return redirect()->route('tradeshows.index')->with('message', 'Item deleted successfully.');
	}

}
