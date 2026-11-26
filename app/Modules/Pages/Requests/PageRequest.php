<?php

namespace App\Modules\Pages\Requests;

use App\Modules\Pages\Concerns\FiltersQuery;
use App\Modules\Pages\Enums\BodyFormatEnum;
use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Enums\PageStatusEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use Crud\Requests\AppFormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class PageRequest extends AppFormRequest
{
    use FiltersQuery;

    protected ?string $sortBy = 'updated_at';

    /**
     * Every list filter runs through the repository (`add{Name}Condition`), because the
     * text filters read the translations and the live check needs the publish time.
     *
     * @var array<int, string>
     */
    protected array $customFilters = [
        'status', 'live', 'homepage', 'publish_date', 'title', 'subtitle', 'slug', 'path',
    ];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return match ($this->scenario) {
            self::SCENARIO_INSERT, self::SCENARIO_UPDATE => [
                'status' => ['required', Rule::enum(PageStatusEnum::class)],
                'parent_id' => ['nullable', 'integer', 'exists:pages,id'],
                'publish_date' => ['nullable', 'date_format:Y-m-d', Rule::requiredIf(fn (): bool => $this->enum('status', PageStatusEnum::class) === PageStatusEnum::Scheduled)],
                'publish_time' => ['nullable', 'date_format:H:i', Rule::requiredIf(fn (): bool => $this->enum('status', PageStatusEnum::class) === PageStatusEnum::Scheduled)],
                'layout' => ['nullable', 'string', 'max:64'],
                'theme_layout' => ['sometimes', 'boolean'],
                'translations' => ['required', 'array'],
                ...$this->translationRules(),
            ],
            default => [
                'status' => ['nullable', Rule::enum(PageStatusEnum::class)],
                'live' => ['nullable', Rule::in(['1', '0'])],
                'homepage' => ['nullable', Rule::in(['1', '0'])],
                'publish_date' => ['nullable', 'string', function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $this->isValidPublishDateRange((string) $value)) {
                        $fail(__('pages.errors.invalid_publish_range'));
                    }
                }],
                'title' => ['nullable', 'string', 'max:255'],
                'subtitle' => ['nullable', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'path' => ['nullable', 'string', 'max:255'],
            ],
        };
    }

    /**
     * A `from,to` pair of real `YYYY-MM-DD` dates, with `from` not after `to`.
     */
    private function isValidPublishDateRange(string $range): bool
    {
        if (preg_match('/^(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})$/', $range, $bounds) !== 1) {
            return false;
        }

        [, $from, $to] = $bounds;

        return $this->isRealDate($from) && $this->isRealDate($to) && $from <= $to;
    }

    /**
     * Carbon rolls over impossible dates such as `2026-02-30`, so the value is compared with its own re-format.
     */
    private function isRealDate(string $date): bool
    {
        $parsed = Carbon::createFromFormat('!Y-m-d', $date);

        return $parsed !== false && $parsed->format('Y-m-d') === $date;
    }

    /**
     * Each supported locale may hold its own fields. The default locale must always have a title and a slug.
     *
     * @return array<string, mixed>
     */
    private function translationRules(): array
    {
        $rules = [];

        foreach (LocaleEnum::codes() as $locale) {
            $isDefault = $locale === LocaleEnum::default();

            $rules["translations.{$locale}.title"] = [$isDefault ? 'required' : 'nullable', 'string', 'max:255'];
            $rules["translations.{$locale}.subtitle"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$locale}.slug"] = [$isDefault ? 'required' : 'nullable', 'string', 'max:255'];
            $rules["translations.{$locale}.seo_title"] = ['nullable', 'string', 'max:255'];
            $rules["translations.{$locale}.seo_description"] = ['nullable', 'string', 'max:500'];
            $rules["translations.{$locale}.body"] = ['nullable', 'string'];
            $rules["translations.{$locale}.body_format"] = ['nullable', Rule::enum(BodyFormatEnum::class)];
        }

        return $rules;
    }

    /**
     * Checks what depends on the page itself: the slug format, the path it
     * produces in each locale, reserved names, and whether another page holds the path.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! in_array($this->scenario, [self::SCENARIO_INSERT, self::SCENARIO_UPDATE], true)) {
                    return;
                }

                $this->checkUnsupportedLocales($validator);
                $this->checkEachLocale($validator);
                $this->checkScheduledInFuture($validator);
            },
        ];
    }

    /**
     * A scheduled page needs its publish date and time combined into a moment
     * after now. Both are in the app timezone. Skipped when either part is malformed,
     * because the field rules already report that.
     */
    private function checkScheduledInFuture(Validator $validator): void
    {
        if ($this->enum('status', PageStatusEnum::class) !== PageStatusEnum::Scheduled) {
            return;
        }

        if ($validator->errors()->hasAny(['publish_date', 'publish_time'])) {
            return;
        }

        $publishAt = Carbon::createFromFormat('!Y-m-d H:i', $this->input('publish_date').' '.$this->input('publish_time'));

        if ($publishAt === null || $publishAt->lessThanOrEqualTo(Carbon::now())) {
            $validator->errors()->add('publish_time', __('pages.errors.publish_in_past'));
        }
    }

    private function checkUnsupportedLocales(Validator $validator): void
    {
        foreach (array_keys((array) $this->input('translations', [])) as $locale) {
            if (! LocaleEnum::isSupported((string) $locale)) {
                $validator->errors()->add('translations', __('pages.errors.unsupported_locale', ['locale' => $locale]));
            }
        }
    }

    private function checkEachLocale(Validator $validator): void
    {
        $service = app(PageServiceContract::class);
        $routePage = $this->route('page');
        $page = $routePage instanceof Page ? $routePage : null;
        $parentId = $this->input('parent_id');

        foreach (LocaleEnum::codes() as $locale) {
            $translation = (array) $this->input("translations.{$locale}", []);

            if (! $this->hasAnyValue($translation)) {
                continue;
            }

            if ($validator->errors()->has("translations.{$locale}.title") || $validator->errors()->has("translations.{$locale}.slug")) {
                continue;
            }

            if (! filled($translation['title'] ?? null) || ! filled($translation['slug'] ?? null)) {
                $validator->errors()->add("translations.{$locale}.slug", __('pages.errors.locale_needs_title_and_slug', ['locale' => $locale]));

                continue;
            }

            if ($page?->is_homepage) {
                continue;
            }

            if (! $service->parentHasLocale($parentId, $locale)) {
                $validator->errors()->add("translations.{$locale}.slug", __('pages.errors.parent_not_in_locale', ['locale' => $locale]));

                continue;
            }

            $path = $service->resolvePath($locale, $parentId, (string) $translation['slug']);

            if ($path === null) {
                $validator->errors()->add("translations.{$locale}.slug", __('pages.errors.invalid_slug'));

                continue;
            }

            if (in_array($path->firstSegment(), config('modules.pages.reserved_paths'), true)
                || in_array($path->firstSegment(), LocaleEnum::codes(), true)) {
                $validator->errors()->add("translations.{$locale}.slug", __('pages.errors.reserved_path', ['path' => $path->value]));

                continue;
            }

            if ($service->pathIsTaken($locale, $path, $page?->id)) {
                $validator->errors()->add("translations.{$locale}.slug", __('pages.errors.path_taken', ['path' => $path->value]));
            }
        }
    }

    /**
     * @param  array<string, mixed>  $translation
     */
    private function hasAnyValue(array $translation): bool
    {
        unset($translation['body_format']);

        return collect($translation)->contains(fn (mixed $value): bool => filled($value));
    }

    /**
     * @return array<int, string>
     */
    protected function sortable(): array
    {
        return ['id', 'status', 'updated_at'];
    }

    /**
     * @return array<int, string>
     */
    protected function customSortable(): array
    {
        return ['title'];
    }
}
