#!/bin/bash

# Compress the bundles
gzip -f -k dist/*.min.*js
gzip -f -k examples/dist/*.*js

echo "Bundle sizes (bytes):"
wc -c dist/*.min.*js* examples/dist/*.*js* | grep -v \.map

# Note: .gz files are kept for size verification
