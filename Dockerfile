# syntax=docker/dockerfile:1

# El binario quetzal-ubuntu exige GLIBC_2.39 → Ubuntu 24.04 (noble)

# --- Descargar binario (no queda en la imagen final) ---
FROM ubuntu:24.04 AS binario

ARG QUETZAL_VERSION=v0.0.2
ARG QUETZAL_URL=https://github.com/AntaresGT/lenguaje-quetzal/releases/download/${QUETZAL_VERSION}/quetzal-ubuntu

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL -o /usr/local/bin/quetzal "${QUETZAL_URL}" \
    && chmod +x /usr/local/bin/quetzal \
    && rm -rf /var/lib/apt/lists/*

# --- Runtime (mismas libs que el build de la release) ---
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

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
