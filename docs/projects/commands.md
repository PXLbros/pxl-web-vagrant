---
title: Commands
---

# Commands

## `create_project`

::: tip HINT
The `create_project` command will automatically generate [`.pxl-vagrant/config.yaml`](/projects/configuration.html#config-yaml) file from user input.
:::

### Interactive

...

### Noninteractive

#### New

```shell
create_project \
    --dir=my-project/ \
    --php=7.3 \
    --db-name=my_project \
    --db-driver=mysql
```

#### Existing

```shell
create_project \
    --git-repo=git@github.com:x/x.git
    --dir=my-project/
```

## `delete_project`

### Interactive

...

### Noninteractive

#### Options

* `--dir` (Project directory)
* `--delete-files` (Delete project files)
* `--delete-db` (Delete database)

```shell
delete_project \
    --dir=my-project/ \
    --delete-files \
    --delete-db
```
