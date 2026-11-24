<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Models\MediaFolder;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('a folder can be created at the root and under a parent', function (): void {
    $parent = MediaFolder::factory()->create(['name' => 'Products']);

    $this->actingAs($this->admin)->postJson(route('media.folders.store'), ['name' => 'Shoes'])
        ->assertCreated()->assertJsonPath('data.name', 'Shoes')->assertJsonPath('data.parent_id', null);

    $this->actingAs($this->admin)->postJson(route('media.folders.store'), ['name' => 'Summer', 'parent_id' => $parent->id])
        ->assertCreated()->assertJsonPath('data.parent_id', $parent->id);
});

test('folder names are trimmed and unique within the same parent, ignoring case', function (): void {
    $parent = MediaFolder::factory()->create(['name' => 'Blog']);
    MediaFolder::factory()->create(['name' => 'Covers', 'parent_id' => $parent->id]);

    $this->actingAs($this->admin)->postJson(route('media.folders.store'), ['name' => '  covers ', 'parent_id' => $parent->id])
        ->assertUnprocessable()->assertJsonValidationErrorFor('name');

    $this->actingAs($this->admin)->postJson(route('media.folders.store'), ['name' => 'Covers'])
        ->assertCreated();
});

test('the same name is allowed under different parents', function (): void {
    $first = MediaFolder::factory()->create(['name' => 'A']);
    $second = MediaFolder::factory()->create(['name' => 'B']);
    MediaFolder::factory()->create(['name' => 'Shared', 'parent_id' => $first->id]);

    $this->actingAs($this->admin)->postJson(route('media.folders.store'), ['name' => 'Shared', 'parent_id' => $second->id])
        ->assertCreated();
});

test('a folder name cannot contain a path separator', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.folders.store'), ['name' => '../etc'])
        ->assertUnprocessable()->assertJsonValidationErrorFor('name');
});

test('a folder can be renamed to a new name but not to a sibling name', function (): void {
    $folder = MediaFolder::factory()->create(['name' => 'Old']);
    MediaFolder::factory()->create(['name' => 'Taken']);

    $this->actingAs($this->admin)->patchJson(route('media.folders.update', $folder), ['name' => 'New'])
        ->assertOk()->assertJsonPath('data.name', 'New');

    $this->actingAs($this->admin)->patchJson(route('media.folders.update', $folder), ['name' => 'taken'])
        ->assertUnprocessable()->assertJsonValidationErrorFor('name');
});

test('a folder cannot be moved into itself', function (): void {
    $folder = MediaFolder::factory()->create();

    $this->actingAs($this->admin)->postJson(route('media.folders.move', $folder), ['parent_id' => $folder->id])
        ->assertUnprocessable()->assertJsonValidationErrorFor('parent_id');
});

test('a folder cannot be moved into one of its descendants', function (): void {
    $root = MediaFolder::factory()->create(['name' => 'Root']);
    $child = MediaFolder::factory()->create(['name' => 'Child', 'parent_id' => $root->id]);
    $grandchild = MediaFolder::factory()->create(['name' => 'Grand', 'parent_id' => $child->id]);

    $this->actingAs($this->admin)->postJson(route('media.folders.move', $root), ['parent_id' => $grandchild->id])
        ->assertUnprocessable()->assertJsonValidationErrorFor('parent_id');

    expect($root->fresh()->parent_id)->toBeNull();
});

test('a folder can be moved to a valid parent', function (): void {
    $folder = MediaFolder::factory()->create(['name' => 'Moving']);
    $target = MediaFolder::factory()->create(['name' => 'Target']);

    $this->actingAs($this->admin)->postJson(route('media.folders.move', $folder), ['parent_id' => $target->id])
        ->assertOk()->assertJsonPath('data.parent_id', $target->id);
});

test('a folder with subfolders cannot be deleted', function (): void {
    $folder = MediaFolder::factory()->create();
    MediaFolder::factory()->create(['parent_id' => $folder->id]);

    $this->actingAs($this->admin)->deleteJson(route('media.folders.destroy', $folder))
        ->assertUnprocessable()->assertJsonValidationErrorFor('folder');
});

test('a folder that still holds files, including trashed ones, cannot be deleted', function (): void {
    $folder = MediaFolder::factory()->create();
    $media = Media::factory()->create(['folder_id' => $folder->id]);
    $media->delete();

    $this->actingAs($this->admin)->deleteJson(route('media.folders.destroy', $folder))
        ->assertUnprocessable()->assertJsonValidationErrorFor('folder');
});

test('an empty folder is deleted', function (): void {
    $folder = MediaFolder::factory()->create();

    $this->actingAs($this->admin)->deleteJson(route('media.folders.destroy', $folder))->assertNoContent();

    expect(MediaFolder::query()->whereKey($folder->id)->exists())->toBeFalse();
});

test('the folder list returns every folder with its file count and size in one response', function (): void {
    $folder = MediaFolder::factory()->create(['name' => 'Heroes']);
    MediaFolder::factory()->count(2)->create();
    Media::factory()->count(2)->create(['folder_id' => $folder->id, 'size' => 100]);
    Media::factory()->create(['folder_id' => $folder->id, 'size' => 50])->delete();

    $this->actingAs($this->admin)->getJson(route('media.folders.index'))
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonFragment(['id' => $folder->id, 'files_count' => 2, 'bytes' => 200]);
});

test('a user without the folder permission cannot create a folder', function (): void {
    $viewer = User::factory()->create();
    Role::create(['name' => 'Media viewer', 'guard_name' => 'web'])->givePermissionTo('media.index');
    $viewer->assignRole('Media viewer');

    $this->actingAs($viewer)->postJson(route('media.folders.store'), ['name' => 'Nope'])->assertForbidden();
});
