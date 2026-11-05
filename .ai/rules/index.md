# Project Rules Index

Before planning or editing, find every row whose globs match the file's path and read that rule file. Also run `grep -rin 'keyword' .ai/rules` for the area you touch.

| Applies to | Rule file |
| --- | --- |
| **/*.php | .ai/rules/php.md |
| app/** | .ai/rules/app.md |
| app/Modules/** | .ai/rules/modules.md |
| app/Modules/Auth/**, app/Models/User.php, config/permission.php, database/seeders/** | .ai/rules/auth.md |
| app/Modules/*/Models/**, app/Models/** | .ai/rules/models.md |
| app/Modules/*/Database/Migrations/**, database/migrations/** | .ai/rules/migrations.md |
| app/Modules/Translation/**, lang/** | .ai/rules/translations.md |
| app/Modules/*/Requests/**, app/Modules/*/Resources/** | .ai/rules/requests.md |
| routes/**, app/Modules/*/routes/**, app/Modules/*/Controllers/** | .ai/rules/routes.md |
| routes/**, app/Modules/*/Controllers/**, resources/js/routes/**, resources/js/actions/** | .ai/rules/wayfinder.md |
| resources/js/** | .ai/rules/js.md |
| tests/** | .ai/rules/tests.md |
| composer.json, composer.lock, package.json, package-lock.json | .ai/rules/dependencies.md |
| ** | .ai/rules/general.md |
