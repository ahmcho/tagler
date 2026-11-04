<?php

namespace Crud\Providers;

use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

/**
 * Base provider for a module. A module lists its contract => implementation
 * pairs. Each pair is checked, then bound in the container.
 */
abstract class ModuleServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string> contract => repository implementation
     */
    protected array $repositories = [];

    /**
     * @var array<class-string, class-string> contract => service implementation
     */
    protected array $services = [];

    public function register(): void
    {
        $this->bindPairs([...$this->repositories, ...$this->services]);
    }

    /**
     * @param  array<class-string, class-string>  $pairs
     *
     * @throws InvalidArgumentException when an implementation does not implement its contract
     */
    private function bindPairs(array $pairs): void
    {
        foreach ($pairs as $contract => $implementation) {
            if (! is_a($implementation, $contract, true)) {
                throw new InvalidArgumentException("{$implementation} does not implement {$contract}.");
            }

            $this->app->bind($contract, $implementation);
        }
    }
}
