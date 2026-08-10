import { createDeliveryWizard }
from "./js/delivery/DeliveryWizard.js";

createDeliveryWizard(

    document.querySelector("#app"),

    {

        onFinish(){

            alert("🎉 Wizard terminado correctamente.");

        },

        onCancel(){

            alert("Cancelado");

        }

    }

);