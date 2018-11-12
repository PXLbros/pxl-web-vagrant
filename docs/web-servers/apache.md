---
title: Apache
---

# Apache

## Enable

<<< @/docs/web-servers/apache/enable.yaml{3}

## Disable

<<< @/docs/web-servers/apache/disable.yaml{3}

## Commands

### `start_apache`

### `restart_apache`

### `stop_apache`

### `reload_apache`

### `edit_apache_conf`

### `apache_sites`

### `create_apache_vhost`

#### Interactive

#### Noninteractive

##### Options

* `--hostname` (Server hostname, .e.g `--hostname=my-site.loc`)
* `--public-dir` (Site public directory, .e.g. `--public-dir=/vagrant/sites/my-site.loc/public`)
* `--php` (Enable PHP, .e.g `--php=7.3`)

```shell
create_apache_vhost \
    --hostname=my-site.loc \
    --public-dir=/vagrant/sites/my-site.loc/public \
    --php=7.3
```

### `delete_apache_vhost`

#### Interactive

#### Noninteractive

Yet to be implemented.

##### Options

* `--hostname` (Server hostname, .e.g `--hostname=my-site.loc`)
* `--public-dir` (Site public directory, .e.g. `--public-dir=/vagrant/sites/my-site.loc/public`)
* `--php` (Enable PHP, .e.g `--php=7.3`)

```shell
create_apache_vhost \
    --hostname=my-site.loc \
    --public-dir=/vagrant/sites/my-site.loc/public \
    --php=7.3
```

### `edit_apache_vhost_conf`
