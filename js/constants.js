/**
 * ==========================================================
 * TC iSolutions V8 - NEXUS
 * constants.js
 * ----------------------------------------------------------
 * Configuración global del sistema.
 * NO colocar lógica de negocio en este archivo.
 * Solo constantes reutilizables.
 * ==========================================================
 */

/* ==========================================================
   INFORMACIÓN DEL SISTEMA
========================================================== */

export const APP = {
    NAME: "TC iSolutions",
    VERSION: "V8.0.0 CORE",
    COMPANY: "TC iSolutions",
    COUNTRY_CODE: "52",
    DEFAULT_CURRENCY: "MXN"
};


/* ==========================================================
   ESTADOS DE LAS ÓRDENES
========================================================== */

export const ORDER_STATUS = Object.freeze({

    RECEIVED: "Recibido",

    DIAGNOSIS: "Diagnóstico",

    WAITING_AUTHORIZATION: "Esperando autorización",

    IN_REPAIR: "En reparación",

    WAITING_PARTS: "Esperando refacción",

    READY: "Listo para entregar",

    DELIVERED: "Entregado"

});


/* ==========================================================
   PROGRESO DE CADA ESTADO
========================================================== */

export const ORDER_PROGRESS = Object.freeze({

    "Recibido": 10,

    "Diagnóstico": 25,

    "Esperando autorización": 40,

    "Esperando refacción": 55,

    "En reparación": 75,

    "Listo para entregar": 95,

    "Entregado": 100

});


/* ==========================================================
   EVENTOS DE AUTOMATIZACIÓN
========================================================== */

export const AUTOMATION_EVENTS = Object.freeze({

    ORDER_CREATED: "order_created",

    STATUS_CHANGED: "status_changed",

    PAYMENT_RECEIVED: "payment_received",

    ORDER_READY: "order_ready",

    ORDER_DELIVERED: "order_delivered",

    WARRANTY_SENT: "warranty_sent"

});


/* ==========================================================
   MENSAJES WHATSAPP
========================================================== */

export const WHATSAPP_MESSAGES = Object.freeze({

    ORDER_CREATED: "ORDER_CREATED",

    DIAGNOSIS: "DIAGNOSIS",

    READY: "READY",

    DELIVERED: "DELIVERED",

    PAYMENT: "PAYMENT",

    WARRANTY: "WARRANTY"

});


/* ==========================================================
   MÉTODOS DE PAGO
========================================================== */

export const PAYMENT_METHODS = Object.freeze({

    CASH: "Efectivo",

    CARD: "Tarjeta",

    TRANSFER: "Transferencia",

    DEPOSIT: "Depósito"

});


/* ==========================================================
   GARANTÍA
========================================================== */

export const WARRANTY = Object.freeze({

    DEFAULT_DAYS: 30

});


/* ==========================================================
   COLORES DEL SISTEMA
========================================================== */

export const STATUS_COLORS = Object.freeze({

    "Recibido": "#2196F3",

    "Diagnóstico": "#9C27B0",

    "Esperando autorización": "#FF9800",

    "Esperando refacción": "#F44336",

    "En reparación": "#3F51B5",

    "Listo para entregar": "#4CAF50",

    "Entregado": "#607D8B"

});