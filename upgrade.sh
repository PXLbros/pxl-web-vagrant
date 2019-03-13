#!/bin/bash

echo "Check if new version..."
# ...

echo "New version found, download..."
git pull

echo "Do you want to install? (vagrant up --provision)"
vagrant up --provision
