#!/bin/bash

echo "Check if new version..."
# ...

echo "New version found, download..."
git pull

echo "Do you want to install? (vagrant provision)"
vagrant provision
