# TC iSolutions V4

1. Ejecuta `supabase/V4-migration.sql` una sola vez en Supabase SQL Editor.
2. Copia en `config.js` los mismos valores públicos de Supabase que ya funcionan en V3.
3. No uses service_role ni secret keys.
4. Sube V4 a Netlify.

V4 añade login obligatorio, roles, RLS más restrictivo, folios generados en PostgreSQL, historial de estados, edición de órdenes y base responsive.

Importante: esta V4 mejora la seguridad, pero antes de uso intensivo conviene limitar también por columna qué campos puede modificar el técnico mediante una RPC específica.
