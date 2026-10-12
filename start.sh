#!/bin/sh
# Lance le budget en arrière-plan sur http://localhost:4100 (le BFF sert aussi le front buildé).
cd "$(dirname "$0")"
if [ -f budget.pid ] && kill -0 "$(cat budget.pid)" 2>/dev/null; then
  echo "Budget déjà lancé sur http://localhost:4100"
  exit 0
fi
[ -f back/dist/server.js ] && [ -f front/dist/index.html ] || ./build.sh
nohup node back/dist/server.js > budget.log 2>&1 &
echo $! > budget.pid
echo "Budget lancé sur http://localhost:4100"
