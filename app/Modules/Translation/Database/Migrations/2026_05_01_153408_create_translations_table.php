<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();

            $table->string('key')->index();
            $table->string('locale', 10)->index();
            $table->text('translation');
            $table->string('group')->nullable()->index();

            $table->unique(['key', 'locale']);
            $table->index(['locale', 'key']);
            $table->index(['group', 'locale']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
