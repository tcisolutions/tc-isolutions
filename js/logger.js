/**
 * ==========================================================
 * TC iSolutions V8
 * logger.js
 * ==========================================================
 */

import { sb } from "../config.js";

/**
 * Guarda un evento del sistema.
 */
export async function log(data){

    try{

        const {
            data:{
                user
            }
        } =
        await sb.auth.getUser();

        await sb
        .from("automation_logs")
        .insert({

            order_id:
            data.order_id,

            event:
            data.event,

            status:
            data.status,

            phone:
            data.phone,

            message:
            data.message,

            success:
            data.success ?? true,

            details:
            data.details ?? null,

            created_by:
            user?.id ?? null

        });

    }catch(err){

        console.error(
            "[LOGGER]",
            err
        );

    }

}