import {

    renderSignature,

    mountSignature

}

from "../components/Signature/index.js";

export const SignatureStep = {

    title:"Firma",

    render(){

        return renderSignature();

    },

    mounted(){

        mountSignature();

    },

    validate(){

        return true;

    }

};