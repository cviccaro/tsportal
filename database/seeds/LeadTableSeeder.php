<?php

use Illuminate\Database\Seeder;
use TSPortal\Lead;

class LeadTableSeeder extends Seeder {

    public function run()
    {
        DB::table('leads')->delete();

        Lead::create([
            'first_name' => 'john',
            'last_name' => 'doe',
            'email_address' => 'john@doe.com',
            'phone_number' => '1 (234) 567-8901',
            'tradeshow_id' => 1,
            'existing_customer' => 0,
            'notes' => "Some long text\nSome long text\nSome long text",
        ]);

        Lead::create([
            'first_name' => 'jane',
            'last_name' => 'doe',
            'email_address' => 'jane@doe.com',
            'phone_number' => '9 (876) 543-2109',
            'tradeshow_id' => 1,
            'existing_customer' => 1,
            'notes' => "Some long text\nSome long text\nSome long text",
        ]);

        Lead::create([
            'first_name' => 'robert',
            'last_name' => 'ince',
            'email_address' => 'robert@ince.com',
            'phone_number' => '1 (234) 567-8901',
            'tradeshow_id' => 2,
            'existing_customer' => 0,
            'notes' => "Some long text\nSome long text\nSome long text",
        ]);

        Lead::create([
            'first_name' => 'brian',
            'last_name' => 'cox',
            'email_address' => 'brian@cox.com',
            'phone_number' => '',
            'tradeshow_id' => 2,
            'existing_customer' => 1,
            'notes' => "Some long text\nSome long text\nSome long text",
        ]);

    }

}