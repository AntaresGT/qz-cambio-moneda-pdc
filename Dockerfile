# syntax=docker/dockerfile:1

# --- Descargar binario (no queda en la imagen final) ---
FROM debian:bookworm-slim AS binario

ARG QUETZAL_VERSION=v0.0.2
ARG QUETZAL_URL=https://github.com/AntaresGT/lenguaje-quetzal/releases/download/${QUETZAL_VERSION}/quetzal-ubuntu

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL -o /usr/local/bin/quetzal "${QUETZAL_URL}" \
    && chmod +x /usr/local/bin/quetzal \
    && rm -rf /var/lib/apt/lists/*

# --- Runtime mínimo (glibc + CA para HTTPS a Banguat) ---
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 --shell /usr/sbin/nologin quetzal

COPY --from=binario /usr/local/bin/quetzal /usr/local/bin/quetzal

WORKDIR /app
COPY --chown=quetzal:quetzal . .

USER quetzal

EXPOSE 3000

CMD ["quetzal", "ejecutar"]
