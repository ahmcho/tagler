<?php

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\Concerns\FiltersQuery;
use App\Modules\Auth\Models\Role;
use Crud\Requests\AppFormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends AppFormRequest
{
    use FiltersQuery;

    protected ?string $sortBy = 'name';

    /**
     * Filters applied through the repository (`addPermissionCondition`), not as plain column conditions.
     *
     * @var array<int, string>
     */
    protected array $customFilters = ['permission'];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return match ($this->scenario) {
            self::SCENARIO_INSERT, self::SCENARIO_UPDATE => [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique(Role::class, 'name')
                        ->where('guard_name', 'web')
                        ->ignore($this->route('role')),
                ],
                'permissions' => ['required', 'array', 'min:1'],
                'permissions.*' => ['integer', 'exists:permissions,id'],
            ],
            default => [
                'name' => 'string|nullable',
                'permission' => ['nullable', 'integer', 'exists:permissions,id'],
            ],
        };
    }

    /**
     * @return array<int, string>
     */
    protected function sortable(): array
    {
        return ['id', 'name', 'created_at'];
    }
}
