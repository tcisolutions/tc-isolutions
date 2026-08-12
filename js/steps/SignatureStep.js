import {
    renderSignature,
    mountSignature,
    getSignaturePad,
    exportSignature
}
from "../components/signature/index.js";


export const SignatureStep = {

    title: "Firma",


    render() {

        return renderSignature();

    },


    mounted() {

        mountSignature();

    },


    validate() {

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


        return true;

    },


    getSignature() {

        const pad =
            getSignaturePad();


        if (
            !pad ||
            pad.isEmpty()
        ) {

            return null;

        }


        const dataUrl =
            exportSignature();


        if (!dataUrl) {

            return null;

        }


        return dataUrl;

    }

};