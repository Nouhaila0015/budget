#!/bin/sh
# Arrête le budget lancé par start.sh.
cd "$(dirname "$0")"
if [ -f budget.pid ] && kill "$(cat budget.pid)" 2>/dev/null; then
  echo "Budget arrêté"
else
  echo "Budget n'était pas lancé"
fi
rm -f budget.pid
