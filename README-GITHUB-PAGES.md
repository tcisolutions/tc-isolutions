# TC iSolutions — GitHub Pages

Paquete preparado para GitHub Pages e incluye el `app.js` V7.2 (corrección de entrega/FormData).

## Publicar
1. Crea un repositorio nuevo en GitHub, por ejemplo `tc-isolutions`.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio (`index.html`, `app.js`, `styles.css`, `config.js`, etc.).
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`; guarda.
6. Espera a que GitHub muestre la URL publicada y abre el sistema.

## Importante
- Supabase sigue siendo la base de datos; no necesitas migrar tus datos.
- `config.js` contiene únicamente la clave pública/anon usada por el navegador. No coloques `service_role` ni secretos.
- Si Supabase Auth tiene configuradas URLs de redirección del sitio anterior, agrega también la nueva URL de GitHub Pages en la configuración de Auth.
- `.nojekyll` está incluido para servir el sitio estático directamente.

## V7.3 - Recibo por WhatsApp
- Agrega el botón **Enviar recibo por WhatsApp** al recibo de pago.
- Usa el teléfono registrado en la orden.
- Envía folio, número de recibo, pago recibido, método, total pagado y saldo.
- Normaliza números mexicanos de 10 dígitos al prefijo +52.
