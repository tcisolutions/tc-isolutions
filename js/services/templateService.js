/**
 * ==========================================================
 * TC iSolutions NEXUS
 * templateService.js
 * ==========================================================
 */

const cache = new Map();

/**
 * Carga todas las plantillas.
 */
export async function loadTemplates(sb){

    const { data, error } = await sb
        .from("message_templates")
        .select("*")
        .eq("enabled", true);

    if(error){

        console.error(error);

        return;

    }

    cache.clear();

    data.forEach(t=>{

        cache.set(
            t.code,
            t
        );

    });

}

/**
 * Obtener plantilla.
 */

export function getTemplate(code){

    return cache.get(code);

}