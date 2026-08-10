export function renderPaymentSummary({

    total = 0,

    deposit = 0

}){

    const balance =

        Math.max(

            0,

            total - deposit

        );

    return `

        <section class="nx-payment-summary">

            <div class="nx-payment-row">

                <span>

                    Total del servicio

                </span>

                <strong>

                    $${Number(total).toFixed(2)}

                </strong>

            </div>

            <div class="nx-payment-row">

                <span>

                    Anticipo recibido

                </span>

                <strong>

                    $${Number(deposit).toFixed(2)}

                </strong>

            </div>

            <hr>

            <div class="nx-payment-row nx-payment-balance">

                <span>

                    Saldo pendiente

                </span>

                <strong>

                    $${balance.toFixed(2)}

                </strong>

            </div>

        </section>

    `;

}