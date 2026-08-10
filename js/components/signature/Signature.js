import { SignaturePad }
from "./SignaturePad.js";

import {
    renderSignatureCanvas
}
from "./SignatureCanvas.js";

import {
    renderSignatureToolbar
}
from "./SignatureToolbar.js";

import {
    renderSignatureInfo
}
from "./SignatureInfo.js";

let signaturePad = null;

export function renderSignature(){

    return `

        <section class="nx-signature">

            <h2>

                ✍ Firma del cliente

            </h2>

            ${renderSignatureCanvas()}

            ${renderSignatureToolbar()}

            ${renderSignatureInfo()}

        </section>

    `;

}

export function mountSignature(){

    const canvas =

        document.querySelector(
            "#signatureCanvas"
        );

    if(!canvas){

        return;

    }

    signaturePad =
        new SignaturePad(canvas);

    document
        .querySelector("#clearSignature")
        ?.addEventListener(
            "click",
            ()=>{

                signaturePad.clear();

            }
        );

}

export function getSignaturePad(){

    return signaturePad;

}

export function exportSignature(){

    if(!signaturePad){

        return null;

    }

    return signaturePad.export();

}