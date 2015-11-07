<?php
namespace App\Http\Controllers;

//use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Controllers\LeadController;
use App\Lead;
use App\Tradeshow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class TradeshowController extends Controller {
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index(Request $request)
	{
		$orderBy = $request->input('orderBy', 'id');
		$direction = $request->input('orderByReverse', 0) == 0 ? 'asc' : 'desc';
		$perPage = $request->input('perPage', 15);

		$collection = Tradeshow::orderBy($orderBy, $direction);

		if ($request->has('filter') && !empty($request->input('filter'))) {
			$columns = Schema::getColumnListing('tradeshows');

			foreach($columns as $column) {
				$collection = $collection->orWhere($column, 'LIKE', '%' . $request->input('filter') . '%');
			}
		}

		$paginated = $collection->paginate($perPage);

		// Attach lead_count as an attribute
		$paginated->getCollection()->each(function($item) {
		    $count = Lead::where('tradeshow_id', $item->id)->count();
		    $item->setAttribute('lead_count', $count);
		});

		return $paginated;
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param Request $request
	 * @return Response
	 */
	public function create(Request $request)
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
