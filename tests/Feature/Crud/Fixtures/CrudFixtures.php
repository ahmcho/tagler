<?php

namespace Tests\Feature\Crud\Fixtures;

use Illuminate\Support\Facades\Schema;

class CrudFixtures
{
    /**
     * Creates the tables the crud tests use. Parents are hard-deleted and
     * block deletion while children exist (foreign key). Notes are soft-deleted.
     */
    public static function up(): void
    {
        Schema::create('crud_parents', function ($table): void {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('crud_children', function ($table): void {
            $table->id();
            $table->foreignId('crud_parent_id')->constrained('crud_parents');
            $table->string('name');
        });

        Schema::create('crud_notes', function ($table): void {
            $table->id();
            $table->string('title');
            $table->timestamps();
            $table->softDeletes();
        });
    }
}
