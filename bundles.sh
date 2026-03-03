#!/bin/bash
pnpm build:javascript && pnpm build:examples && ./calculate-bundle-sizes.sh
