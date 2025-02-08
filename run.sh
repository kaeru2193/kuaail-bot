#!/bin/sh
npm run build
abspath=`pwd`
forever start -l "${abspath}/logs/forever.log" -a build/main.js