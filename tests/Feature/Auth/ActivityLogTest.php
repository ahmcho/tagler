<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\ActivityLog;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    // The seeder itself writes activity, so start each test from an empty log.
    DB::connection('mongodb')->getCollection('activity_log')->deleteMany([]);
});

test('activity is stored as a MongoDB document in the test database, not in SQL', function (): void {
    $user = User::factory()->create();

    DB::connection('mongodb')->getCollection('activity_log')->deleteMany([]);

    activity()->performedOn($user)->log('spike');

    expect(DB::connection('mongodb')->getDatabaseName())->toBe('tagler_test')
        ->and(ActivityLog::query()->first()->getConnectionName())->toBe('mongodb')
        ->and(DB::connection('mongodb')->getCollection('activity_log')->countDocuments())->toBe(1)
        ->and(DB::connection('pgsql')->getSchemaBuilder()->hasTable('activity_log'))->toBeFalse();
});

test('updating a role writes exactly one activity document with only the changed attribute', function (): void {
    $role = Role::query()->create(['name' => 'Editor', 'guard_name' => 'web']);

    DB::connection('mongodb')->getCollection('activity_log')->deleteMany([]);

    $role->update(['name' => 'Chief Editor']);

    $collection = DB::connection('mongodb')->getCollection('activity_log');
    $document = $collection->findOne();

    expect($collection->countDocuments())->toBe(1)
        ->and($document['event'])->toBe('updated')
        ->and($document['subject_type'])->toBe(Role::class)
        ->and($document['subject_id'])->toBe($role->id)
        ->and(iterator_to_array($document['properties']['attributes']))->toBe(['name' => 'Chief Editor'])
        ->and(iterator_to_array($document['properties']['old']))->toBe(['name' => 'Editor']);
});

test('the activity log records the IP address of the request', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->withServerVariables(['REMOTE_ADDR' => '10.1.2.3'])
        ->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('roles.store'), [
            'name' => 'Editor',
            'permissions' => [Permission::query()->where('name', 'translations.index')->value('id')],
        ]);

    expect(ActivityLog::query()->where('subject_type', Role::class)->first()->ip_address)->toBe('10.1.2.3');
});

test('an Admin can open the activity log page', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('activity-logs.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('activity-logs/index'));
});

test('a user without the activity-logs.index permission cannot open the activity log', function (): void {
    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('activity-logs.index'))
        ->assertForbidden();
});

test('the activity log can be filtered by event', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $role = Role::query()->create(['name' => 'Editor', 'guard_name' => 'web']);
    $role->update(['name' => 'Chief Editor']);

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('activity-logs.index', ['event' => 'updated']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('records.total', 1)
            ->where('filters.event', 'updated'));
});

test('changing a user name writes an activity entry but changing the password does not expose it', function (): void {
    $user = User::factory()->create(['name' => 'Old Name']);

    DB::connection('mongodb')->getCollection('activity_log')->deleteMany([]);

    $user->update(['name' => 'New Name', 'password' => 'Another-Passw0rd!']);

    $document = DB::connection('mongodb')->getCollection('activity_log')->findOne();

    expect(DB::connection('mongodb')->getCollection('activity_log')->countDocuments())->toBe(1)
        ->and($document['subject_type'])->toBe(User::class)
        ->and(iterator_to_array($document['properties']['attributes']))->toBe(['name' => 'New Name'])
        ->and(iterator_to_array($document['properties']['attributes']))->not->toHaveKey('password');
});

test('the activity log can be filtered to one model', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $editor = Role::query()->create(['name' => 'Editor', 'guard_name' => 'web']);
    Role::query()->create(['name' => 'Reviewer', 'guard_name' => 'web']);

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('activity-logs.index', ['subject_type' => Role::class, 'subject_id' => $editor->id]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('records.total', 1)
            ->where('records.data.0.subject_id', $editor->id));
});

test('the activity log collection has indexes for the filters and the sort order', function (): void {
    $indexKeys = collect(DB::connection('mongodb')->getCollection('activity_log')->listIndexes())
        ->map(fn ($index) => json_encode($index->getKey()))
        ->all();

    expect($indexKeys)->toContain(json_encode(['subject_type' => 1, 'subject_id' => 1]))
        ->and($indexKeys)->toContain(json_encode(['causer_type' => 1, 'causer_id' => 1]))
        ->and($indexKeys)->toContain(json_encode(['event' => 1]))
        ->and($indexKeys)->toContain(json_encode(['created_at' => -1]));
});

test('an Admin can open the detail page of an activity entry', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $role = Role::query()->create(['name' => 'Editor', 'guard_name' => 'web']);

    $this->actingAs($admin);
    $role->update(['name' => 'Chief Editor']);

    $log = ActivityLog::query()->where('event', 'updated')->where('subject_type', Role::class)->where('subject_id', $role->id)->firstOrFail();

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('activity-logs.show', $log->id))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('activity-logs/show')
            ->where('log.id', (string) $log->id)
            ->where('log.event', 'updated')
            ->where('log.causer', $admin->name)
            ->where('log.changes.attributes', ['name' => 'Chief Editor'])
            ->where('log.changes.old', ['name' => 'Editor']));
});

test('a user without the activity-logs.index permission cannot open an activity entry', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $role = Role::query()->create(['name' => 'Editor', 'guard_name' => 'web']);
    $role->update(['name' => 'Chief Editor']);

    $log = ActivityLog::query()->where('subject_type', Role::class)->firstOrFail();

    $user = User::factory()->create();
    $user->assignRole('User');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('activity-logs.show', $log->id))
        ->assertForbidden();
});

test('an unknown activity entry returns not found', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('activity-logs.show', '65f0c0ffee0000000000abcd'))
        ->assertNotFound();
});
