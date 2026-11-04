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

    final protected function generateAutoFilters(): array
    {
        $rules = collect($this->rules())
            ->forget($this->customFilters)
            ->toArray();

        $values = $this->validated();

        $autoFilters = [];

        foreach ($rules as $attr => $rule) {
            if (! is_array($rule) && ! is_string($rule)) {
                continue;
            }

            $rule = is_string($rule) ? explode('|', $rule) : $rule;

            if (in_array('string', $rule) && ! empty($values[$attr])) {
                $autoFilters[] = [$attr, 'LIKE', "%{$values[$attr]}%"];
            } elseif (isset($values[$attr]) && $values[$attr] != null) {
                $autoFilters[] = [$attr, '=', $values[$attr]];
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
        $perPage = (int) $this->get('per-page');

        if ($perPage < 1) {
            return $this->perPage ?: config('crud.items_count_per_page');
        }

        return $perPage > config('crud.max_items_count_per_page')
            ? config('crud.items_count_per_page')
            : $perPage;
    }

    final protected function autoSorting(): ?string
    {
        $sorting = $this->get('sort');

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
        $sorting = $this->get('sort');

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

    private function requestedExpand(): Collection
    {
        return collect(explode(',', (string) $this->get('expand')))
            ->map(fn ($e) => trim($e));
    }

    private function withDirection(string $attr): string
    {
        $direction = strtolower($this->get('direction'));

        return $direction === 'desc' ? "-{$attr}" : $attr;
    }
}
