<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Lead;

class ReportingController extends Controller
{
    public function report($tradeshow_id) {
        $leads = Lead::where('tradeshow_id', $tradeshow_id)->get();
        foreach($leads as &$lead) {
        	$lead = array_except($lead, ['id', 'objectID', 'created_at', 'updated_at', 'answers_path', 'modified', 'tradeshow_id']);
        }
        Excel::create('reports/Tradeshow_Report__' . $tradeshow_id . '__' . time(), function($excel) use($leads) {

            $excel->sheet('Leads', function($sheet) use($leads) {

                $sheet->fromArray($leads);

            });

        })->export('xls');
        //return Response('tradeshow id is ' . $tradeshow_id);
    }
}
