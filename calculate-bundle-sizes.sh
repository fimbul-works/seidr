#!/bin/bash

# Compress the bundles (already minified by Rollup)
gzip -f -k dist/browser/*.*js
gzip -f -k examples/dist/*.*js

echo "Bundle sizes (bytes):"
wc -c dist/browser/*.*js* | grep -v \.map
wc -c examples/dist/*.*js* | grep -v \.map

# Note: .gz files are kept for size verification but excluded from npm via .npmignore
