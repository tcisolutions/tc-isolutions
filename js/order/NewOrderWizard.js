import {
    Wizard
}
from "../components/wizard/Wizard.js";


import {
    NewOrderClientStep
}
from "./NewOrderClientStep.js";


import {
    NewOrderDeviceStep
}
from "./NewOrderDeviceStep.js";


import {
    NewOrderReceptionStep
}
from "./NewOrderReceptionStep.js";


import {
    NewOrderPartsStep
}
from "./NewOrderPartsStep.js";


import {
    NewOrderPaymentStep
}
from "./NewOrderPaymentStep.js";


import {
    NewOrderConfirmationStep
}
from "./NewOrderConfirmationStep.js";


export function createNewOrderWizard(
    container,
    options = {}
) {

    const wizard =
        new Wizard({

            title:
                "📱 Nueva orden de servicio",

            subtitle:
                "TC iSolutions · NEXUS",

            description:
                "Registra el equipo paso a paso.",

            icon:
                "📱",

            context: {

                client: "",

                phone: "",

                email: "",

                brand: "",

                model: "",

                imei: "",

                tech: "",

                issue: "",

                condition: "",

                photos: [],

                parts: [],

                labor: 0,

                total: 0,

                deposit: 0,

                warranty: 30,

                status: "Recibido"

            },


            steps: [

                NewOrderClientStep,

                NewOrderDeviceStep,

                NewOrderReceptionStep,

                NewOrderPartsStep,

                NewOrderPaymentStep,

                NewOrderConfirmationStep

            ]

        });


    wizard.onCancel =
        () => {

            options.onCancel?.(
                wizard
            );

        };


    wizard.onFinish =
        async () => {

            console.log(
                "📦 NUEVA ORDEN — CONTEXTO FINAL",
                wizard.context
            );


            if (
                options.onFinish
            ) {

                await options.onFinish(
                    wizard.context,
                    wizard
                );

            }

        };


    wizard.mount(
        container
    );


    return wizard;

}