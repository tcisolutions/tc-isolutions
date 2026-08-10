export const NewOrderPaymentStep = {

    title: "Pago",

    render() {

        const parts =
            this.context.parts || [];

        const partsTotal =
            parts.reduce(
                (sum, part) =>
                    sum +
                    Number(part.quantity || 0) *
                    Number(part.unit_price || 0),
                0
            );

        const labor =
            Number(
                this.context.labor || 0
            );

        const total =
            Number(
                this.context.total ??
                (
                    partsTotal +
                    labor
                )
            );

        const deposit =
            Number(
                this.context.deposit || 0
            );

        const balance =
            Math.max(
                0,
                total - deposit
            );


        return `

            <div class="nx-order-step">

                <div class="nx-order-step-header">

                    <div class="nx-order-step-icon">
                        💰
                    </div>

                    <div>

                        <h2>Pago</h2>

                        <p>
                            Define el importe del servicio
                            y el anticipo recibido.
                        </p>

                    </div>

                </div>


                <div class="nx-payment-summary">

                    <div>

                        <span>Refacciones</span>

                        <strong>
                            $${partsTotal.toFixed(2)}
                        </strong>

                    </div>


                    <div>

                        <span>Mano de obra</span>

                        <strong>
                            $${labor.toFixed(2)}
                        </strong>

                    </div>


                    <div class="nx-payment-total">

                        <span>Total</span>

                        <strong>
                            $${total.toFixed(2)}
                        </strong>

                    </div>

                </div>


                <div class="nx-order-form-grid">

                    <label class="nx-field">

                        <span>Anticipo</span>

                        <input
                            id="newOrderDeposit"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${deposit.toFixed(2)}"
                        >

                    </label>


                    <div class="nx-payment-balance">

                        <span>Saldo pendiente</span>

                        <strong id="newOrderBalance">
                            $${balance.toFixed(2)}
                        </strong>

                    </div>

                </div>

            </div>

        `;

    },


    mounted() {

        const deposit =
            document.querySelector(
                "#newOrderDeposit"
            );

        const balance =
            document.querySelector(
                "#newOrderBalance"
            );


        const parts =
            this.context.parts || [];

        const partsTotal =
            parts.reduce(
                (sum, part) =>
                    sum +
                    Number(part.quantity || 0) *
                    Number(part.unit_price || 0),
                0
            );

        const labor =
            Number(
                this.context.labor || 0
            );

        const total =
            partsTotal +
            labor;


        this.context.total =
            total;


        const update =
            () => {

                const value =
                    Math.max(
                        0,
                        Number(
                            deposit?.value || 0
                        )
                    );

                this.context.deposit =
                    value;

                const currentBalance =
                    Math.max(
                        0,
                        total - value
                    );

                if (balance) {

                    balance.textContent =
                        `$${currentBalance.toFixed(2)}`;

                }

            };


        deposit?.addEventListener(
            "input",
            update
        );


        update();

    },


    validate() {

        const deposit =
            Number(
                document.querySelector(
                    "#newOrderDeposit"
                )?.value || 0
            );


        const total =
            Number(
                this.context.total || 0
            );


        if (deposit > total) {

            alert(
                "El anticipo no puede ser mayor que el total."
            );

            return false;

        }


        this.context.deposit =
            deposit;


        return true;

    }

};