export function renderPaymentStatus(balance){

    const paid =

        balance <= 0;

    return `

        <section class="nx-payment-status">

            <label>

                <input

                    type="checkbox"

                    ${paid ? "checked" : ""}

                >

                Pago liquidado

            </label>

        </section>

    `;

}