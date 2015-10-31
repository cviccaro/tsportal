<?php

use Illuminate\Database\Seeder;
use TSPortal\Tradeshow;

class TradeshowTableSeeder extends Seeder {

    public function run()
    {
        DB::table('tradeshows')->delete();

        Tradeshow::create([
            'id' => 1,
            'name' => 'test show 1',
            'location' => 'Baltimore, MD',
            'active' => 1
        ]);

        Tradeshow::create([
            'id' => 2,
            'name' => 'test show 2',
            'location' => 'Pittsburgh, PA',
            'active' => 1
        ]);

        Tradeshow::create([
            'id' => 3,
            'name' => 'inactive show',
            'location' => 'stfu',
            'active' => 0
        ]);
    }

}