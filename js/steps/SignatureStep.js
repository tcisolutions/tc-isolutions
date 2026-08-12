import {
    renderSignature,
    mountSignature,
    getSignaturePad,
    exportSignature
} from "../components/signature/index.js";


export const SignatureStep = {

    title: "Firma",

    render() {

        return `

            <div class="wizard-step">

                ${renderSignature()}

            </div>

        `;

    },

    mounted() {

        console.log("==============================");
        console.log("✍ SIGNATURE STEP MOUNTED");
        console.log("==============================");

        mountSignature();

        console.log(
            "SignaturePad:",
            getSignaturePad()
        );

    },

    validate() {

    console.log(
        "✍️ Validando firma..."
    );


    const pad =
        getSignaturePad();


    if (!pad) {

        alert(
            "No se pudo cargar el área de firma."
        );

        return false;

    }


    if (pad.isEmpty()) {

        alert(
            "El cliente debe firmar antes de continuar."
        );

        return false;

    }


    /*
    ==========================================
    EXPORTAR FIRMA
    ==========================================
    */

    const dataUrl =
        exportSignature();


    if (!dataUrl) {

        alert(
            "No se pudo obtener la firma."
        );

        return false;

    }


    /*
    ==========================================
    GUARDAR FIRMA EN CONTEXTO DEL WIZARD
    ==========================================
    */

    if (!this.context) {

        alert(
            "No existe el contexto del asistente."
        );

        return false;

    }


    this.context.signature =
        dataUrl;


    console.log(
        "✅ Firma validada correctamente"
    );


    console.log(
        "✍️ Firma guardada en context:",
        dataUrl.substring(
            0,
            40
        ) + "..."
    );


    return true;

},

    getSignature() {

        const pad =
            getSignaturePad();

        if (!pad || pad.isEmpty()) {

            return null;

        }

        const dataUrl =
            exportSignature();

        if (!dataUrl) {

            return null;

        }

        return dataUrl;

    },

    saveToContext() {

        const signature =
            this.getSignature();

        if (!signature) {

            console.warn(
                "⚠️ No hay firma para guardar"
            );

            return false;

        }

        if (!this.context) {

            console.warn(
                "⚠️ SignatureStep no recibió context"
            );

            return false;

        }

        this.context.signature =
            signature;

        console.log(
            "✍ Firma guardada en context:",
            signature.substring(0, 40) + "..."
        );

        return true;

    },

    destroy() {

        const pad =
            getSignaturePad();

        if (pad) {

            console.log(
                "🧹 Destruyendo SignatureStep"
            );

        }

    }

};