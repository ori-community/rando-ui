#!/usr/bin/env bash

set -e

# Extract
rm -rf /tmp/dxvk-async
mkdir -p /tmp/dxvk-async
tar -xzvf /tmp/dxvk-async.tar.gz -C /tmp/dxvk-async

cd /tmp/dxvk-async/dxvk-async-2.0

# Install
chmod u+x ./setup_dxvk.sh
./setup_dxvk.sh install

# Cleanup
rm -rf /tmp/dxvk-async /tmp/dxvk-async.tar.gz
