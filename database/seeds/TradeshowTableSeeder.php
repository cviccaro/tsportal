<?php

use Illuminate\Database\Seeder;
use App\Tradeshow;

class TradeshowTableSeeder extends Seeder {

    public function run()
    {
        DB::table('tradeshows')->delete();

        $n = 1;
        while ($n <= 100) {
            $factory = Faker\Factory::create();

            $citystate = $factory->city . ', ' . $factory->state;
            $tradeshow = [
                'name' => $factory->dateTimeThisYear()->format('F j') . ' Tradeshow / ' . $citystate,
                'location' => $citystate,
                'active' => 1,
                'id' => $n++
            ];

            Tradeshow::create($tradeshow);
        }
    }

}