<?php

namespace Crud\Requests;

/**
 * Immutable bag of query options (filters, sorting, eager-loads, paging)
 * parsed out of an AppFormRequest.
 */
class RequestParser
{
    public function __construct(
        private readonly ?array $autoFilters = [],
        private readonly ?array $customFilters = [],
        private readonly ?string $autoSorting = null,
        private readonly ?string $customSorting = null,
        private readonly ?array $expandable = [],
        private readonly ?array $customExpandable = [],
        private readonly ?int $perPage = 20,
    ) {}

    public function getAutoFilters(): array
    {
        return $this->autoFilters;
    }

    public function getCustomFilters(): array
    {
        return $this->customFilters;
    }

    public function getAutoSorting(): ?string
    {
        return $this->autoSorting;
    }

    public function getCustomSorting(): ?string
    {
        return $this->customSorting;
    }

    public function getExpandable(): array
    {
        return $this->expandable;
    }

    public function getCustomExpandable(): array
    {
        return $this->customExpandable;
    }

    public function getPerPage(): ?int
    {
        return $this->perPage;
    }
}
