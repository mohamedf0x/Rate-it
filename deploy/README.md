# Deploying rate-it alongside existing apps on the CPX22 box

This box is memory-constrained (4GB, has previously kernel-panicked under RAM
pressure) and already runs aggarha, fops-dashboard, and vulpesarena. Rules of thumb
for this app specifically:

- **Port 3200** — 3000/3100/4000 are taken by the existing apps.
- **pm2, single fork instance, `max_memory_restart: 300M`** (`ecosystem.config.js`)
  — pm2 kills and restarts the process itself if it creeps past that, instead of
  the kernel OOM-killer picking a victim.
- **Never run `npm run build` for this app at the same time as a build/dev process
  for another app on the box.** Builds are the spiky part (webpack, TS compiler);
  serving the built app afterward via `next start` is comparatively light.
- **Separate nginx server block** (`nginx-rate-it.conf`) — new file, own
  `sites-available`/`sites-enabled` entry, does not edit any existing block.
- **Separate TLS cert** via `certbot --nginx -d rate.aggarha.com` — does not touch
  certs already issued for other subdomains.

## Suggested subdomain

`rate.aggarha.com` — short, reads naturally ("rate it"), and doesn't collide with
`ratings.aggarha.com` if that's ever needed for something else later. Confirm before
DNS/nginx go live.

## First deploy checklist

1. `git clone` this repo on the server, `npm ci`, `npm run db:generate`.
2. Provision a Postgres database/user for rate-it (separate from Aggarha's DB).
3. `npx prisma migrate deploy && npm run db:seed`.
4. `npm run build`.
5. `pm2 start deploy/ecosystem.config.js`.
6. Drop in `nginx-rate-it.conf`, `nginx -t`, reload, then `certbot --nginx -d rate.aggarha.com`.
