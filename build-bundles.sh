rollup -c
LIBRARY=core rollup -c
gzip -f -k dist/seidr.full.js dist/seidr.core.js
echo 'Bundle sizes:'
ls -lh dist/seidr.*.js.gz | awk '{print $5, $9}'
rm -rf dist/*.js.gz
