<?php

namespace Crud\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;

abstract class AppFormRequest extends FormRequest
{
    const SCENARIO_DEFAULT = 0;

    const SCENARIO_INSERT = 1;

    const SCENARIO_UPDATE = 2;

    const SCENARIO_DELETE = 3;

    protected int $scenario = self::SCENARIO_DEFAULT;

    /**
     * Default sort attribute. Prefix with "-" for descending.
     */
    protected ?string $sortBy = null;

    /**
     * Request keys that should be read verbatim rather than turned into
     * automatic "=" / "LIKE" conditions from the validation rules.
     */
    protected array $customFilters = [];

    /**
     * Relation names that may be requested via ?expand=... and joined
     * automatically.
     */
    protected array $expandable = [];

    /**
     * Relation names that may be requested via ?expand=... but need a
     * custom query rather than an automatic join.
     */
    protected array $customExpandable = [];

    protected int $perPage = 0;

    public function getScenario(): int
    {
        return $this->scenario;
    }

    public function rules(): array
    {
        return [];
    }

    final public function parser(): RequestParser
    {
        return new RequestParser(
            autoFilters: $this->generateAutoFilters(),
            customFilters: $this->customFilters(),
            autoSorting: $this->autoSorting(),
            customSorting: $this->customSorting(),
            expandable: $this->expandable(),
            customExpandable: $this->customExpandable(),
            perPage: $this->perPage(),
        );
    }

    public function lightParser(): RequestParser
    {
        return new RequestParser(
            expandable: $this->expandable(),
            customExpandable: $this->customExpandable()
        );
    }

    protected function sortable(): array
    {
        return [];
    }

    protected function customSortable(): array
    {
        return [];
    }

    final protected function getValidatorInstance(): Validator
    {
        $this->scenario = match ($this->method()) {
            self::METHOD_POST => self::SCENARIO_INSERT,
            self::METHOD_PUT, self::METHOD_PATCH => self::SCENARIO_UPDATE,
            self::METHOD_DELETE => self::SCENARIO_DELETE,
            default => self::SCENARIO_DEFAULT,
        };

        return parent::getValidatorInstance();
    }

    /**
     * @return list<array{0: string, 1: string, 2: mixed}>
     */
    final protected function generateAutoFilters(): array
    {
        $values = $this->validated();
        $autoFilters = [];

        foreach ($this->autoFilterableRules() as $attr => $rule) {
            $autoFilter = $this->autoFilterFor($attr, $rule, $values);

            if ($autoFilter !== null) {
                $autoFilters[] = $autoFilter;
            }
        }

        return $autoFilters;
    }

    final protected function customFilters(): array
    {
        return $this->only($this->customFilters);
    }

    final protected function perPage(): ?int
    {
        $perPage = (int) $this->input('per-page');

        if ($perPage < 1) {
            return $this->perPage ?: config('crud.items_count_per_page');
        }

        return $perPage > config('crud.max_items_count_per_page')
            ? config('crud.items_count_per_page')
            : $perPage;
    }

    final protected function autoSorting(): ?string
    {
        $sorting = $this->input('sort');

        if (in_array($sorting, $this->customSortable())) {
            return null;
        }

        if (! in_array($sorting, $this->sortable())) {
            return $this->sortBy;
        }

        return $this->withDirection($sorting);
    }

    final protected function customSorting(): ?string
    {
        $sorting = $this->input('sort');

        if (! in_array($sorting, $this->customSortable())) {
            return null;
        }

        return $this->withDirection($sorting);
    }

    final protected function expandable(): array
    {
        return $this->requestedExpand()
            ->diff($this->customExpandable)
            ->intersect($this->expandable)
            ->toArray();
    }

    final protected function customExpandable(): array
    {
        return $this->requestedExpand()
            ->intersect($this->customExpandable)
            ->toArray();
    }

    /**
     * The validation rules without the keys that are read verbatim as custom filters.
     *
     * @return array<string, mixed>
     */
    private function autoFilterableRules(): array
    {
        return collect($this->rules())
            ->forget($this->customFilters)
            ->toArray();
    }

    /**
     * Null means the attribute gets no automatic condition.
     *
     * @param  array<string, mixed>  $values
     * @return array{0: string, 1: string, 2: mixed}|null
     */
    private function autoFilterFor(int|string $attr, mixed $rule, array $values): ?array
    {
        if (! is_array($rule) && ! is_string($rule)) {
            return null;
        }

        $ruleNames = is_string($rule) ? explode('|', $rule) : $rule;

        if ($this->isLikeFilterable($attr, $ruleNames, $values)) {
            return [$attr, 'LIKE', "%{$values[$attr]}%"];
        }

        if ($this->isExactFilterable($attr, $values)) {
            return [$attr, '=', $values[$attr]];
        }

        return null;
    }

    /**
     * A string rule with a non-empty value becomes a LIKE condition.
     *
     * @param  array<int|string, mixed>  $ruleNames
     * @param  array<string, mixed>  $values
     */
    private function isLikeFilterable(int|string $attr, array $ruleNames, array $values): bool
    {
        return in_array('string', $ruleNames) && ! empty($values[$attr]);
    }

    /**
     * Any other set, non-null value becomes an exact-match condition.
     *
     * @param  array<string, mixed>  $values
     */
    private function isExactFilterable(int|string $attr, array $values): bool
    {
        return isset($values[$attr]) && $values[$attr] != null;
    }

    private function requestedExpand(): Collection
    {
        return collect(explode(',', (string) $this->input('expand')))
            ->map(fn ($e) => trim($e));
    }

    private function withDirection(string $attr): string
    {
        $direction = strtolower($this->input('direction'));

        return $direction === 'desc' ? "-{$attr}" : $attr;
    }
}
