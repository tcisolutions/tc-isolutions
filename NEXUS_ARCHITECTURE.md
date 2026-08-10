# NEXUS ERP

Versión: 2.0

Autor: Bryant León

---

# Visión

NEXUS es una plataforma ERP desarrollada para centros de servicio técnico.

Su objetivo es ofrecer un sistema moderno, modular, escalable y reutilizable para administrar:

- Órdenes de servicio
- Clientes
- Inventario
- Caja
- Pagos
- Garantías
- Portal del cliente
- Dashboard
- Reportes

La arquitectura está diseñada para permitir el crecimiento del sistema sin aumentar el acoplamiento entre módulos.

---

# Principios

Todo el proyecto sigue los siguientes principios:

## 1. Una responsabilidad por archivo.

Cada archivo debe encargarse únicamente de una tarea.

Ejemplos:

- Gallery.js únicamente renderiza galerías.
- Timeline.js únicamente renderiza timelines.
- order.service.js únicamente consulta órdenes.

---

## 2. Los componentes nunca consultan Supabase.

Los componentes solamente muestran información.

No realizan consultas.

---

## 3. Los Services nunca generan HTML.

Los Services obtienen datos.

Nunca crean interfaces.

---

## 4. Las Pages ensamblan componentes.

Una página únicamente une componentes.

No contiene lógica de negocio.

---

## 5. Toda consulta pasa por Services.

Está prohibido consultar Supabase directamente desde un componente.

---

## 6. Todo cambio importante genera un evento.

Ejemplos:

order.created

order.updated

payment.created

inventory.updated

---

# Arquitectura

Supabase

↓

Services

↓

Registry

↓

Pages

↓

Components

↓

Browser

---

# Carpetas

/core

Contiene el núcleo del framework.

Application

Registry

Logger

EventBus

---

/services

Acceso a datos.

Supabase

Storage

API

---

/components

Componentes reutilizables.

Card

Gallery

Timeline

Button

Badge

StatusChip

Modal

---

/pages

Páginas completas.

Dashboard

Portal Cliente

Inventario

Clientes

Caja

---

/constants

Constantes globales.

Estados

Colores

Buckets

Rutas

---

/config

Configuración general.

Tema

Aplicación

Storage

Rutas

---

# Convenciones

Componentes

PascalCase

Gallery.js

Timeline.js

Card.js

---

Services

camelCase

order.service.js

photo.service.js

---

Constantes

MAYÚSCULAS

PHOTO_STAGE

ORDER_STATUS

PAYMENT_STATUS

---

# Objetivo

Crear un ERP modular que permita agregar nuevos módulos sin modificar los existentes.