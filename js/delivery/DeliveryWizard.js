import { Wizard }
from "../components/wizard/Wizard.js";

import { PhotosStep } from "../steps/PhotosStep.js";
import { PaymentStep } from "../steps/PaymentStep.js";
import { SignatureStep } from "../steps/SignatureStep.js";
import { WarrantyStep } from "../steps/WarrantyStep.js";
import { ReceiptStep } from "../steps/ReceiptStep.js";
import { WhatsAppStep } from "../steps/WhatsAppStep.js";
import { DeliveryProcess }
from "../processes/DeliveryProcess.js";

export function createDeliveryWizard(

    container,

    context = {}

){

   console.log("Context recibido:", context);
console.trace("createDeliveryWizard");

    const wizard =

    new Wizard({

        title:"📦 Entrega de Equipo",

        context:{

            order: context.order,

            parts: context.parts,

            labor: context.labor,

            photos:[]

        },

        steps:[

            PhotosStep,
            PaymentStep,
            SignatureStep,
            WarrantyStep,
            ReceiptStep,
            WhatsAppStep

        ]

    });

wizard.onFinish = async ()=>{

    const process =

        new DeliveryProcess(

            wizard.context

        );

    await process.execute();

    context.onFinish?.();

};

    wizard.mount(container);

    return wizard;

}