---
title: Upgrade Portainer (Docker)
---

# Upgrade Portainer on Docker (Ubuntu server)

Run these steps on the Docker host (`iZbp1dk91xvww31onjvz7fZ`, Ubuntu, Docker **28.1.1**). Portainer was installed with `docker run` (no Compose project on disk).

> **Before you start:** Use SSH as `root` or a user in the `docker` group. Upgrading replaces the **container**, not the `portainer_data` volume.

## Current install (reference)


| Item           | Value                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Container name | `portainer`                                                                                                 |
| Image          | `portainer/portainer-ce:latest`                                                                             |
| UI             | Host port **9000** → container `9000`                                                                       |
| Edge / tunnel  | Host port **18000** → container `8000`                                                                      |
| HTTPS (`9443`) | Exposed on image only; **not** published on the host                                                        |
| Data           | Named volume `portainer_data` → `/data`                                                                     |
| Docker API     | `/var/run/docker.sock` bind mount                                                                           |
| Restart policy | `always`                                                                                                    |
| Public URL     | [https://portainer.service.swiftcore.com](https://portainer.service.swiftcore.com) (via your reverse proxy) |


Quick sanity check anytime:

```bash
docker ps --filter name=portainer --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
```



## 1. Optional: backup `portainer_data`

```bash
mkdir -p ~/backups
docker run --rm \
  -v portainer_data:/data \
  -v "$HOME/backups":/backup \
  alpine tar czf /backup/portainer-data-$(date +%Y%m%d).tar.gz -C /data .
```



## 2. Optional: note the image you are on now

Useful for rollback if `latest` moves:

```bash
docker inspect portainer --format '{{.Config.Image}} {{.Image}}'
```



## 3. Pull and recreate the container

Pull a new image (or pin a tag, e.g. `portainer/portainer-ce:2.27.0`, instead of `latest`):

```bash
docker pull portainer/portainer-ce:latest
```

Stop and remove **only** the container. **Do not** remove `portainer_data`.

```bash
docker stop portainer
docker rm portainer
```

Recreate with the **same** ports, mounts, restart policy, and `--trusted-origins` as the current install:

```bash
docker run -d \
  --name portainer \
  --restart=always \
  -p 9000:9000 \
  -p 18000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

## 4. Verify

On the server:

```bash
docker ps --filter name=portainer
docker logs portainer --tail 50
```

In the browser:

1. Open [https://portainer.service.swiftcore.com](https://portainer.service.swiftcore.com) (or `http://<server-ip>:9000` if you test directly).
2. **Settings → About** — confirm the version changed as expected.
3. Confirm environments, stacks, and edge settings still look correct.



## 5. Roll back

If the new build misbehaves, run `docker stop portainer && docker rm portainer`, then start again with the **previous image ID or tag** from step 2:

```bash
docker run -d \
  --name portainer \
  --restart=always \
  -p 9000:9000 \
  -p 18000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:<previous-tag-or-use-image-id> \
  --trusted-origins portainer.service.swiftcore.com
```

To restore from a tarball backup, stop Portainer first, then extract into the volume (overwrites `/data`).

## References

- [Portainer — updating Portainer](https://docs.portainer.io/start/upgrade)
- [Portainer CE on Docker](https://docs.portainer.io/start/install/server/docker)

