<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE listings MODIFY application_url TEXT NULL');
            DB::statement('ALTER TABLE listings MODIFY website TEXT NOT NULL');

            return;
        }

        Schema::table('listings', function (Blueprint $table) {
            $table->text('application_url')->nullable()->change();
            $table->text('website')->change();
        });
    }

    public function down()
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE listings MODIFY application_url VARCHAR(500) NULL');
            DB::statement('ALTER TABLE listings MODIFY website VARCHAR(255) NOT NULL');

            return;
        }

        Schema::table('listings', function (Blueprint $table) {
            $table->string('application_url', 500)->nullable()->change();
            $table->string('website', 255)->change();
        });
    }
};

