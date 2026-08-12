export class DeliveryProcess {

    constructor(context = {}) {

        this.context = context;

    }


    async execute() {

        console.log(
            "===== DELIVERY PROCESS ====="
        );


        const {

            sb,

            order,

            parts = [],

            labor = 0,

            photos = [],

            signature = null,

            notes = "",

            deliveredBy = "—",

            uploadOrderPhotos,

            getOrderPhotos

        } = this.context;


        /*
        ==========================================
        VALIDACIONES
        ==========================================
        */

        if (!sb) {

            throw new Error(
                "No se recibió Supabase."
            );

        }


        if (!order?.id) {

            throw new Error(
                "No se recibió la orden."
            );

        }


        if (
            typeof uploadOrderPhotos !==
            "function"
        ) {

            throw new Error(
                "No está disponible uploadOrderPhotos."
            );

        }


        /*
        ==========================================
        VALIDAR SALDO
        ==========================================
        */

        const total =
            +order.total || 0;

        const deposit =
            +order.deposit || 0;

        const balance =
            Math.max(
                0,
                total - deposit
            );


        if (balance > 0.009) {

            throw new Error(

                "La orden todavía tiene un saldo " +
                "pendiente de " +
                balance.toFixed(2)

            );

        }


        /*
        ==========================================
        FOTOS DE ENTREGA
        ==========================================
        */

        if (photos.length) {

            console.log(
                "Subiendo fotos de entrega:",
                photos.length
            );


            await uploadOrderPhotos(

                order.id,

                "delivery",

                photos

            );

        }


        /*
        ==========================================
        FIRMA DEL CLIENTE
        ==========================================
        */

        if (!signature) {

            throw new Error(
                "La firma del cliente es obligatoria."
            );

        }


        console.log(
            "Subiendo firma del cliente..."
        );


        await uploadOrderPhotos(

            order.id,

            "delivery_signature",

            [signature]

        );


        /*
        ==========================================
        ACTUALIZAR ORDEN
        ==========================================
        */

        const deliveredAt =
            new Date().toISOString();


        const {
            data: updatedRows,
            error: updateError

        } = await sb

            .from("orders")

            .update({

                status:
                    "Entregado"

            })

            .eq(
                "id",
                order.id
            )

            .select("*");


        if (updateError) {

            throw new Error(

                "No se pudo actualizar la orden: " +
                updateError.message

            );

        }


        if (
            !updatedRows ||
            !updatedRows.length
        ) {

            throw new Error(

                "Supabase no actualizó la orden. " +
                "Revisa las políticas RLS."

            );

        }


        const deliveredOrder = {

            ...order,

            ...updatedRows[0],

            status:
                "Entregado",

            _delivery: {

                delivered_at:
                    deliveredAt,

                delivered_by:
                    deliveredBy,

                notes:
                    String(notes || "")
                        .trim() || null

            }

        };


        /*
        ==========================================
        RECUPERAR FOTOS
        ==========================================
        */

        let finalPhotos = [];


        if (
            typeof getOrderPhotos ===
            "function"
        ) {

            finalPhotos =
                await getOrderPhotos(
                    order.id
                );

        }


        /*
        ==========================================
        RESULTADO
        ==========================================
        */

        return {

            order:
                deliveredOrder,

            parts:
                parts,

            labor:
                labor,

            photos:
                finalPhotos,

            signature:
                signature,

            deliveredAt:
                deliveredAt

        };

    }

}