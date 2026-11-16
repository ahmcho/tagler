<?php

namespace App\Modules\Auth\Requests;

use App\Models\User;
use App\Modules\Auth\Concerns\FiltersQuery;
use App\Modules\Auth\Concerns\PasswordValidationRules;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Support\LastAdminGuard;
use Crud\Requests\AppFormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends AppFormRequest
{
    use FiltersQuery, PasswordValidationRules;

    protected ?string $sortBy = 'name';

    /**
     * Filters applied through the repository (`addRoleCondition`), not as plain column conditions.
     *
     * @var array<int, string>
     */
    protected array $customFilters = ['role'];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return match ($this->scenario) {
            self::SCENARIO_INSERT => [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', Rule::unique(User::class, 'email')],
                'password' => $this->passwordRules(),
                'roles' => ['required', 'array', 'min:1'],
                'roles.*' => ['integer', 'exists:roles,id'],
            ],
            self::SCENARIO_UPDATE => [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', Rule::unique(User::class, 'email')->ignore($this->route('user'))],
                'password' => ['nullable', 'string', Password::default(), 'confirmed'],
                'roles' => ['required', 'array', 'min:1'],
                'roles.*' => ['integer', 'exists:roles,id'],
            ],
            default => [
                'name' => 'string|nullable',
                'email' => 'string|nullable',
                'role' => ['nullable', 'integer', 'exists:roles,id'],
            ],
        };
    }

    /**
     * The last Admin cannot lose the Admin role.
     */
    public function withValidator(Validator $validator): void
    {
        if ($this->scenario !== self::SCENARIO_UPDATE) {
            return;
        }

        $validator->after(function (Validator $validator): void {
            /** @var User $user */
            $user = $this->route('user');
            $adminRoleId = Role::query()->where('name', Role::ADMIN)->where('guard_name', 'web')->value('id');

            if ($adminRoleId === null) {
                return;
            }

            $keepsAdmin = in_array($adminRoleId, array_map('intval', (array) $this->input('roles', [])), true);

            if (! $keepsAdmin && app(LastAdminGuard::class)->isLastAdmin($user)) {
                $validator->errors()->add('roles', __('translations.users.validation.last_admin_role_required'));
            }
        });
    }

    /**
     * @return array<int, string>
     */
    protected function sortable(): array
    {
        return ['id', 'name', 'email', 'created_at'];
    }
}
