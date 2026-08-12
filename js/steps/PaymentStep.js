import {
    renderPaymentSummary,
    renderPaymentMethods,
    renderPaymentStatus
}
from "../components/payment/index.js";


export const PaymentStep = {

    title: "Pago",


    /*
    ==========================================
    RENDER
    ==========================================
    */

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


    /*
    ==========================================
    MOUNTED
    ==========================================
    */

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
                    balance <= 0,

                recorded:
                    false,

                cashMovementId:
                    null

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


    /*
    ==========================================
    ACTUALIZAR ESTADO DEL PAGO
    ==========================================
    */

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


    /*
    ==========================================
    VALIDAR Y REGISTRAR PAGO
    ==========================================
    */

    async validate() {

        console.log(
            "================================"
        );

        console.log(
            "💰 VALIDANDO PAGO"
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
        ORDEN YA LIQUIDADA
        ==========================================
        */

        if (balance <= 0) {

            this.context.payment = {

                amount:
                    0,

                method:
                    "already_paid",

                liquidated:
                    true,

                recorded:
                    true,

                cashMovementId:
                    null

            };


            console.log(
                "✅ Orden ya liquidada."
            );


            return true;

        }


        /*
        ==========================================
        EVITAR DUPLICAR MOVIMIENTO
        ==========================================
        */

        if (
            this.context.payment?.recorded &&
            this.context.payment?.cashMovementId
        ) {

            console.log(
                "ℹ️ El pago ya fue registrado:",
                this.context.payment.cashMovementId
            );


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
        MÉTODO DE PAGO
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
        MAPEAR MÉTODO
        ==========================================
        */

        const paymentMethodMap = {

            cash:
                "efectivo",

            transfer:
                "transferencia",

            card:
                "tarjeta",

            mixed:
                "otro"

        };


        const paymentMethod =
            paymentMethodMap[method];


        if (!paymentMethod) {

            alert(
                "El método de pago seleccionado no es válido."
            );


            return false;

        }


        /*
        ==========================================
        SUPABASE
        ==========================================
        */

        const sb =
            this.context.supabase;


        if (!sb) {

            alert(
                "No está disponible la conexión con Supabase."
            );


            console.error(
                "❌ PaymentStep: falta context.supabase"
            );


            return false;

        }


        /*
        ==========================================
        OBTENER USUARIO
        ==========================================
        */

        const {
            data: {
                user
            },
            error: userError
        } =
            await sb.auth.getUser();


        if (
            userError ||
            !user
        ) {

            alert(
                "La sesión expiró. Inicia sesión nuevamente."
            );


            console.error(
                "❌ Error obteniendo usuario:",
                userError
            );


            return false;

        }


        /*
        ==========================================
        BUSCAR CAJA ABIERTA
        ==========================================
        */

        console.log(
            "🔎 Buscando sesión de Caja abierta..."
        );


        const {
            data: cashSession,
            error: sessionError
        } =
            await sb
                .from("cash_sessions")
                .select("*")
                .eq(
                    "status",
                    "abierta"
                )
                .order(
                    "opened_at",
                    {
                        ascending: false
                    }
                )
                .limit(1)
                .maybeSingle();


        if (sessionError) {

            console.error(
                "❌ Error buscando Caja:",
                sessionError
            );


            alert(
                "No se pudo consultar la Caja abierta: " +
                sessionError.message
            );


            return false;

        }


        if (!cashSession?.id) {

            alert(
                "No hay una sesión de Caja abierta. Abre Caja antes de registrar el pago."
            );


            return false;

        }


        console.log(
            "✅ Caja abierta:",
            cashSession
        );


        /*
        ==========================================
        REGISTRAR MOVIMIENTO EN CAJA
        ==========================================
        */

        const movement = {

            session_id:
                cashSession.id,

            order_id:
                order.id,

            type:
                "pago",

            amount:
                amount,

            payment_method:
                paymentMethod,

            concept:
                `Pago orden ${order.folio || "—"}`,

            notes:
                `Pago registrado durante entrega de equipo.`,

            created_by:
                user.id

        };


        console.log(
            "💵 Movimiento a registrar:",
            movement
        );


        const {
            data: insertedMovement,
            error: movementError
        } =
            await sb
                .from("cash_movements")
                .insert(
                    movement
                )
                .select("*")
                .single();


        if (movementError) {

            console.error(
                "❌ ERROR REGISTRANDO MOVIMIENTO EN CAJA:",
                movementError
            );


            alert(
                "No se pudo registrar el pago en Caja:\n\n" +
                movementError.message
            );


            return false;

        }


        /*
        ==========================================
        CONFIRMAR MOVIMIENTO
        ==========================================
        */

        console.log(
            "✅ Movimiento registrado en Caja:",
            insertedMovement
        );


        /*
        ==========================================
        GUARDAR PAGO EN CONTEXTO
        ==========================================
        */

        this.context.payment = {

            amount,

            method,

            paymentMethod,

            liquidated:
                amount >= balance,

            recorded:
                true,

            cashMovementId:
                insertedMovement.id

        };


        /*
        ==========================================
        ACTUALIZAR DEPÓSITO EN CONTEXTO
        ==========================================
        */

        this.context.order.deposit =
            deposit + amount;


        console.log(
            "💰 PAGO VALIDADO Y REGISTRADO"
        );

        console.log(
            "Importe:",
            amount
        );

        console.log(
            "Método interfaz:",
            method
        );

        console.log(
            "Método Caja:",
            paymentMethod
        );

        console.log(
            "Nuevo deposit:",
            this.context.order.deposit
        );

        console.log(
            "Movimiento:",
            insertedMovement
        );

        console.log(
            "Contexto:",
            this.context
        );


        return true;

    }

};