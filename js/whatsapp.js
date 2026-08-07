/**
 * ==========================================================
 * TC iSolutions V8 - NEXUS
 * whatsapp.js
 * ==========================================================
 */

import * as Templates from "./templates.js";

/* ==========================================
   NORMALIZAR TELÉFONO
========================================== */

export function normalizePhone(phone = "") {

    let digits = String(phone)
        .replace(/\D/g, "");

    if (digits.length === 10)
        digits = "52" + digits;

    if (
        digits.length === 13 &&
        digits.startsWith("521")
    ) {
        digits = "52" + digits.slice(3);
    }

    return digits;

}

/* ==========================================
   ENVIAR MENSAJE
========================================== */

export function send(phone, text) {

    console.clear();

    console.log("========== MENSAJE ==========");
    console.log(text);

    console.log("========== JSON ==========");
    console.log(JSON.stringify(text));

    console.log("========== URL ==========");
    console.log(`https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`);

    const number = normalizePhone(phone);

    if (!number) {
        alert("El cliente no tiene un número válido.");
        return false;
    }

    const url =
        `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

    navigator.clipboard.writeText(url);

alert("La URL se copió al portapapeles.\nPégala en una pestaña nueva del navegador.");

    return true;

}
/* ==========================================
   ORDEN
========================================== */

export function sendOrder(order){

    return send(
        order.phone,
        Templates.orderCreated(order)
    );

}

/* ==========================================
   DIAGNÓSTICO
========================================== */

export function sendDiagnosis(order){

    return send(
        order.phone,
        Templates.diagnosisReady(order)
    );

}

/* ==========================================
   REPARACIÓN
========================================== */

export function sendRepairStarted(order){

    return send(
        order.phone,
        Templates.repairStarted(order)
    );

}

/* ==========================================
   LISTO
========================================== */

export function sendReady(order){

    return send(
        order.phone,
        Templates.readyForPickup(order)
    );

}

/* ==========================================
   ENTREGADO
========================================== */

export function sendDelivered(order){

    return send(
        order.phone,
        Templates.orderDelivered(order)
    );

}

/* ==========================================
   PAGO
========================================== */

export function sendPayment(order,payment){

    return send(
        order.phone,
        Templates.paymentReceived(order,payment)
    );

}

/* ==========================================
   GARANTÍA
========================================== */

export function sendWarranty(order){

    return send(
        order.phone,
        Templates.warranty(order)
    );

}