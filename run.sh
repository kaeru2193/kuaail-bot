#!/bin/sh
npm run build

abspath=`pwd`

mkdir -p "${abspath}/assets/fonts"
mkdir -p "${abspath}/assets/data"
wget https://kaeru2193.github.io/Phun-Resources/font/Phun-Sans/Phun-Sans-Rounded-Regular.ttf -O "${abspath}/assets/fonts/PhunSans.ttf"
wget https://kaeru2193.github.io/Phun-Resources/font/PhunDot-latest.ttf -O "${abspath}/assets/fonts/PhunDot.ttf"
wget https://epikijetesantakalu.github.io/phun-tuo/Phun_Tuo.ttf -O "${abspath}/assets/fonts/TuoFaQo.ttf"
wget https://kaeru2193.github.io/Phun-Resources/dict/phun-dict.json -O "${abspath}/assets/data/phun-dict.json"
wget https://amachamusic.chagasi.com/mp3/nichinichikorekoujitsu.mp3 -O "${abspath}/assets/sounds/sample.mp3"

forever start -l "${abspath}/logs/forever.log" -a build/main.js