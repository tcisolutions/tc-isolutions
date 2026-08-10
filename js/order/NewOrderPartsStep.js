export const NewOrderPartsStep = {

    title: "Refacciones",

    render() {

        const parts =
            this.context.parts || [];

        const total =
            parts.reduce(
                (sum, part) =>
                    sum +
                    (
                        Number(part.quantity || 0) *
                        Number(part.unit_price || 0)
                    ),
                0
            );

        return `

            <div class="nx-order-step">

                <div class="nx-order-step-header">

                    <div class="nx-order-step-icon">
                        🔧
                    </div>

                    <div>

                        <h2>Refacciones y servicio</h2>

                        <p>
                            Agrega las refacciones utilizadas
                            y define la mano de obra.
                        </p>

                    </div>

                </div>


                <div
                    id="newOrderPartsList"
                    class="nx-order-parts-list">

                    ${
                        parts.length
                        ?
                        parts.map(
                            (part, index) => `

                                <div
                                    class="nx-order-part-row">

                                    <div>

                                        <strong>
                                            ${this.escape(part.name)}
                                        </strong>

                                        <small>
                                            ${this.escape(part.sku || "")}
                                        </small>

                                    </div>

                                    <span>
                                        ${part.quantity || 1}
                                        ×
                                        $${Number(
                                            part.unit_price || 0
                                        ).toFixed(2)}
                                    </span>

                                </div>

                            `
                        ).join("")
                        :
                        `
                            <div class="nx-order-empty">

                                No hay refacciones agregadas.

                            </div>
                        `
                    }

                </div>


                <div class="nx-order-form-grid">

                    <label class="nx-field">

                        <span>Mano de obra</span>

                        <input
                            id="newOrderLabor"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${Number(
                                this.context.labor || 0
                            )}"
                        >

                    </label>


                    <div class="nx-order-total-box">

                        <span>
                            Refacciones
                        </span>

                        <strong>
                            $${total.toFixed(2)}
                        </strong>

                    </div>

                </div>

            </div>

        `;

    },


    mounted() {

        const labor =
            document.querySelector(
                "#newOrderLabor"
            );


        labor?.addEventListener(
            "input",
            () => {

                this.context.labor =
                    Number(
                        labor.value || 0
                    );

            }
        );

    },


    validate() {

        this.context.labor =
            Number(
                document.querySelector(
                    "#newOrderLabor"
                )?.value || 0
            );

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