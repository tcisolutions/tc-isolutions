/**
 * ==========================================================
 * TC iSolutions V8 - NEXUS
 * automation.js
 * ----------------------------------------------------------
 * Motor de automatizaciones.
 * Aquí NO existe lógica visual.
 * Solo responde a eventos del sistema.
 * ==========================================================
 */

import * as WhatsApp from "./whatsapp.js";
import { ORDER_STATUS } from "./constants.js";

/**
 * ==========================================================
 * ORDEN CREADA
 * ==========================================================
 */
export async function orderCreated(order) {

    console.log("[Automation] Orden creada");

    console.log(order);

    WhatsApp.sendOrder(order);

}

/**
 * ==========================================================
 * CAMBIO DE ESTADO
 * ==========================================================
 */

export async function statusChanged(oldStatus,newStatus,order){

    console.log(
        `[Automation] ${oldStatus} → ${newStatus}`
    );

    switch(newStatus){

        case ORDER_STATUS.DIAGNOSIS:

            // Por ahora no hacemos nada.
            break;

        case ORDER_STATUS.WAITING_AUTHORIZATION:

            WhatsApp.sendDiagnosis(order);

            break;

        case ORDER_STATUS.IN_REPAIR:

            WhatsApp.sendRepairStarted(order);

            break;

        case ORDER_STATUS.READY:

            WhatsApp.sendReady(order);

            break;

        case ORDER_STATUS.DELIVERED:

            WhatsApp.sendDelivered(order);

            break;

    }

}

/**
 * ==========================================================
 * PAGO REGISTRADO
 * ==========================================================
 */

export async function paymentCreated(order,payment){

    console.log("[Automation] Pago recibido");

    WhatsApp.sendPayment(order,payment);

}

/**
 * ==========================================================
 * GARANTÍA
 * ==========================================================
 */

export async function warrantyCreated(order){

    console.log("[Automation] Garantía enviada");

    WhatsApp.sendWarranty(order);

}