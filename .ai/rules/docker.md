---
paths:
  - 'docker/**'
  - 'docker-compose.yml'
---

# Docker

## `artisan serve` needs `--no-reload` when PHP_CLI_SERVER_WORKERS is set

`docker/entrypoint.sh` starts the app with `php artisan serve --host=0.0.0.0 --port=...`. When `PHP_CLI_SERVER_WORKERS` is set (it is commented out in `.env.example`), `artisan serve` ignores it unless the command also has `--no-reload`. Without the flag, requests are served one at a time and queue behind each other.

Before you set `PHP_CLI_SERVER_WORKERS`, add `--no-reload` to that `serve` line.

Trade-off: `.env` edits no longer restart the server. Run `docker restart tagler-cms-app` after you change `.env`.
