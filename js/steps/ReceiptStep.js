export const ReceiptStep = {

    title:"Recibo",

    render() {

        return `

            <div class="delivery-step">

                <h2>🧾 Comprobante</h2>

                <p>

                    Aquí se generará el PDF.

                </p>

            </div>

        `;

    },

    validate() {

        return true;

    }

};