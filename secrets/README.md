# Build secrets

`github_token.txt` holds a read-only GitHub token. Docker Compose reads it at build
time to install `@ahmcho/tailadmin-react` from the private repository.

Create the file on each machine. Do not commit it:

1. Create a fine-grained token at GitHub → Settings → Developer settings →
   Personal access tokens. Limit it to the `ahmcho/TailAdminFullReact` repository.
   Grant **Contents: Read-only**. Set an expiry date.
2. Save the token as a single line in `secrets/github_token.txt`.
3. Rebuild: `docker compose build tagler-cms-app`.

When the token expires, replace the file and rebuild.

The `node_modules` volume keeps old contents. After a dependency change, remove the
volume (`docker volume rm tagler-cms_node_modules`) before you start the stack again.
