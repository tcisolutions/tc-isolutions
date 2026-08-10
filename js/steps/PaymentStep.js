import {

    renderPaymentSummary,

    renderPaymentMethods,

    renderPaymentStatus

}
from "../components/payment/index.js";

export const PaymentStep = {

    title: "Pago",

    render() {

        const order =

            this.context.order || {};

        const total =

            Number(

                order.total || 0

            );

        const deposit =

            Number(

                order.deposit || 0

            );

        const balance =

            Math.max(

                0,

                total - deposit

            );

        return `

            <div class="delivery-step">

                <h2>

                    💰 Pago

                </h2>

                <p>

                    Revisa el estado del pago
                    antes de entregar el equipo.

                </p>

                ${renderPaymentSummary({

                    total,

                    deposit

                })}

                ${renderPaymentMethods()}

                ${renderPaymentStatus(

                    balance

                )}

            </div>

        `;

    },

    validate() {

        return true;

    }

};