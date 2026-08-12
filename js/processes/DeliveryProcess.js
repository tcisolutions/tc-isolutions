export class DeliveryProcess {

    constructor(context = {}) {

        this.context = context;

        this.sb =
            context.supabase ||
            null;

    }


    async execute() {

        console.log(
            "================================"
        );

        console.log(
            "===== DELIVERY PROCESS ====="
        );


        const order =
            this.context.order;


        const photos =
            Array.isArray(
                this.context.photos
            )
                ? this.context.photos
                : [];


        const parts =
            Array.isArray(
                this.context.parts
            )
                ? this.context.parts
                : [];


        const payment =
            this.context.payment ||
            null;


        const signature =
            this.context.signature ||
            null;


        console.log(
            "Order:",
            order
        );


        console.log(
            "Photos:",
            photos
        );


        console.log(
            "Parts:",
            parts
        );


        console.log(
            "Labor:",
            this.context.labor
        );


        console.log(
            "Payment:",
            payment
        );


        console.log(
            "Signature:",
            signature
                ? "✍ FIRMA RECIBIDA"
                : "SIN FIRMA"
        );


        /*
        ==========================================
        VALIDACIONES
        ==========================================
        */


        if (!this.sb) {

            throw new Error(
                "No se recibió Supabase."
            );

        }


        if (!order?.id) {

            throw new Error(
                "No se recibió el ID de la orden."
            );

        }


        if (!payment) {

            throw new Error(
                "No se recibió la información del pago."
            );

        }


        /*
        ==========================================
        USUARIO ACTUAL
        ==========================================
        */


        const {
            data: {
                user
            },
            error: userError
        } =
            await this.sb.auth.getUser();


        if (userError) {

            throw new Error(
                "No se pudo validar la sesión: " +
                userError.message
            );

        }


        if (!user) {

            throw new Error(
                "La sesión expiró. Inicia sesión nuevamente."
            );

        }


        console.log(
            "👤 Usuario:",
            user.id
        );


        /*
        ==========================================
        DATOS DEL PAGO
        ==========================================
        */


        const originalTotal =
            Number(
                order.total || 0
            );


        const originalDeposit =
            Number(
                order.deposit || 0
            );


        const originalBalance =
            Math.max(
                0,
                originalTotal -
                originalDeposit
            );


        const paymentAmount =
            Number(
                payment.amount || 0
            );


        console.log(
            "💰 Total:",
            originalTotal
        );


        console.log(
            "💰 Depósito anterior:",
            originalDeposit
        );


        console.log(
            "💰 Saldo anterior:",
            originalBalance
        );


        console.log(
            "💰 Pago recibido:",
            paymentAmount
        );


        /*
        ==========================================
        VALIDAR PAGO
        ==========================================
        */


        if (originalBalance > 0) {

            if (
                !Number.isFinite(
                    paymentAmount
                ) ||
                paymentAmount <= 0
            ) {

                throw new Error(
                    "El importe del pago no es válido."
                );

            }


            if (
                paymentAmount <
                originalBalance
            ) {

                throw new Error(
                    `El pago recibido ($${paymentAmount.toFixed(2)}) ` +
                    `es menor al saldo pendiente ` +
                    `($${originalBalance.toFixed(2)}).`
                );

            }


            if (
                paymentAmount >
                originalBalance
            ) {

                throw new Error(
                    `El pago recibido ($${paymentAmount.toFixed(2)}) ` +
                    `no puede ser mayor al saldo pendiente ` +
                    `($${originalBalance.toFixed(2)}).`
                );

            }

        }


        /*
        ==========================================
        MÉTODO DE PAGO
        ==========================================
        */


        let paymentMethod =
            String(
                payment.method ||
                "cash"
            ).trim().toLowerCase();


        const paymentMethodMap = {

            cash:
                "efectivo",

            transfer:
                "transferencia",

            card:
                "tarjeta",

            mixed:
                "otro"

        };


        paymentMethod =
            paymentMethodMap[
                paymentMethod
            ] ||
            paymentMethod;


        const allowedMethods = [

            "efectivo",

            "transferencia",

            "tarjeta",

            "otro"

        ];


        if (
            !allowedMethods.includes(
                paymentMethod
            )
        ) {

            throw new Error(
                "El método de pago no es válido."
            );

        }


        console.log(
            "💳 Método:",
            paymentMethod
        );


        /*
        ==========================================
        BUSCAR CAJA ABIERTA
        ==========================================
        */


        let cashSession = null;


        if (
            originalBalance > 0
        ) {

            console.log(
                "🔎 Buscando sesión de Caja abierta..."
            );


            const {
                data: session,
                error: sessionError
            } =
                await this.sb
                    .from("cash_sessions")
                    .select("*")
                    .eq(
                        "status",
                        "abierta"
                    )
                    .order(
                        "opened_at",
                        {
                            ascending: false
                        }
                    )
                    .limit(1)
                    .maybeSingle();


            if (sessionError) {

                throw new Error(
                    "No se pudo consultar la sesión de Caja: " +
                    sessionError.message
                );

            }


            if (!session) {

                throw new Error(
                    "No hay una sesión de Caja abierta. " +
                    "Abre Caja antes de registrar el pago."
                );

            }


            cashSession =
                session;


            console.log(
                "💵 Caja abierta:",
                cashSession.id
            );

        }


        /*
        ==========================================
        SUBIR FOTOGRAFÍAS
        ==========================================
        */


        let uploadedPhotos = [];


        if (photos.length) {

            console.log(
                "📤 Subiendo fotografías de entrega..."
            );


            uploadedPhotos =
                await this.uploadPhotos(
                    order.id,
                    photos
                );


            console.log(
                "✅ Fotografías guardadas:",
                uploadedPhotos
            );

        } else {

            console.log(
                "ℹ️ No se seleccionaron fotografías."
            );

        }


        /*
        ==========================================
        REGISTRAR PAGO EN CAJA
        ==========================================
        */


        let cashMovement = null;


        if (
            originalBalance > 0
        ) {

            console.log(
                "💵 Registrando pago en Caja..."
            );


            const movement = {

                session_id:
                    cashSession.id,

                order_id:
                    order.id,

                type:
                    "pago",

                amount:
                    paymentAmount,

                payment_method:
                    paymentMethod,

                concept:
                    `Pago de orden ${order.folio || order.id}`,

                notes:
                    "Pago registrado durante entrega de equipo.",

                created_by:
                    user.id

            };


            const {
                data: insertedMovement,
                error: movementError
            } =
                await this.sb
                    .from("cash_movements")
                    .insert(
                        movement
                    )
                    .select("*")
                    .single();


            if (movementError) {

                throw new Error(
                    "Las fotografías se guardaron, " +
                    "pero no se pudo registrar el pago en Caja: " +
                    movementError.message
                );

            }


            cashMovement =
                insertedMovement;


            console.log(
                "✅ Pago registrado en Caja:",
                cashMovement
            );

        }


        /*
        ==========================================
        NUEVO DEPÓSITO
        ==========================================
        */


        const newDeposit =
            Math.min(
                originalTotal,
                originalDeposit +
                paymentAmount
            );


        const newBalance =
            Math.max(
                0,
                originalTotal -
                newDeposit
            );


        console.log(
            "💰 Nuevo depósito:",
            newDeposit
        );


        console.log(
            "💰 Nuevo saldo:",
            newBalance
        );


        if (
            newBalance > 0
        ) {

            throw new Error(
                `La orden todavía tiene un saldo pendiente de $${newBalance.toFixed(2)}.`
            );

        }


        /*
        ==========================================
        DATOS DE ENTREGA
        ==========================================
        */


        const delivery =
            this.context.delivery ||
            {};


        const deliveredAt =
            delivery.delivered_at ||
            new Date().toISOString();


        let deliveredBy =
            delivery.delivered_by ||
            "—";


        /*
        ==========================================
        OBTENER NOMBRE DEL PERFIL
        ==========================================
        */


        try {

            const {
                data: profile
            } =
                await this.sb
                    .from("profiles")
                    .select("full_name")
                    .eq(
                        "id",
                        user.id
                    )
                    .maybeSingle();


            if (
                profile?.full_name
            ) {

                deliveredBy =
                    profile.full_name;

            }

        } catch (profileError) {

            console.warn(
                "No se pudo obtener el nombre del perfil:",
                profileError
            );

        }


        /*
        ==========================================
        NOTAS
        ==========================================
        */


        const notes =
            delivery.notes ||
            "";


        /*
        ==========================================
        PARTES
        ==========================================
        */


        const receiptParts =
            parts.map(
                part => ({

                    name:
                        part?.inventory?.name ||
                        part?.name ||
                        "Refacción"

                })
            );


        /*
        ==========================================
        PAYLOAD DEL COMPROBANTE
        ==========================================
        */


        const receiptPayload = {

            v:
                1,

            type:
                "delivery",

            folio:
                order.folio ||
                "—",

            client:
                order.client ||
                "Cliente",

            phone:
                order.phone ||
                "",

            brand:
                order.brand ||
                "",

            model:
                order.model ||
                "",

            imei:
                order.imei ||
                "",

            tech:
                order.tech ||
                "",

            issue:
                order.issue ||
                "",

            total:
                originalTotal,

            paid:
                newDeposit,

            warranty:
                Number(
                    order.warranty || 0
                ),

            delivered_at:
                deliveredAt,

            delivered_by:
                deliveredBy,

            notes:
                notes,

            parts:
                receiptParts,

            photos:
                uploadedPhotos
                    .map(
                        photo => ({

                            stage:
                                photo.stage ||
                                "delivery",

                            public_url:
                                photo.public_url ||
                                ""

                        })
                    )
                    .filter(
                        photo =>
                            photo.public_url
                    ),

            signature:
                signature ||
                null

        };


        console.log(
            "🧾 Payload del comprobante:",
            receiptPayload
        );


        /*
        ==========================================
        ACTUALIZAR ORDEN
        ==========================================
        */


        console.log(
            "📝 Actualizando orden..."
        );


        const {
            data: updatedOrder,
            error: orderError
        } =
            await this.sb
                .from("orders")
                .update({

                    deposit:
                        newDeposit,

                    status:
                        "Entregado"

                })
                .eq(
                    "id",
                    order.id
                )
                .select("*")
                .single();


        if (orderError) {

            throw new Error(
                "El pago fue registrado, " +
                "pero no se pudo actualizar la orden: " +
                orderError.message
            );

        }


        console.log(
            "✅ Orden actualizada:",
            updatedOrder
        );


        /*
        ==========================================
        CREAR CÓDIGO DE COMPROBANTE
        ==========================================
        */


        const receiptCode =
            order.folio
                ? `ENT-${order.folio}`
                : `ENT-${order.id.slice(0, 8).toUpperCase()}`;


        /*
        ==========================================
        GUARDAR COMPROBANTE PÚBLICO
        ==========================================
        */


        console.log(
            "🧾 Creando comprobante público..."
        );


        const {
            data: receipt,
            error: receiptError
        } =
            await this.sb
                .from(
                    "public_delivery_receipts"
                )
                .insert({

                    order_id:
                        order.id,

                    receipt_code:
                        receiptCode,

                    payload:
                        receiptPayload

                })
                .select("*")
                .single();


        if (receiptError) {

            throw new Error(
                "La orden se actualizó, " +
                "pero no se pudo crear el comprobante: " +
                receiptError.message
            );

        }


        console.log(
            "✅ Comprobante creado:",
            receipt
        );


        /*
        ==========================================
        URL DEL COMPROBANTE
        ==========================================
        */


        const base =
            location.href
                .split("#")[0]
                .split("?")[0];


        const receiptUrl =
            receipt?.token
                ? `${base}#entrega=${encodeURIComponent(receipt.token)}`
                : "";


        /*
        ==========================================
        GUARDAR RESULTADO
        ==========================================
        */


        this.context.photosSaved =
            uploadedPhotos;


        this.context.cashMovement =
            cashMovement;


        this.context.receipt =
            receipt;


        this.context.receiptUrl =
            receiptUrl;


        this.context.order =
            updatedOrder;


        this.context.delivery = {

            delivered_at:
                deliveredAt,

            delivered_by:
                deliveredBy,

            notes:
                notes

        };


        /*
        ==========================================
        RESULTADO FINAL
        ==========================================
        */


        console.log(
            "================================"
        );

        console.log(
            "✅ ENTREGA COMPLETADA"
        );

        console.log(
            "Orden:",
            order.folio
        );

        console.log(
            "Pago:",
            paymentAmount
        );

        console.log(
            "Saldo:",
            newBalance
        );

        console.log(
            "Fotos:",
            uploadedPhotos
        );

        console.log(
            "Firma:",
            signature
                ? "RECIBIDA"
                : "NO"
        );

        console.log(
            "Comprobante:",
            receipt
        );

        console.log(
            "URL:",
            receiptUrl
        );

        console.log(
            "================================"
        );


        return {

            success:
                true,

            orderId:
                order.id,

            order:
                updatedOrder,

            payment:
                cashMovement,

            photos:
                uploadedPhotos,

            signature:
                signature,

            receipt:
                receipt,

            receiptUrl:
                receiptUrl

        };

    }


    /*
    ==========================================
    SUBIR FOTOGRAFÍAS
    ==========================================
    */

    async uploadPhotos(
        orderId,
        files
    ) {

        const sb =
            this.sb;


        /*
        ------------------------------------------
        USUARIO
        ------------------------------------------
        */

        const {
            data: {
                user
            },
            error: userError
        } =
            await sb.auth.getUser();


        if (userError) {

            throw new Error(
                "No se pudo validar la sesión: " +
                userError.message
            );

        }


        if (!user) {

            throw new Error(
                "La sesión expiró. Inicia sesión nuevamente."
            );

        }


        /*
        ------------------------------------------
        BUCKET
        ------------------------------------------
        */

        const bucket =
            "order-evidence";


        const uploaded = [];


        /*
        ------------------------------------------
        ARCHIVOS
        ------------------------------------------
        */

        for (const file of files) {


            if (
                !String(
                    file.type || ""
                ).startsWith("image/")
            ) {

                throw new Error(
                    `"${file.name}" no es una imagen válida.`
                );

            }


            if (
                file.size >
                10 * 1024 * 1024
            ) {

                throw new Error(
                    `"${file.name}" supera el límite de 10 MB.`
                );

            }


            const safeName =
                this.safeFileName(
                    file.name
                );


            const path =
                `${orderId}/delivery/${Date.now()}-${safeName}`;


            console.log(
                "📤 Upload:",
                path
            );


            /*
            --------------------------------------
            STORAGE
            --------------------------------------
            */

            const {
                error: uploadError
            } =
                await sb.storage
                    .from(bucket)
                    .upload(
                        path,
                        file,
                        {

                            cacheControl:
                                "3600",

                            upsert:
                                false,

                            contentType:
                                file.type ||
                                undefined

                        }
                    );


            if (uploadError) {

                throw new Error(
                    "No se pudo subir " +
                    file.name +
                    ": " +
                    uploadError.message
                );

            }


            /*
            --------------------------------------
            URL
            --------------------------------------
            */

            const {
                data: publicData
            } =
                sb.storage
                    .from(bucket)
                    .getPublicUrl(
                        path
                    );


            const publicUrl =
                publicData?.publicUrl ||
                "";


            if (!publicUrl) {

                await sb.storage
                    .from(bucket)
                    .remove([
                        path
                    ]);


                throw new Error(
                    "La fotografía se subió, " +
                    "pero no se pudo obtener su URL."
                );

            }


            /*
            --------------------------------------
            REGISTRO order_photos
            --------------------------------------
            */

            const row = {

                order_id:
                    orderId,

                stage:
                    "delivery",

                storage_path:
                    path,

                public_url:
                    publicUrl,

                created_by:
                    user.id

            };


            const {
                data: inserted,
                error: rowError
            } =
                await sb
                    .from("order_photos")
                    .insert(row)
                    .select("*")
                    .single();


            if (rowError) {

                await sb.storage
                    .from(bucket)
                    .remove([
                        path
                    ]);


                throw new Error(
                    "La foto se subió, " +
                    "pero no pudo vincularse " +
                    "a la orden: " +
                    rowError.message
                );

            }


            uploaded.push(
                inserted
            );

        }


        return uploaded;

    }


    /*
    ==========================================
    NOMBRE SEGURO
    ==========================================
    */

    safeFileName(name) {

        return String(
            name || "foto"
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );

    }

}