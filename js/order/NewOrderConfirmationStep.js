export const NewOrderConfirmationStep = {

    title: "Confirmar",


    render() {

        const c =
            this.context || {};

        const total =
            Number(
                c.total || 0
            );

        const deposit =
            Number(
                c.deposit || 0
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
                        ✓
                    </div>

                    <div>

                        <h2>Confirmar orden</h2>

                        <p>
                            Revisa la información antes
                            de registrar la orden.
                        </p>

                    </div>

                </div>


                <div class="nx-confirmation-grid">


                    <article class="nx-confirmation-card">

                        <span>CLIENTE</span>

                        <strong>
                            ${this.escape(c.client)}
                        </strong>

                        <small>
                            ${this.escape(c.phone || "Sin teléfono")}
                        </small>

                    </article>


                    <article class="nx-confirmation-card">

                        <span>EQUIPO</span>

                        <strong>
                            ${this.escape(c.brand)}
                            ${this.escape(c.model)}
                        </strong>

                        <small>
                            IMEI/Serie:
                            ${this.escape(c.imei || "—")}
                        </small>

                    </article>


                    <article class="nx-confirmation-card">

                        <span>SERVICIO</span>

                        <strong>
                            ${this.escape(c.issue)}
                        </strong>

                        <small>
                            Técnico:
                            ${this.escape(c.tech || "—")}
                        </small>

                    </article>


                    <article class="nx-confirmation-card">

                        <span>COBRO</span>

                        <strong>
                            $${total.toFixed(2)}
                        </strong>

                        <small>
                            Anticipo:
                            $${deposit.toFixed(2)}
                            · Saldo:
                            $${balance.toFixed(2)}
                        </small>

                    </article>

                </div>


                <div class="nx-confirmation-notice">

                    <strong>
                        ✓ Todo listo
                    </strong>

                    <span>
                        Al finalizar se registrará la orden
                        y se conservarán las fotografías
                        y refacciones asociadas.
                    </span>

                </div>

            </div>

        `;

    },


    validate() {

        return true;

    },


    escape(value) {

        return String(
            value ?? ""
        ).replace(
            /[&<>"']/g,
            char => ({
                "&":"&amp;",
                "<":"&lt;",
                ">":"&gt;",
                '"':"&quot;",
                "'":"&#39;"
            }[char])
        );

    }

};