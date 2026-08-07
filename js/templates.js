/**
 * ==========================================================
 * TC iSolutions V8 - NEXUS
 * templates.js
 * ----------------------------------------------------------
 * Plantillas de mensajes para WhatsApp.
 * Este archivo SOLO genera texto.
 * Nunca abre WhatsApp ni envía mensajes.
 * ==========================================================
 */

import { APP } from "./constants.js";

/**
 * Da formato a cantidades en pesos mexicanos.
 */
function money(value = 0) {

    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(Number(value) || 0);

}

/**
 * Obtiene el nombre del cliente.
 */
function customer(order) {

    return order.client || "Cliente";

}

/**
 * Obtiene el equipo.
 */
function device(order) {

    return `${order.brand || ""} ${order.model || ""}`.trim();

}

/* ==========================================================
   ORDEN CREADA
========================================================== */

export function orderCreated(order) {

    const lines = [

        `Hola ${customer(order)} 👋`,

        "",

        `Gracias por confiar en ${APP.NAME}.`,

        "",

        "📋 *Orden de Servicio*",

        order.folio || "-",

        "",

        "📱 Equipo",

        device(order),

        "",

        "🔧 Falla reportada",

        order.issue || "-",

        "",

        "💰 Anticipo",

        money(order.deposit),

        "",

        "🌐 Consulta el estado de tu reparación aquí:"

    ];

    if (order.publicUrl) {

        lines.push("");
        lines.push(order.publicUrl);

    }

    lines.push("");
    lines.push("Te avisaremos conforme avance la reparación.");
    lines.push("");
    lines.push("¡Gracias por tu preferencia!");

    return lines.join("\n");

}

/* ==========================================================
   DIAGNÓSTICO TERMINADO
========================================================== */

export function diagnosisReady(order) {

    return `👋 Hola ${customer(order)}

Ya terminamos el diagnóstico de tu equipo.

📋 Orden
${order.folio}

📱 Equipo
${device(order)}

💰 Costo de reparación
${money(order.total)}

Por favor responde este mensaje para autorizar la reparación.

Gracias.`;

}

/* ==========================================================
   REPARACIÓN INICIADA
========================================================== */

export function repairStarted(order) {

    return `Hola ${customer(order)} 👋

Tu equipo ya ingresó al área técnica.

📋 Orden
${order.folio}

👨‍🔧 Estado

En reparación.

Te avisaremos cuando esté listo.

Gracias por tu confianza.`;

}

/* ==========================================================
   EQUIPO LISTO
========================================================== */

export function readyForPickup(order) {

    const saldo =
        (Number(order.total) || 0) -
        (Number(order.deposit) || 0);

    return `🎉 ¡Buenas noticias!

Hola ${customer(order)}.

Tu equipo ya está listo para entrega.

📋 Orden
${order.folio}

📱 Equipo
${device(order)}

💰 Saldo pendiente

${money(saldo)}

Puedes pasar por él en nuestro horario habitual.

Gracias por elegir ${APP.NAME}.`;

}

/* ==========================================================
   EQUIPO ENTREGADO
========================================================== */

export function orderDelivered(order) {

    return `Hola ${customer(order)} 👋

Te agradecemos haber confiado en ${APP.NAME}.

Esperamos que tu equipo funcione perfectamente.

Conserva tu comprobante y garantía.

¡Será un gusto atenderte nuevamente!`;

}

/* ==========================================================
   PAGO RECIBIDO
========================================================== */

export function paymentReceived(order, payment) {

    return `Hola ${customer(order)}.

Hemos recibido tu pago.

💵 Pago recibido

${money(payment.amount)}

Método

${payment.method}

Muchas gracias.`;

}

/* ==========================================================
   GARANTÍA
========================================================== */

export function warranty(order) {

    return `Hola ${customer(order)}.

Tu reparación cuenta con garantía.

Conserva tu comprobante.

Para cualquier duda puedes comunicarte con nosotros.

Gracias por confiar en ${APP.NAME}.`;

}