---
title: Apache
---

# Apache

## Configuration

### Enable

<<< @/docs/web-servers/apache/enable.yaml{3}

### Disable

<<< @/docs/web-servers/apache/disable.yaml{3}

## Commands

### `start_apache`

### `restart_apache`

### `stop_apache`

### `reload_apache`

### `apache_status`

### `edit_apache_conf`

### `edit_apache_site_conf`

### `delete_apache_site_conf`

<!-- #### Interactive

#### Noninteractive

##### Options

* `--hostname` (Server hostname, .e.g `--hostname=test.loc`)
* `--public-dir` (Site public directory, .e.g. `--public-dir=/vagrant/projects/test.loc/public`)
* `--php` (Enable PHP, .e.g `--php=7.3`)

```shell
create_apache_site \
    --hostname=test.loc \
    --public-dir=/vagrant/projects/test.loc/public \
    --php=7.3
    --overwrite
``` -->
