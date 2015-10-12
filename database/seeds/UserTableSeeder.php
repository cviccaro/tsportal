<?php

use Illuminate\Database\Seeder;
use TSPortal\User;
// composer require laracasts/testdummy
use Laracasts\TestDummy\Factory as TestDummy;

class UserTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->delete();

        User::create([
        	'name' => 'wescoapp',
        	'email' => 'philips@wesco.com',
        	'password' => Hash::make('wescoapp')
    	]);
    }
}
