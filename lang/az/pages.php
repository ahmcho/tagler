<?php

return [
    'public' => [
        'not_found_title' => 'Səhifə tapılmadı',
    ],

    'errors' => [
        'homepage_requires_live_page' => 'Ana səhifə olmaq üçün yalnız aktiv səhifə seçilə bilər. Əvvəl səhifəni dərc edin.',
        'publish_in_past' => 'Planlaşdırılmış səhifə üçün dərc tarixi və vaxtı gələcəkdə olmalıdır.',
        'invalid_publish_range' => 'Dərc tarixi aralığı düzgün deyil.',
        'parent_is_descendant' => 'Səhifə özünün və ya öz alt səhifələrindən birinin altına yerləşdirilə bilməz.',
        'locale_needs_title_and_slug' => ':locale versiyası üçün başlıq və slug yazılmalıdır, ya da bu sahə tam boş saxlanmalıdır.',
        'locale_used_by_children' => 'Alt səhifələr hələ də :locale versiyasından istifadə edir. Əvvəl onu alt səhifələrdən silin.',
        'parent_not_in_locale' => 'Ana səhifənin :locale versiyası yoxdur. Əvvəl onu ana səhifəyə əlavə edin.',
        'unsupported_locale' => ':locale dili dəstəklənmir.',
        'has_children' => 'Əvvəl alt səhifələri köçürün və ya silin.',
        'invalid_slug' => 'Kiçik hərflər, rəqəmlər və tək defislər istifadə edin. Yolu icazə verilən dərinlikdə saxlayın.',
        'reserved_path' => ':path yolu sistem tərəfindən qorunur.',
        'path_taken' => ':path yolu artıq başqa səhifə tərəfindən istifadə olunur.',
    ],
    'messages' => [
        'created' => 'Səhifə yaradıldı.',
        'updated' => 'Səhifə yeniləndi.',
        'deleted' => 'Səhifə silindi.',
        'published' => 'Səhifə dərc edildi.',
        'unpublished' => 'Səhifənin dərci ləğv edildi.',
        'homepage_assigned' => 'Ana səhifə yeniləndi.',
    ],
];
