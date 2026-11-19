<?php

namespace App\Modules\Auth\Providers;

use App\Models\User;
use App\Modules\Auth\Actions\CreateNewUser;
use App\Modules\Auth\Actions\ResetUserPassword;
use App\Modules\Auth\Enums\ModelStatusEnum;
use App\Modules\Auth\Models\ActivityLog;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Policies\ActivityLogPolicy;
use App\Modules\Auth\Policies\PermissionPolicy;
use App\Modules\Auth\Policies\RolePolicy;
use App\Modules\Auth\Policies\UserPolicy;
use App\Modules\Auth\Repositories\ActivityLogRepository;
use App\Modules\Auth\Repositories\Contracts\ActivityLogRepositoryContract;
use App\Modules\Auth\Repositories\Contracts\PermissionRepositoryContract;
use App\Modules\Auth\Repositories\Contracts\RoleRepositoryContract;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryContract;
use App\Modules\Auth\Repositories\PermissionRepository;
use App\Modules\Auth\Repositories\RoleRepository;
use App\Modules\Auth\Repositories\UserRepository;
use App\Modules\Auth\Services\ActivityLogService;
use App\Modules\Auth\Services\Contracts\ActivityLogServiceContract;
use App\Modules\Auth\Services\Contracts\PermissionServiceContract;
use App\Modules\Auth\Services\Contracts\RoleServiceContract;
use App\Modules\Auth\Services\Contracts\UserServiceContract;
use App\Modules\Auth\Services\PermissionService;
use App\Modules\Auth\Services\RoleService;
use App\Modules\Auth\Services\UserService;
use App\Modules\Auth\Support\AbilityRegistry;
use App\Modules\Auth\Support\PermissionRegistry;
use Crud\Providers\ModuleServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class AuthServiceProvider extends ModuleServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        RoleRepositoryContract::class => RoleRepository::class,
        PermissionRepositoryContract::class => PermissionRepository::class,
        UserRepositoryContract::class => UserRepository::class,
        ActivityLogRepositoryContract::class => ActivityLogRepository::class,
    ];

    /**
     * @var array<class-string, class-string>
     */
    protected array $services = [
        RoleServiceContract::class => RoleService::class,
        PermissionServiceContract::class => PermissionService::class,
        UserServiceContract::class => UserService::class,
        ActivityLogServiceContract::class => ActivityLogService::class,
    ];

    public function register(): void
    {
        parent::register();

        $this->mergeConfigFrom(__DIR__.'/../config/auth.php', 'modules.auth');

        $this->app->singleton(PermissionRegistry::class);
        $this->app->singleton(AbilityRegistry::class);
    }

    /**
     * Runs after every provider has registered, so modules can add their permissions and abilities in boot().
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        $this->configureActions();
        $this->configureAuthentication();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->registerPolicies();
        $this->registerPermissions();
        $this->registerAbilities();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Rejects an inactive user before the session is created. The middleware
     * covers sessions that were open before the account was deactivated.
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(function (Request $request): ?User {
            $user = app(UserRepositoryContract::class)->findByEmail((string) $request->input(Fortify::username()));

            if ($user === null || ! Hash::check((string) $request->input('password'), $user->password)) {
                return null;
            }

            if ($user->status !== ModelStatusEnum::Active) {
                throw ValidationException::withMessages([Fortify::username() => __('translations.auth.inactive')]);
            }

            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }

    private function registerPolicies(): void
    {
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(Permission::class, PermissionPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(ActivityLog::class, ActivityLogPolicy::class);
    }

    /**
     * The Auth module's permissions. Each module adds its own in its provider's boot().
     */
    private function registerPermissions(): void
    {
        app(PermissionRegistry::class)->register([
            ['name' => 'roles.index', 'description' => 'View the role list'],
            ['name' => 'roles.show', 'description' => 'View a role'],
            ['name' => 'roles.store', 'description' => 'Create roles'],
            ['name' => 'roles.update', 'description' => 'Edit roles'],
            ['name' => 'roles.destroy', 'description' => 'Delete roles'],
            ['name' => 'permissions.index', 'description' => 'View the permission list'],
            ['name' => 'permissions.show', 'description' => 'View a permission'],
            ['name' => 'users.index', 'description' => 'View the user list'],
            ['name' => 'users.show', 'description' => 'View a user'],
            ['name' => 'users.store', 'description' => 'Create users'],
            ['name' => 'users.update', 'description' => 'Edit users'],
            ['name' => 'users.destroy', 'description' => 'Delete users'],
            ['name' => 'activity-logs.index', 'description' => 'View the activity log'],
        ]);
    }

    /**
     * Class-level abilities for the Inertia `can` prop (topnav and "New" buttons).
     */
    private function registerAbilities(): void
    {
        app(AbilityRegistry::class)->register([
            'roles.index' => [Role::class, 'viewAny'],
            'roles.store' => [Role::class, 'create'],
            'permissions.index' => [Permission::class, 'viewAny'],
            'users.index' => [User::class, 'viewAny'],
            'users.store' => [User::class, 'create'],
            'activity-logs.index' => [ActivityLog::class, 'viewAny'],
        ]);
    }
}
