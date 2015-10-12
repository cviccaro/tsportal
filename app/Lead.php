<?php

namespace TSPortal;

use Illuminate\Database\Eloquent\Model;
use TSPortal\Tradeshow;

class Lead extends Model
{
	//protected $hidden = array('created_at', 'updated_at');
	/**
	 * [getTradeshow description]
	 * @param  [int] $id [description]
	 * @return [Tradeshow]     [description]
	 */
    public function getTradeshow() {
    	$tradeshow = Tradeshow::findOrFail($this->tradeshow_id);
    	return $tradeshow;
    }
}
