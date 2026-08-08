export const PaymentStep = {

    title:"Pago",

    render() {

        return `

            <div class="delivery-step">

                <h2>💰 Cobro</h2>

                <p>

                    Aquí se mostrará el saldo pendiente.

                </p>

            </div>

        `;

    },

    validate() {

        return true;

    }

};