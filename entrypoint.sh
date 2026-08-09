#!/bin/sh
set -eu

# Quetzal 0.0.2 solo enlaza a 127.0.0.1; Dokploy/Traefik necesita 0.0.0.0.
# Puente: 0.0.0.0:3000 → 127.0.0.1:5000

quetzal ejecutar &
QUETZAL_PID=$!

limpiar() {
  kill "$QUETZAL_PID" 2>/dev/null || true
  wait "$QUETZAL_PID" 2>/dev/null || true
}
trap limpiar EXIT INT TERM

i=0
while [ "$i" -lt 50 ]; do
  if socat -u OPEN:/dev/null TCP:127.0.0.1:5000,connect-timeout=1 2>/dev/null; then
    break
  fi
  if ! kill -0 "$QUETZAL_PID" 2>/dev/null; then
    echo "quetzal terminó antes de abrir el puerto 5000" >&2
    exit 1
  fi
  i=$((i + 1))
  sleep 0.1
done

exec socat TCP-LISTEN:3000,fork,reuseaddr,bind=0.0.0.0 TCP:127.0.0.1:5000
