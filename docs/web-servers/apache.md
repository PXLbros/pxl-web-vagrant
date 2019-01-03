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

### `apache_sites`

### `create_apache_site`

#### Interactive

![](/pxl-web-vagrant/assets/gifs/create_apache_site.gif)

#### Noninteractive

##### Options

* `--hostname` (Server hostname, .e.g `--hostname=test.loc`)
* `--public-dir` (Site public directory, .e.g. `--public-dir=/vagrant/projects/test.loc/public`)
* `--php` (Enable PHP, .e.g `--php=7.3`)
* `--overwrite` (Overwrite existing configuration)

```shell
create_apache_site \
    --hostname=test.loc \
    --public-dir=/vagrant/projects/test.loc/public \
    --php=7.3
```

### `edit_apache_site`

### `delete_apache_site`

#### Interactive

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
```

### `delete_apache_site`

#### Interactive

#### Noninteractive

Yet to be implemented.

##### Options

* `--hostname` (Server hostname, .e.g `--hostname=test.loc`)
* `--public-dir` (Site public directory, .e.g. `--public-dir=/vagrant/projects/test.loc/public`)
* `--php` (Enable PHP, .e.g `--php=7.3`)

```shell
create_apache_site \
    --hostname=test.loc \
    --public-dir=/vagrant/projects/test.loc/public \
    --php=7.3
```

### `edit_apache_site`
