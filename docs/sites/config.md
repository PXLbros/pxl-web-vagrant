---
title: .pxl
---

# .pxl

## config.yaml

```yaml
site-dir: /vagrant/projects/test.loc
public-dir: public
code:
    php: 7.3
database:
    driver: mysql
    name: test
```

## install.js

```js
const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Commands here...
    }
}
```
