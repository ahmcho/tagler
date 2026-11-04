<?php

namespace Tests\Feature\Crud\Fixtures;

use Crud\Services\BaseCrudService;

class CrudParentService extends BaseCrudService implements CrudParentServiceContract
{
    public function __construct(CrudParentRepositoryContract $repository)
    {
        parent::__construct($repository);
    }
}
