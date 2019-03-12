---
title: Configuration
---

# Configuration

Customize your **PXL Web Vagrant** environment by copying `config.default.yaml` to `config.yaml` and modify.

```shell
cp config.default.yaml config.yaml
```

## config.yaml

<<< @/config.default.yaml

## Options

### debug

Debug mode.

**Default:** `false`

### timezone

Vagrant timezone. See [available timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

**Default:** `UTC`

### language-iso

Vagrant language ISO code. See [available country codes](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes)

**Default:** `en_US`

### vm

#### name

Name of Vagrant environment.

**Default:** `pxl-web-vagrant`

#### memory

Amount of memory usage.

**Default:** `1024`

#### cpus

Number of CPU:s used.

**Default:** `1`

#### provision

##### show-command

Show executed commands during provision.

**Default:** `true`

##### show-command-execution-time

Show command execution times during provision.

**Default:** `true`

### network

#### ip

The Vagrant environment IP address.

**Default:** `192.168.1.99`

### web-servers

#### apache

##### enabled

Enable Apache.

**Default:** `true`

##### port

Apache port.

**Default:** `7001`

#### nginx

##### enabled

Enable NGINX.

**Default:** `true`

##### port

NGINX port.

**Default:**
`7002`

### code

#### php

##### versions

Specify which PHP versions to install.

**Default:**
```
- 7.3
- 7.2
- 7.1
- 7.0
- 5.6
```

##### modules

Specify which extra PHP modules to install.

**Example:**
```
- gzip
```

#### cache

##### memcached

###### enabled

Enable Memcached.

**Default:** `true`

##### apc

###### enabled

Enable APC.

**Default:** `true`

### databases

#### mysql

##### enabled

Enable MySQL.

**Default:** `true`

### cache

#### redis

##### enabled

Enable Redis.

**Default:** `true`

### shell

#### tmux

##### enabled

Enable tmux.

**Default:** `true`

##### version

Specify tmux version.

**Default:** `2.8`

##### tmuxinator

###### enabled

Enable [tmuxinator](https://github.com/tmuxinator/tmuxinator).

**Default:** `true`

##### gpakosz

###### enabled

Enable [gpakosz](https://github.com/gpakosz/.tmux).

**Default:** `true`

#### liquidprompt

##### enabled

Enable [Liquid Prompt](https://github.com/nojhan/liquidprompt).

**Default:** `true`
