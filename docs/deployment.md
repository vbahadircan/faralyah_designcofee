# Deployment

How the Faralyah Design / Coffee app is hosted, how the server was set up, and how to deploy it.
No secrets belong in this file.

## Overview

| Item | Value |
| --- | --- |
| Domain | `faralyahdesigncoffee.com` (registered at Cloudflare; `www` redirects to the apex) |
| DNS | Cloudflare, records set to **DNS only** (grey cloud) so Caddy can obtain certificates |
| Server | One Ubuntu 24.04 VPS (Turkish provider), 2 GB RAM, 2 GB swap, 30 GB disk |
| Runtime | Docker Engine + Docker Compose, stack defined in `deploy/` |
| App path on server | `/opt/faralyah` (a clone of the GitHub repo, branch `main`) |
| Admin user on server | `devops` (sudo, SSH key login only) |

The old, misspelled domain `faralyahdesigncofee.com` was bought by mistake and is **not** used. Its auto-renew should stay off.

## Architecture

```
Internet ── :80 / :443 ──> [caddy]  ── reverse proxy ──> [app: Express + built client] ──> [mongo]
                              │                                 │
                              └── serves /uploads (read-only) ──┴── uploads volume
```

Compose file: `deploy/docker-compose.yml`. Three services:

- **caddy** (`caddy:2`) is the only container that publishes ports (80, 443). It gets and renews Let's Encrypt certificates automatically, compresses responses, and serves `/uploads/*` straight from the shared volume. `www` redirects to the apex.
- **app** is built from `deploy/Dockerfile` (two-stage, `node:22-bookworm-slim`, runs as the unprivileged `node` user). Express serves the API and the built client on port 3000, reachable only inside the Compose network.
- **mongo** (`mongo:8`) has authentication on and **no published port**. On first start `deploy/mongo-init.js` creates a `readWrite`-only user for the app. The `root` user is only for admin and backup work.

Named volumes (these hold all state, and survive rebuilds):

