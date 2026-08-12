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


        /*
        ======================================
        RECUPERAR FIRMA
        ======================================
        */

        try {

            if (
                typeof SignatureStep.getSignature ===
                "function"
            ) {

                wizard.context.signature =
                    SignatureStep.getSignature();

            }

        } catch (error) {

            console.error(
                "No se pudo recuperar la firma:",
                error
            );

            alert(
                "No se pudo obtener la firma del cliente."
            );

            return;

        }


        console.log(
            "Firma:",
            wizard.context.signature
                ? "FIRMA CAPTURADA"
                : "SIN FIRMA"
        );


        /*
        ======================================
        VALIDACIÓN DE FIRMA
        ======================================
        */

        if (!wizard.context.signature) {

            alert(
                "La firma del cliente es obligatoria."
            );

            return;

        }


        /*
        ======================================
        CONVERTIR FIRMA A FILE
        ======================================
        */

        try {

            wizard.context.signature =
                dataUrlToFile(
                    wizard.context.signature,
                    `signature-${Date.now()}.png`
                );

        } catch (error) {

            console.error(
                "Error convirtiendo firma:",
                error
            );

            alert(
                "No se pudo preparar la firma para guardarla."
            );

            return;

        }


        console.log(
            "Archivo de firma:",
            wizard.context.signature
        );


        /*
        ======================================
        EJECUTAR PROCESO
        ======================================
        */

        try {

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
            ==================================
            DEVOLVER RESULTADO A APP.JS
            ==================================
            */

            context.onFinish?.(
                result
            );


        } catch (error) {

            console.error(
                "Error en DeliveryProcess:",
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