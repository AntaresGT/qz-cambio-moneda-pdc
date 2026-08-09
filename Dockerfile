# syntax=docker/dockerfile:1

# quetzal-ubuntu (release v0.0.2) requiere GLIBC_2.39 → Ubuntu 24.04
# El asset se re-publicó con bind 0.0.0.0; el digest fuerza a no reutilizar cache vieja.

ARG QUETZAL_VERSION=v0.0.2
# Digest actual del asset (https://github.com/AntaresGT/lenguaje-quetzal/releases/tag/v0.0.2)
ARG QUETZAL_SHA256=871ecc10ed5777f519267c69c8b62afac63769233faffe85a1726b443aeb6426

FROM ubuntu:24.04 AS binario

ARG QUETZAL_VERSION
ARG QUETZAL_SHA256
ARG QUETZAL_URL=https://github.com/AntaresGT/lenguaje-quetzal/releases/download/${QUETZAL_VERSION}/quetzal-ubuntu

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL -o /usr/local/bin/quetzal "${QUETZAL_URL}" \
    && echo "${QUETZAL_SHA256}  /usr/local/bin/quetzal" | sha256sum -c - \
    && chmod +x /usr/local/bin/quetzal \
    && rm -rf /var/lib/apt/lists/*

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

# Debe coincidir con Container Port en Dokploy
EXPOSE 5000

CMD ["quetzal", "ejecutar"]
