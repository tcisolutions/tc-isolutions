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
                    Revisa y registra el pago
                    antes de entregar el equipo.
                </p>


                ${renderPaymentSummary({

                    total,

                    deposit

                })}


                ${
                    balance > 0

                    ?

                    `

                    <section
                        class="nx-payment-register"
                        style="
                            margin-top:20px;
                            padding:18px;
                            border:1px solid #ddd;
                            border-radius:12px;
                        "
                    >

                        <h3>
                            Registrar pago
                        </h3>


                        <label
                            style="
                                display:block;
                                margin-bottom:8px;
                                font-weight:600;
                            "
                        >
                            Importe a recibir
                        </label>


                        <input
                            id="deliveryPaymentAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${balance.toFixed(2)}"
                            style="
                                width:100%;
                                padding:10px;
                                margin-bottom:15px;
                                font-size:16px;
                            "
                        >


                        ${renderPaymentMethods()}


                    </section>

                    `

                    :

                    renderPaymentStatus(balance)

                }


                ${
                    balance > 0

                    ?

                    `

                    <div
                        id="deliveryPaymentResult"
                        style="
                            margin-top:15px;
                            padding:12px;
                            border-radius:10px;
                            background:#fff7ed;
                        "
                    >
                        ⚠️ Debes registrar el pago
                        pendiente para poder entregar
                        el equipo.
                    </div>

                    `

                    :

                    `
                    <div
                        style="
                            margin-top:15px;
                            padding:12px;
                            border-radius:10px;
                            background:#ecfdf5;
                        "
                    >
                        ✅ La orden ya está liquidada.
                    </div>
                    `

                }

            </div>

        `;

    },


    mounted() {

        console.log(
            "=============================="
        );

        console.log(
            "💰 PAYMENT STEP MOUNTED"
        );

        console.log(
            "Contexto:",
            this.context
        );


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


        /*
        ==========================================
        CREAR CONTEXTO DE PAGO
        ==========================================
        */


        if (!this.context.payment) {

            this.context.payment = {

                amount:
                    balance,

                method:
                    "cash",

                liquidated:
                    balance <= 0

            };

        }


        /*
        ==========================================
        IMPORTE
        ==========================================
        */


        const amountInput =
            document.querySelector(
                "#deliveryPaymentAmount"
            );


        if (amountInput) {

            amountInput.addEventListener(
                "input",
                () => {

                    const amount =
                        Number(
                            amountInput.value || 0
                        );


                    this.context.payment.amount =
                        Math.max(
                            0,
                            amount
                        );


                    this.updatePaymentState();

                }
            );

        }


        /*
        ==========================================
        MÉTODO DE PAGO
        ==========================================
        */


        document
            .querySelectorAll(
                'input[name="paymentMethod"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        () => {

                            if (
                                radio.checked
                            ) {

                                this.context.payment.method =
                                    radio.value;

                                console.log(
                                    "💳 Método:",
                                    radio.value
                                );

                            }

                        }
                    );

                }
            );


        console.log(
            "💰 Pago inicial:",
            this.context.payment
        );

    },


    updatePaymentState() {

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


        const originalBalance =
            Math.max(
                0,
                total - deposit
            );


        const amount =
            Number(
                this.context.payment?.amount || 0
            );


        this.context.payment.liquidated =
            amount >= originalBalance;


        console.log(
            "💰 Estado de pago:",
            this.context.payment
        );

    },


    validate() {

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


        /*
        ==========================================
        ORDEN YA LIQUIDADA
        ==========================================
        */


        if (balance <= 0) {

            this.context.payment = {

                amount: 0,

                method:
                    "already_paid",

                liquidated:
                    true

            };


            return true;

        }


        /*
        ==========================================
        OBTENER IMPORTE
        ==========================================
        */


        const amount =
            Number(
                document.querySelector(
                    "#deliveryPaymentAmount"
                )?.value || 0
            );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            alert(
                "Registra el importe recibido antes de continuar."
            );

            return false;

        }


        /*
        ==========================================
        NO PERMITIR PAGO MENOR AL SALDO
        ==========================================
        */


        if (amount < balance) {

            alert(
                `El saldo pendiente es de $${balance.toFixed(2)}.`
            );

            return false;

        }


        /*
        ==========================================
        MÉTODO
        ==========================================
        */


        const method =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            )?.value;


        if (!method) {

            alert(
                "Selecciona el método de pago."
            );

            return false;

        }


        /*
        ==========================================
        GUARDAR PAGO EN CONTEXTO
        ==========================================
        */


        this.context.payment = {

            amount,

            method,

            liquidated:
                amount >= balance

        };


        /*
        IMPORTANTE:
        Actualizamos temporalmente el depósito
        de la orden para que los siguientes pasos
        vean la orden liquidada.
        */


        this.context.order.deposit =
            deposit + amount;


        console.log(
            "================================"
        );

        console.log(
            "💰 PAGO VALIDADO"
        );

        console.log(
            "Importe:",
            amount
        );

        console.log(
            "Método:",
            method
        );

        console.log(
            "Nuevo deposit:",
            this.context.order.deposit
        );

        console.log(
            "Contexto:",
            this.context
        );


        return true;

    }

};