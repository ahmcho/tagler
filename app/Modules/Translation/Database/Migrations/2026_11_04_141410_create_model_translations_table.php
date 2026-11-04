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
        Schema::create('model_translations', function (Blueprint $table): void {
            $table->id();
            $table->morphs('translatable');
            $table->string('locale', 3);
            $table->string('field', 50);
            $table->text('value');
            $table->timestamps();

            $table->unique(['translatable_type', 'translatable_id', 'locale', 'field'], 'model_translations_unique');
            $table->index(['translatable_type', 'translatable_id', 'locale'], 'model_translations_locale_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_translations');
    }
};
