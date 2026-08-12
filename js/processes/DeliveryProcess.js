export class DeliveryProcess {

    constructor(context = {}) {

        this.context = context;

        this.sb =
            context.supabase ||
            null;

    }


    async execute() {

        console.log(
            "===== DELIVERY PROCESS ====="
        );


        console.log(
            "Order:",
            this.context.order
        );


        console.log(
            "Photos:",
            this.context.photos
        );


        console.log(
            "Parts:",
            this.context.parts
        );


                console.log(
            "Labor:",
            this.context.labor
        );


        console.log(
            "Signature:",
            this.context.signature
                ? "✍ FIRMA RECIBIDA"
                : "❌ SIN FIRMA"
        );


        /*
        ==========================================
        VALIDAR FIRMA
        ==========================================
        */

        if (!this.context.signature) {

            throw new Error(
                "No se recibió la firma del cliente."
            );

        }


       
        /*
        ==========================================
        VALIDAR SUPABASE
        ==========================================
        */

        if (!this.sb) {

            throw new Error(
                "No se recibió Supabase."
            );

        }


        /*
        ==========================================
        DATOS DE LA ORDEN
        ==========================================
        */

        const order =
            this.context.order;


        if (!order?.id) {

            throw new Error(
                "No se recibió el ID de la orden."
            );

        }


        /*
        ==========================================
        FOTOGRAFÍAS
        ==========================================
        */

        const photos =
            Array.isArray(
                this.context.photos
            )
                ? this.context.photos
                : [];


        console.log(
            "📸 Fotografías a guardar:",
            photos
        );


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
        GUARDAR RESULTADO EN CONTEXTO
        ==========================================
        */

        this.context.photosSaved =
            uploadedPhotos;


                return {

            success: true,

            orderId:
                order.id,

            photos:
                uploadedPhotos,

            signature:
                this.context.signature

        };

    }


    /*
    ==========================================
    SUBIR FOTOS DE ENTREGA
    ==========================================
    */

    async uploadPhotos(orderId, files) {

        const sb =
            this.sb;


        /*
        ------------------------------------------
        OBTENER USUARIO
        ------------------------------------------
        */

        const {
            data: {
                user
            }
        } =
            await sb.auth.getUser();


        if (!user) {

            throw new Error(
                "La sesión expiró. Inicia sesión nuevamente."
            );

        }


        /*
        ------------------------------------------
        BUCKET EXISTENTE
        ------------------------------------------
        */

        const bucket =
            "order-evidence";


        const uploaded = [];


        /*
        ------------------------------------------
        SUBIR CADA FOTO
        ------------------------------------------
        */

        for (const file of files) {


            if (
                !String(file.type || "")
                    .startsWith("image/")
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
                            cacheControl: "3600",
                            upsert: false,
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
            URL PÚBLICA
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
            REGISTRO EN order_photos
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


                /*
                Si falla la tabla,
                eliminamos también el archivo.
                */

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

        return String(name || "foto")
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