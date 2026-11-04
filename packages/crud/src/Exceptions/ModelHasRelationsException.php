<?php

namespace Crud\Exceptions;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

/**
 * A model cannot be deleted because other records still depend on it. Thrown
 * by a model's own delete() guard, or by the repository when the database
 * rejects the delete with a foreign key violation.
 *
 * Left uncaught, it renders as a 403 with its message.
 */
class ModelHasRelationsException extends HttpException
{
    public function __construct(?string $message = null, ?Throwable $previous = null)
    {
        parent::__construct(
            statusCode: Response::HTTP_FORBIDDEN,
            message: $message ?? __('This record is still used by other records and cannot be deleted.'),
            previous: $previous,
        );
    }
}
