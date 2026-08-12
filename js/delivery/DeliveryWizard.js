import { Wizard }
from "../components/wizard/Wizard.js";

import { PhotosStep }
from "../steps/PhotosStep.js";

import { PaymentStep }
from "../steps/PaymentStep.js";

import { SignatureStep }
from "../steps/SignatureStep.js";

import { WarrantyStep }
from "../steps/WarrantyStep.js";

import { ReceiptStep }
from "../steps/ReceiptStep.js";

import { WhatsAppStep }
from "../steps/WhatsAppStep.js";

import { DeliveryProcess }
from "../processes/DeliveryProcess.js";


export function createDeliveryWizard(

    container,

    context = {}

){

    console.log(
        "Context recibido:",
        context
    );

    console.trace(
        "createDeliveryWizard"
    );


    /*
    ==========================================
    CONTEXTO COMPARTIDO DEL WIZARD
    ==========================================
    */

    const wizardContext = {

        order:
            context.order,

        parts:
            context.parts || [],

        labor:
            context.labor || 0,

        photos:
            context.photos || [],

        deliveryFiles:
            [],

        payment:
            null,

        signature:
            null,

        warranty:
            null,

        receipt:
            null,

        whatsapp:
            null,

        /*
        ======================================
        DEPENDENCIAS
        ======================================
        */

        sb:
            context.sb,

        uploadOrderPhotos:
            context.uploadOrderPhotos,

        getOrderPhotos:
            context.getOrderPhotos

    };


    /*
    ==========================================
    CREAR WIZARD
    ==========================================
    */

    const wizard =

        new Wizard({

            title:
                "📦 Entrega de Equipo",

            context:
                wizardContext,

            steps:[

                PhotosStep,

                PaymentStep,

                SignatureStep,

                WarrantyStep,

                ReceiptStep,

                WhatsAppStep

            ]

        });


    /*
    ==========================================
    FINALIZAR WIZARD
    ==========================================
    */

    wizard.onFinish = async () => {

    console.log(
        "===== WIZARD FINALIZADO ====="
    );

    console.log(
        "Contexto final:",
        wizard.context
    );


    try {

        /*
        ==========================================
        1. EJECUTAR PROCESO DE ENTREGA
        ==========================================
        */

        const process =
            new DeliveryProcess(
                wizard.context
            );


        const result =
            await process.execute();


        console.log(
            "===== DELIVERY PROCESS COMPLETADO ====="
        );

        console.log(
            "Resultado:",
            result
        );


        /*
        ==========================================
        2. GUARDAR FOTOGRAFÍAS DE ENTREGA
        ==========================================
        */

        const order =
            wizard.context.order;


        const photos =
            Array.isArray(
                wizard.context.photos
            )
                ? wizard.context.photos
                : [];


        console.log(
            "📸 Fotos seleccionadas para guardar:",
            photos
        );


        if (
            order?.id &&
            photos.length
        ) {

            console.log(
                "📤 Subiendo fotografías de entrega..."
            );


if (
    typeof window.uploadOrderPhotos !==
    "function"
) {

    throw new Error(
        "La función para guardar fotografías " +
        "no está disponible."
    );

}

            const uploadedPhotos =
                await uploadOrderPhotos(
                    order.id,
                    "delivery",
                    photos
                );


            console.log(
                "✅ Fotografías de entrega guardadas:",
                uploadedPhotos
            );


            /*
            Guardamos las filas generadas
            también dentro del contexto.
            */

            wizard.context.photosSaved =
                uploadedPhotos;

        } else {

            console.log(
                "ℹ️ No hay fotografías de entrega para subir."
            );

        }


        /*
        ==========================================
        3. CONTINUAR CON LA CONFIRMACIÓN
        ==========================================
        */

        console.log(
            "===== CONTINUANDO CON CONFIRMACIÓN ====="
        );


        context.onFinish?.();


    } catch (error) {

        console.error(
            "❌ Error en proceso de entrega:",
            error
        );


        alert(
            error?.message ||
            "No se pudo completar el proceso de entrega."
        );

    }

};


    /*
    ==========================================
    MONTAR WIZARD
    ==========================================
    */

    wizard.mount(
        container
    );


    return wizard;

}

function dataUrlToFile(
    dataUrl,
    fileName = "signature.png"
) {

    if (
        !dataUrl ||
        typeof dataUrl !== "string"
    ) {

        throw new Error(
            "La firma no es válida."
        );

    }

    const match =
        dataUrl.match(
            /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
        );

    if (!match) {

        throw new Error(
            "El formato de la firma no es válido."
        );

    }

    const mime =
        match[1];

    const base64 =
        match[2];

    const binary =
        atob(base64);

    const bytes =
        new Uint8Array(
            binary.length
        );

    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);

    }

    return new File(
        [bytes],
        fileName,
        {
            type: mime
        }
    );

}