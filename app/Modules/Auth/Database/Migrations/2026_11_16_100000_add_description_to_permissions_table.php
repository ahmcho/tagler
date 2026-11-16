<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(config('permission.table_names.permissions'), function (Blueprint $table): void {
            $table->string('description')->nullable()->after('guard_name');
        });
    }

    public function down(): void
    {
        Schema::table(config('permission.table_names.permissions'), function (Blueprint $table): void {
            $table->dropColumn('description');
        });
    }
};
