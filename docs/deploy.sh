#!/usr/bin/env sh

set -e

npm run docs:build

cd docs/.vuepress/dist

git init
git add -A
git commit -m 'Deploy documentation'

git push -f git@github.com:PXLbros/pxl-web-vagrant.git master:gh-pages

cd -
