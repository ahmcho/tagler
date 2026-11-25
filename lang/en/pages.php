<?php

return [
    'public' => [
        'not_found_title' => 'Page not found',
    ],

    'errors' => [
        'homepage_requires_live_page' => 'Only a live page can be the homepage. Publish the page first.',
        'publish_in_past' => 'Scheduled pages need a publish date and time in the future.',
        'invalid_publish_range' => 'The publish date range is not valid.',
        'parent_is_descendant' => 'A page cannot be placed under itself or one of its children.',
        'locale_needs_title_and_slug' => 'The :locale version needs a title and a slug, or it must be left empty.',
        'locale_used_by_children' => 'Child pages still use the :locale version. Remove it from the child pages first.',
        'parent_not_in_locale' => 'The parent page has no :locale version. Add it to the parent first.',
        'unsupported_locale' => 'The locale :locale is not supported.',
        'has_children' => 'Move or delete the child pages first.',
        'invalid_slug' => 'Use lowercase letters, numbers and single hyphens. Keep the path within the allowed depth.',
        'reserved_path' => 'The path :path is reserved by the system.',
        'path_taken' => 'The path :path is already used by another page.',
    ],
    'messages' => [
        'created' => 'Page created.',
        'updated' => 'Page updated.',
        'deleted' => 'Page deleted.',
        'published' => 'Page published.',
        'unpublished' => 'Page unpublished.',
        'homepage_assigned' => 'Homepage updated.',
    ],
];
