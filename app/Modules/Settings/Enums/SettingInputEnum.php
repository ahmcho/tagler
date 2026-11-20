<?php

namespace App\Modules\Settings\Enums;

/**
 * Which control edits a setting. Separate from InputValueTypeEnum: that one says how a value is
 * stored, this one says how it is edited. Each case needs a renderer in
 * resources/js/modules/settings/components/setting-field.tsx.
 */
enum SettingInputEnum: string
{
    case Text = 'text';
    case File = 'file';
}
