<?php

use Illuminate\Database\Seeder;
use TSPortal\User;

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
