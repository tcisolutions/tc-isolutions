# TC iSolutions V7.7 — Evidencia fotográfica

## Qué agrega
- Fotos de recepción en **Nueva orden**.
- Varias fotos por orden, con vista previa y opción de quitar antes de guardar.
- Fotos de entrega en **Entregar equipo**.
- Las imágenes se guardan en Supabase Storage y se vinculan a la orden.
- El recibo digital compartido por WhatsApp incluye las fotos disponibles al momento de generar el enlace:
  - Estado al recibir.
  - Estado al entregar.
- El cliente sigue viendo solo el recibo digital; no se agregan controles administrativos.

## Antes de publicar V7.7
1. En Supabase abre **SQL Editor**.
2. Ejecuta `supabase/V7.7-photo-evidence.sql`.
3. Debe terminar con **Success**.
4. Después sube los archivos V7.7 a GitHub Pages reemplazando los actuales.

## Prueba recomendada
1. Crea una orden de prueba y selecciona 2 fotos de recepción.
2. Guarda la orden.
3. Liquida la orden.
4. En Entregar equipo selecciona 1–2 fotos de entrega.
5. Confirma la entrega.
6. Abre un recibo de pago de esa orden y pulsa **Ver recibo digital** o **Enviar recibo por WhatsApp**.
7. El recibo compartido debe mostrar las evidencias de recepción y entrega.

## Nota de privacidad
El bucket `order-evidence` es público para que un cliente pueda ver las fotos incluidas en su recibo sin iniciar sesión. Las rutas usan IDs UUID y nombres aleatorios, pero cualquier persona que obtenga la URL directa de una imagen puede verla. No uses estas fotos para documentos, contraseñas u otra información sensible.
