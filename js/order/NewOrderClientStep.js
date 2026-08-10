export const NewOrderClientStep = {

    title: "Cliente",

    render() {

        const context = this.context || {};

        return `

            <div class="nx-order-step">

                <div class="nx-order-step-header">

                    <div class="nx-order-step-icon">
                        👤
                    </div>

                    <div>

                        <h2>Datos del cliente</h2>

                        <p>
                            Selecciona un cliente existente
                            o registra uno nuevo.
                        </p>

                    </div>

                </div>


                <div class="nx-order-form-grid">

                    <label class="nx-field nx-field-full">

                        <span>Cliente</span>

                        <input
                            id="newOrderClient"
                            type="text"
                            value="${this.escape(context.client?.name || context.client || "")}"
                            placeholder="Nombre del cliente"
                            autocomplete="off"
                        >

                    </label>


                    <label class="nx-field">

                        <span>WhatsApp</span>

                        <input
                            id="newOrderPhone"
                            type="tel"
                            value="${this.escape(context.phone || "")}"
                            placeholder="Número de WhatsApp"
                        >

                    </label>


                    <label class="nx-field">

                        <span>Correo</span>

                        <input
                            id="newOrderEmail"
                            type="email"
                            value="${this.escape(context.email || "")}"
                            placeholder="Correo electrónico"
                        >

                    </label>

                </div>


                <div class="nx-order-client-actions">

                    <button
                        type="button"
                        class="nx-secondary-button"
                        id="newOrderCreateClient">

                        ＋ Nuevo cliente

                    </button>

                    <span id="newOrderClientStatus"></span>

                </div>

            </div>

        `;

    },


    mounted() {

        const client =
            document.querySelector(
                "#newOrderClient"
            );

        const phone =
            document.querySelector(
                "#newOrderPhone"
            );

        const email =
            document.querySelector(
                "#newOrderEmail"
            );

        const context =
            this.context;


        const sync = () => {

            context.client =
                client?.value.trim() || "";

            context.phone =
                phone?.value.trim() || "";

            context.email =
                email?.value.trim() || "";

        };


        client?.addEventListener(
            "input",
            sync
        );

        phone?.addEventListener(
            "input",
            sync
        );

        email?.addEventListener(
            "input",
            sync
        );


        document
            .querySelector(
                "#newOrderCreateClient"
            )
            ?.addEventListener(
                "click",
                () => {

                    alert(
                        "El registro de nuevo cliente se conectará al módulo de clientes en el siguiente paso."
                    );

                }
            );

    },


    validate() {

        const client =
            document
                .querySelector(
                    "#newOrderClient"
                )
                ?.value
                .trim();

        if (!client) {

            alert(
                "Escribe o selecciona un cliente."
            );

            return false;

        }

        this.context.client =
            client;

        this.context.phone =
            document
                .querySelector(
                    "#newOrderPhone"
                )
                ?.value
                .trim() || "";

        this.context.email =
            document
                .querySelector(
                    "#newOrderEmail"
                )
                ?.value
                .trim() || "";

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