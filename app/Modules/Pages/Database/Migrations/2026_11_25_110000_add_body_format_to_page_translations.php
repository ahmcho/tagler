<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_translations', function (Blueprint $table): void {
            $table->string('body_format', 16)->default('html')->after('body');
        });
    }

    public function down(): void
    {
        Schema::table('page_translations', function (Blueprint $table): void {
            $table->dropColumn('body_format');
        });
    }
};
