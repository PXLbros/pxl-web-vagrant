---
title: Projects Configuration
---

# Projects Configuration

### .pxl-vagrant

#### config.yaml

```yaml
web-server: 'apache'
code:
    php:
        version: 7.3
        modules:
            - gzip
database:
    driver: mysql
    name: my_project
workspace:
    - tab1:
        title: 'Tab 1'
    - tab2:
        title: 'Tab 2'
```
