export function renderPaymentMethods(){

    return `

        <section class="nx-payment-methods">

            <h3>

                Método de pago

            </h3>

            <label>

                <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked>

                Efectivo

            </label>

            <label>

                <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer">

                Transferencia

            </label>

            <label>

                <input
                    type="radio"
                    name="paymentMethod"
                    value="card">

                Tarjeta

            </label>

            <label>

                <input
                    type="radio"
                    name="paymentMethod"
                    value="mixed">

                Mixto

            </label>

        </section>

    `;

}