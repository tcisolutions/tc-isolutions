/**
 * ==========================================================
 * TC iSolutions NEXUS
 * systemService.js
 * ----------------------------------------------------------
 * Inicializa todos los servicios del sistema.
 * ==========================================================
 */

import { loadTemplates } from "./templateService.js";

export async function initializeSystem(sb){

    console.log("🚀 Inicializando NEXUS...");

    // ==========================
    // Plantillas de WhatsApp
    // ==========================

    await loadTemplates(sb);

    console.log("✅ Plantillas cargadas");

    console.log("✅ Sistema listo");

}