<?php

use Illuminate\Database\Seeder;
use App\Lead;

class LeadTableSeeder extends Seeder {

    public function run()
    {
        DB::table('leads')->delete();
        $n = 1;
        while ($n <= 600) {
            $factory = Faker\Factory::create();

            $lead = [
                'id' => $n++,
                'first_name' => $factory->firstName,
                'last_name' => $factory->lastName,
                'title' => $factory->title,
                'department' => $factory->randomElement(['Management', 'IT', 'Marketing', 'Engineering']),
                'event_type' => $factory->randomElement(['Demo', 'Meeting', 'Assembly']),
                'purpose_of_visit' => $factory->randomElement(['Purchase', 'Meeting', 'Tour']),
                'date_next_appointment' => $factory->dateTimeThisYear()->format('m-d-Y'),
                'representative_name' => $factory->name,
                'company_name' => $factory->company,
                'address1' => $factory->streetAddress,
                'city' => $factory->city,
                'state' => $factory->state,
                'country' => 'US',
                'zip_code' => $factory->postcode,
                'udid' => $factory->uuid,
                'email_address' => $factory->email,
                'company_email_address' => $factory->companyEmail,
                'phone_number' => $factory->phoneNumber,
                'existing_customer' => $factory->numberBetween(0,1),
                'contact_by_phone' => $factory->numberBetween(0,1),
                'contact_by_email' => $factory->numberBetween(0,1),
                'notes' => $factory->realText(),
                'timestamp' => time(),
                'tradeshow_id' => $factory->numberBetween(1,100)
            ];

            Lead::create($lead);
        }
        $factory = Faker\Factory::create();
        // Lead::create([
        //     'first_name' => 'john',
        //     'last_name' => 'doe',
        //     'email_address' => 'john@doe.com',
        //     'phone_number' => '1 (234) 567-8901',
        //     'tradeshow_id' => 1,
        //     'existing_customer' => 0,
        //     'notes' => "Some long text\nSome long text\nSome long text",
        // ]);

        // Lead::create([
        //     'first_name' => 'jane',
        //     'last_name' => 'doe',
        //     'email_address' => 'jane@doe.com',
        //     'phone_number' => '9 (876) 543-2109',
        //     'tradeshow_id' => 1,
        //     'existing_customer' => 1,
        //     'notes' => "Some long text\nSome long text\nSome long text",
        // ]);

        // Lead::create([
        //     'first_name' => 'robert',
        //     'last_name' => 'ince',
        //     'email_address' => 'robert@ince.com',
        //     'phone_number' => '1 (234) 567-8901',
        //     'tradeshow_id' => 2,
        //     'existing_customer' => 0,
        //     'notes' => "Some long text\nSome long text\nSome long text",
        // ]);

        // Lead::create([
        //     'first_name' => 'brian',
        //     'last_name' => 'cox',
        //     'email_address' => 'brian@cox.com',
        //     'phone_number' => '',
        //     'tradeshow_id' => 2,
        //     'existing_customer' => 1,
        //     'notes' => "Some long text\nSome long text\nSome long text",
        // ]);

    }

}