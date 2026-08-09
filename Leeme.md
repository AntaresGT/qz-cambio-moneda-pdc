# Cambio API · qz-cambio-moneda-pdc

<p align="center">
  <img src="publico/recursos/logo_lenguaje_quetzal.png" alt="Logo Lenguaje Quetzal" width="200">
</p>

Prueba de concepto para consultar el **tipo de cambio oficial USD → GTQ** (fuente: Banguat) y demostrar capacidades de [Lenguaje Quetzal](https://lenguaje-quetzal.com): servidor HTTP, rutas, controladores, JSON, cliente asíncrono y archivos estáticos.

- Demo: http://tipo-cambio.lenguaje-quetzal.com/
- Repositorio: https://github.com/AntaresGT/qz-cambio-moneda-pdc

> Documentación completa (ejemplos curl, respuestas JSON y estructura): ver [README.md](README.md).

## Ejecutar

```bash
quetzal ejecutar
```

Servidor en [http://localhost:3000](http://localhost:3000).

## Endpoint rápido

| Método | Ruta | Uso |
|--------|------|-----|
| `GET` | `/api/tipo-cambio` | Tipo de cambio del día |
| `POST` | `/api/tipo-cambio` | Conversión con `{ "valor_dolares": 100 }` |
| `QUERY` | `/api/tipo-cambio` | Igual que POST (método experimental) |

## Recursos visuales

Ubicación: `publico/recursos/`

| | Archivo |
|---|---------|
| <img src="publico/recursos/ico_lenguaje_quetzal.png" alt="Icono" width="32" height="32"> | `ico_lenguaje_quetzal.png` — favicon / icono |
| <img src="publico/recursos/logo_lenguaje_quetzal.png" alt="Logo" width="80"> | `logo_lenguaje_quetzal.png` — logo del lenguaje |
| <img src="publico/recursos/icono_archivos_qz.png" alt="Archivos qz" width="32" height="32"> | `icono_archivos_qz.png` — icono de archivos `.qz` |
