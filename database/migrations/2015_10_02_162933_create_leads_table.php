<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLeadsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('leads', function(Blueprint $table) {
            $table->increments('id');
            $table->string('objectID')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('title')->nullable();
            $table->string('department')->nullable();
            $table->string('event_type')->nullable();
            $table->string('purpose_of_visit')->nullable();
            $table->string('date_next_appointment')->nullable();
            $table->string('representative_name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('email_address')->nullable();
            $table->string('company_email_address')->nullable();
            $table->string('address1')->nullable();
            $table->string('address2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('zip_code', 55)->nullable();
            $table->boolean('existing_customer')->nullable();
            $table->text('notes')->nullable();
            $table->string('udid')->nullable();
            $table->timestamp('timestamp')->nullable();
            $table->timestamp('modified')->nullable();
            $table->integer('tradeshow_id')->unsigned();
            $table->foreign('tradeshow_id')->references('id')->on('tradeshows');

            // $table->string('idleads')->nullable();
            // $table->string('philips_representative')->nullable();
            // $table->string('mad_event_type')->nullable();
            // $table->string('tradeshow')->nullable();
            // $table->string('visit_purpose')->nullable();
            $table->boolean('contact_by_email')->nullable();
            $table->boolean('contact_by_phone')->nullable();
            $table->string('answers_path')->nullable();
            $table->timestamps();
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('leads');
	}

}
      