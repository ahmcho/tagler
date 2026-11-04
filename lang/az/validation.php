<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => ':attribute qəbul edilməlidir.',
    'accepted_if' => ':attribute :other :value olduqda qəbul edilməlidir.',
    'active_url' => ':attribute etibarlı URL deyil.',
    'after' => ':attribute :date tarixindən sonrakı bir tarix olmalıdır.',
    'after_or_equal' => ':attribute :date tarixinə bərabər və ya sonrakı bir tarix olmalıdır.',
    'alpha' => ':attribute yalnız hərflərdən ibarət olmalıdır.',
    'alpha_dash' => ':attribute yalnız hərflər, nömrələr, tire və alt xətlərdən ibarət olmalıdır.',
    'alpha_num' => ':attribute yalnız hərflər və nömrələrdən ibarət olmalıdır.',
    'any_of' => ':attribute sahəsi etibarsızdır.',
    'array' => ':attribute bir array olmalıdır.',
    'ascii' => ':attribute yalnız tək-bayt alfanumerik simvollardan və simvollardan ibarət olmalıdır.',
    'before' => ':attribute :date tarixindən əvvəlki bir tarix olmalıdır.',
    'before_or_equal' => ':attribute :date tarixinə bərabər və ya əvvəlki bir tarix olmalıdır.',
    'between' => [
        'array' => ':attribute :min və :max arasında element olmalıdır.',
        'file' => ':attribute :min və :max kilobayt arasında olmalıdır.',
        'numeric' => ':attribute :min və :max arasında olmalıdır.',
        'string' => ':attribute :min və :max simvol arasında olmalıdır.',
    ],
    'boolean' => ':attribute sahəsi doğru və ya yanlış olmalıdır.',
    'can' => ':attribute sahəsində icazə verilməyən dəyər var.',
    'confirmed' => ':attribute təsdiqi uyğun gəlmir.',
    'contains' => ':attribute sahəsində tələb olunan dəyər çatışmır.',
    'current_password' => 'Şifrə səhvdir.',
    'date' => ':attribute etibarlı tarix deyil.',
    'date_equals' => ':attribute :date tarixinə bərabər olmalıdır.',
    'date_format' => ':attribute :format formatına uyğun deyil.',
    'decimal' => ':attribute :decimal onluq yerə malik olmalıdır.',
    'declined' => ':attribute rədd edilməlidir.',
    'declined_if' => ':attribute :other :value olduqda rədd edilməlidir.',
    'different' => ':attribute və :other fərqli olmalıdır.',
    'digits' => ':attribute :digits rəqəm olmalıdır.',
    'digits_between' => ':attribute :min və :max arasında rəqəm olmalıdır.',
    'dimensions' => ':attribute-in yanlış ölçüləri var.',
    'distinct' => ':attribute sahəsində təkrar dəyər var.',
    'doesnt_contain' => ':attribute aşağıdakı heç birini ehtiva etməməlidir: :values.',
    'doesnt_end_with' => ':attribute aşağıdakılardan biri ilə bitməməlidir: :values.',
    'doesnt_start_with' => ':attribute aşağıdakılardan biri ilə başlamamalıdır: :values.',
    'email' => ':attribute etibarlı email ünvanı olmalıdır.',
    'ends_with' => ':attribute aşağıdakılardan biri ilə bitməlidir: :values.',
    'enum' => 'Seçilmiş :attribute etibarsızdır.',
    'exists' => 'Seçilmiş :attribute etibarsızdır.',
    'extensions' => ':attribute sahəsində aşağıdakı genişlənmələrdən biri olmalıdır: :values.',
    'file' => ':attribute fayl olmalıdır.',
    'filled' => ':attribute sahəsinin dəyəri olmalıdır.',
    'gt' => [
        'array' => ':attribute :value-dən çox element olmalıdır.',
        'file' => ':attribute :value kilobaytdan böyük olmalıdır.',
        'numeric' => ':attribute :value-dən böyük olmalıdır.',
        'string' => ':attribute :value simvoldan çox olmalıdır.',
    ],
    'gte' => [
        'array' => ':attribute :value və ya daha çox element olmalıdır.',
        'file' => ':attribute :value kilobayta bərabər və ya böyük olmalıdır.',
        'numeric' => ':attribute :value-ə bərabər və ya böyük olmalıdır.',
        'string' => ':attribute :value simvola bərabər və ya çox olmalıdır.',
    ],
    'hex_color' => ':attribute sahəsi etibarlı onaltılıq rəng olmalıdır.',
    'image' => ':attribute şəkil olmalıdır.',
    'in' => 'Seçilmiş :attribute etibarsızdır.',
    'in_array' => ':attribute sahəsi :other-də mövcud deyil.',
    'in_array_keys' => ':attribute sahəsində aşağıdakı açarlardan ən az biri olmalıdır: :values.',
    'integer' => ':attribute tam ədəd olmalıdır.',
    'ip' => ':attribute etibarlı IP ünvanı olmalıdır.',
    'ipv4' => ':attribute etibarlı IPv4 ünvanı olmalıdır.',
    'ipv6' => ':attribute etibarlı IPv6 ünvanı olmalıdır.',
    'json' => ':attribute etibarli JSON sətri olmalıdır.',
    'list' => ':attribute siyahı olmalıdır.',
    'lowercase' => ':attribute kiçik hərflərlə olmalıdır.',
    'lt' => [
        'array' => ':attribute :value-dən az element olmalıdır.',
        'file' => ':attribute :value kilobaytdan az olmalıdır.',
        'numeric' => ':attribute :value-dən az olmalıdır.',
        'string' => ':attribute :value simvoldan az olmalıdır.',
    ],
    'lte' => [
        'array' => ':attribute :value-dən çox element olmamalıdır.',
        'file' => ':attribute :value kilobayta bərabər və ya az olmalıdır.',
        'numeric' => ':attribute :value-ə bərabər və ya az olmalıdır.',
        'string' => ':attribute :value simvola bərabər və ya az olmalıdır.',
    ],
    'mac_address' => ':attribute etibarlı MAC ünvanı olmalıdır.',
    'max' => [
        'array' => ':attribute :max-dən çox element olmamalıdır.',
        'file' => ':attribute :max kilobaytdan böyük olmamalıdır.',
        'numeric' => ':attribute :max-dən böyük olmamalıdır.',
        'string' => ':attribute :max simvoldan çox olmamalıdır.',
    ],
    'max_digits' => ':attribute :max-dən çox rəqəm olmamalıdır.',
    'mimes' => ':attribute aşağıdakı tiplərdən biri olmalıdır: :values.',
    'mimetypes' => ':attribute aşağıdakı tiplərdən biri olmalıdır: :values.',
    'min' => [
        'array' => ':attribute ən az :min element olmalıdır.',
        'file' => ':attribute ən az :min kilobayt olmalıdır.',
        'numeric' => ':attribute ən az :min olmalıdır.',
        'string' => ':attribute ən az :min simvol olmalıdır.',
    ],
    'min_digits' => ':attribute ən az :min rəqəm olmalıdır.',
    'missing' => ':attribute sahəsi olmamalıdır.',
    'missing_if' => ':attribute sahəsi :other :value olduqda olmamalıdır.',
    'missing_unless' => ':attribute sahəsi :other :value olmadıqda olmamalıdır.',
    'missing_with' => ':attribute sahəsi :values mövcud olduqda olmamalıdır.',
    'missing_with_all' => ':attribute sahəsi :values mövcud olduqda olmamalıdır.',
    'multiple_of' => ':attribute :value-ın qatı olmalıdır.',
    'not_in' => 'Seçilmiş :attribute etibarsızdır.',
    'not_regex' => ':attribute formatı etibarsızdır.',
    'numeric' => ':attribute ədəd olmalıdır.',
    'password' => [
        'letters' => ':attribute ən az bir hərf ehtiva etməlidir.',
        'mixed' => ':attribute ən az bir böyük və bir kiçik hərf ehtiva etməlidir.',
        'numbers' => ':attribute ən az bir rəqəm ehtiva etməlidir.',
        'symbols' => ':attribute ən az bir simvol ehtiva etməlidir.',
        'uncompromised' => 'Verilmiş :attribute məlumat sızmasında görünüb. Zəhmət olmasa fərqli :attribute seçin.',
    ],
    'present' => ':attribute sahəsi mövcud olmalıdır.',
    'present_if' => ':attribute sahəsi :other :value olduqda mövcud olmalıdır.',
    'present_unless' => ':attribute sahəsi :other :value olmadıqda mövcud olmalıdır.',
    'present_with' => ':attribute sahəsi :values mövcud olduqda mövcud olmalıdır.',
    'present_with_all' => ':attribute sahəsi :values mövcud olduqda mövcud olmalıdır.',
    'prohibited' => ':attribute sahəsi qadağandır.',
    'prohibited_if' => ':attribute sahəsi :other :value olduqda qadağandır.',
    'prohibited_if_accepted' => ':attribute sahəsi :other qəbul edildikdə qadağandır.',
    'prohibited_if_declined' => ':attribute sahəsi :other rədd edildikdə qadağandır.',
    'prohibited_unless' => ':attribute sahəsi :other :values olmadıqda qadağandır.',
    'prohibits' => ':attribute sahəsi :other-in mövcud olmasını qadağan edir.',
    'regex' => ':attribute formatı etibarsızdır.',
    'required' => ':attribute sahəsi mütləqdir.',
    'required_array_keys' => ':attribute sahəsi aşağıdakılar üçün daxiletmələr ehtiva etməlidir: :values.',
    'required_if' => ':attribute sahəsi :other :value olduqda mütləqdir.',
    'required_if_accepted' => ':attribute sahəsi :other qəbul edildikdə mütləqdir.',
    'required_if_declined' => ':attribute sahəsi :other rədd edildikdə mütləqdir.',
    'required_unless' => ':attribute sahəsi :other :values olmadıqda mütləqdir.',
    'required_with' => ':values mövcud olduqda :attribute sahəsi mütləqdir.',
    'required_with_all' => ':values mövcud olduqda :attribute sahəsi mütləqdir.',
    'required_without' => ':values mövcud olmadıqda :attribute sahəsi mütləqdir.',
    'required_without_all' => ':heç biri :values mövcud olmadıqda :attribute sahəsi mütləqdir.',
    'same' => ':attribute və :other uyğun olmalıdır.',
    'size' => [
        'array' => ':attribute :size element ehtiva etməlidir.',
        'file' => ':attribute :size kilobayt olmalıdır.',
        'numeric' => ':attribute :size olmalıdır.',
        'string' => ':attribute :size simvol olmalıdır.',
    ],
    'starts_with' => ':attribute aşağıdakılardan biri ilə başlamalıdır: :values.',
    'string' => ':attribute sətir olmalıdır.',
    'timezone' => ':attribute etibarlı saat zonası olmalıdır.',
    'unique' => ':attribute artıq götürülmüşdür.',
    'uploaded' => ':attribute yüklənmədi.',
    'uppercase' => ':attribute böyük hərflərlə olmalıdır.',
    'url' => ':attribute etibarlı URL olmalıdır.',
    'ulid' => ':attribute etibarlı ULID olmalıdır.',
    'uuid' => ':attribute etibarlı UUID olmalıdır.',
    'was_not_selected' => ':attribute seçilməyib',
    'incorrect' => ':attribute düzgün deyil',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'xüsusi mesaj',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
