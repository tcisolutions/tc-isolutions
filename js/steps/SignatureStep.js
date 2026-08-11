import {
    renderSignature,
    mountSignature
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

        return true;

    }

};