| Volume | Contents |
| --- | --- |
| `mongo_data` | The database |
| `uploads` | Campaign photos uploaded in the admin panel |
| `caddy_data` | TLS certificates and ACME account (losing it forces re-issuing; Let's Encrypt rate limits apply) |
| `caddy_config` | Caddy runtime config |

**Never run `docker compose down -v` on the server.** `-v` deletes the volumes, and with them the database and uploads.

## Server setup (what was done, in order)

1. **Baseline.** Logged in as a non-root `devops` user with an SSH public key. Checked OS (Ubuntu 24.04), RAM and disk.
2. **System updates.** `apt update && apt full-upgrade`.
3. **SSH hardening.** `/etc/ssh/sshd_config.d/99-hardening.conf` sets `PermitRootLogin no`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no`. Verified with `sudo sshd -T`. Always test a new SSH session before closing the working one.
4. **Firewall (UFW).** Default deny incoming; allow OpenSSH, 80/tcp, 443/tcp only.
5. **fail2ban** (SSH jail) and **unattended-upgrades** for automatic security updates.
6. **DNS.** In Cloudflare: `A @ -> <server IP>` and `CNAME www -> faralyahdesigncoffee.com`, both DNS only.
7. **Docker Engine** installed from Docker's official apt repository (not Ubuntu's `docker.io`), with the Compose plugin. `devops` is in the `docker` group, which is effectively root access, so no other user should join it.
8. **Docker log limits.** `/etc/docker/daemon.json` uses the `local` log driver with `max-size 10m`, `max-file 3`, so container logs cannot fill the disk.
9. **Repo access.** A read-only GitHub **deploy key** (`~/.ssh/faralyah_deploy`, used through `~/.ssh/config` for `github.com`) lets the server clone and pull the private repo. It cannot push.
10. **First start.** Cloned to `/opt/faralyah`, created `deploy/.env` (see below), then `docker compose up -d --build` from `deploy/`.

### Security notes

- **Docker bypasses UFW for published ports.** Only Caddy has a `ports:` entry. Do not add one to `app` or `mongo`. Check what listens with `sudo ss -tlnp`; only 80 and 443 (and SSH on 22) should appear.
- Secrets live only in `deploy/.env` on the server (`chmod 600`, gitignored). Keep a copy in a password manager. Do not paste it into chats or commit it.
- The private SSH key on the admin's PC is the only way into the server (besides the provider's web console). Keep a safe offline backup of it.

## Configuration: `deploy/.env`

Create it from the template, with generated secrets:

```bash
cd /opt/faralyah/deploy
cp .env.example .env
chmod 600 .env
sed -i "s/^MONGO_ROOT_PASSWORD=.*/MONGO_ROOT_PASSWORD=$(openssl rand -hex 32)/" .env
sed -i "s/^MONGO_APP_PASSWORD=.*/MONGO_APP_PASSWORD=$(openssl rand -hex 32)/" .env
sed -i "s/^SESSION_SECRET=.*/SESSION_SECRET=$(openssl rand -hex 32)/" .env
```

| Variable | Purpose |
| --- | --- |
| `DOMAIN` | Public domain; used by the Caddyfile |
| `MONGO_ROOT_PASSWORD` | MongoDB root user (set on first start only) |
| `MONGO_APP_PASSWORD` | Password of the app's limited database user |
| `SESSION_SECRET` | Signs admin session cookies (the server refuses to start in production with fewer than 32 characters) |

The Mongo passwords are only applied when the `mongo_data` volume is first created. Changing them later in `.env` does not change the existing database users.

## First-time data setup (run once)

The data lives in the `mongo_data` volume, so these are **not** part of normal deploys:

```bash
cd /opt/faralyah/deploy
docker compose exec app npm run admin:create -- <email>   # creates the admin, asks for a password
docker compose exec app npm run content:init              # starting categories + campaigns, only into empty collections
```

Run `admin:create` again only to reset the admin password. The real menu items and prices are entered by the owner in the admin panel. Do **not** run `npm run seed` in production (it loads invented sample data).

## Deploying a new version

1. Merge your change to `main` on GitHub (CI must be green).
2. On the server:

```bash
/opt/faralyah/deploy/deploy.sh
```

`deploy/deploy.sh` does the following:

1. Takes a lock so two deploys cannot overlap.
2. Fetches and fast-forwards `main` (`git merge --ff-only`; it refuses if the server's checkout has diverged).
3. Validates the Compose file, rebuilds the app image with `--pull`, and runs `docker compose up -d`.
4. Polls the app for up to about 60 seconds; on success prunes old images, on failure prints the logs command and a rollback command.

Expect a few seconds of downtime while the app container restarts.

### Rolling back

If a deploy fails, the script prints the previous commit. To go back:

```bash
git -C /opt/faralyah reset --hard <previous-commit>
/opt/faralyah/deploy/deploy.sh
```

Note that `deploy.sh` does a fast-forward merge of `origin/main`. If you reset to an older commit and `main` is ahead, fix the problem on `main` (for example `git revert`) and deploy again rather than leaving the server behind `main`.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull request:

`npm ci` -> `npm run lint` -> `npm run typecheck` -> `npm test` -> `npm run build`

- Node 22, npm cache enabled, 15-minute timeout, read-only token.
- A newer push to the same branch cancels the older run.
- Server tests use `mongodb-memory-server`, which downloads a MongoDB binary on its first run.
- Recommended: in GitHub, Settings -> Branches, protect `main` and require the `check` job (may require a paid plan for private repos).

**Not set up yet:** automatic deploy from CI. The plan is a second workflow that runs after CI succeeds on `main`, connects with a dedicated SSH key restricted in `authorized_keys` to run only `deploy.sh` (`command="...",no-port-forwarding,no-agent-forwarding,no-pty`), uses a GitHub Environment `production`, and a `concurrency` group. Do this after backups work.

## Operations cheat sheet

Run from `/opt/faralyah/deploy`:

```bash
docker compose ps                      # service status and health
docker compose logs --tail 50 app      # app logs (also: caddy, mongo)
docker compose logs -f caddy           # follow Caddy / certificate activity
docker compose restart app             # restart one service
docker stats --no-stream               # memory / CPU per container
docker system df                       # disk used by images and volumes
sudo ss -tlnp                          # what listens on the host (expect 22, 80, 443)
sudo ufw status verbose                # firewall
sudo fail2ban-client status sshd       # SSH ban status
df -h /; free -h                       # disk and memory
```

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| `Permission denied (publickey)` | The SSH client is not offering the right key (check `ssh -v`; in MobaXterm, set the private key in the session's Advanced SSH settings). Password login is deliberately disabled. |
| Certificate errors in Caddy logs | The name has no DNS record pointing at the server, or Cloudflare proxy (orange cloud) is on. Records must be DNS only. |
| Build killed (exit 137) | Out of memory during the Vite build. Swap is 2 GB; check `free -h`, stop other containers during the build, or build elsewhere and push an image. |
| `Cannot find module .../server/src/...` from `admin:create` | Runtime image missing the source the seed scripts import; the Dockerfile copies `server/src` for this reason. |
| App exits at start in production | `SESSION_SECRET` missing or shorter than 32 characters. |
| Disk filling up | `docker system df`, then `docker image prune -f` (deploy does this) and check `uploads` growth. |

## Still to do

- **Backups (highest priority).** Nightly `mongodump` plus a copy of the `uploads` volume, shipped off the server, and a tested restore. Until this exists, a lost server means lost data.
- Automatic deploy from GitHub Actions (see above).
- Uptime monitoring (an external check on the public URL).
- Decide whether to enable the Cloudflare proxy (orange cloud) later; it needs extra TLS and real-IP configuration.
