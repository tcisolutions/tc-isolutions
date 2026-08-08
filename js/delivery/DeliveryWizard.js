import { Wizard } from "../components/Wizard/Wizard.js";

import { PhotosStep } from "../steps/PhotosStep.js";
import { PaymentStep } from "../steps/PaymentStep.js";
import { SignatureStep } from "../steps/SignatureStep.js";
import { WarrantyStep } from "../steps/WarrantyStep.js";
import { ReceiptStep } from "../steps/ReceiptStep.js";
import { WhatsAppStep } from "../steps/WhatsAppStep.js";

export function createDeliveryWizard(

    container,

    context = {}

){

    const wizard = new Wizard({

        title: "📦 Entrega de Equipo",

        steps: [

            PhotosStep,
            PaymentStep,
            SignatureStep,
            WarrantyStep,
            ReceiptStep,
            WhatsAppStep

        ],

        onFinish(){

    context.onFinish?.();

}

    });

    wizard.mount(container);

    return wizard;

}