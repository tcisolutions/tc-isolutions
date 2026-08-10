export const NewOrderDeviceStep = {

    title: "Equipo",

    render() {

        const context =
            this.context || {};

        return `

            <div class="nx-order-step">

                <div class="nx-order-step-header">

                    <div class="nx-order-step-icon">
                        📱
                    </div>

                    <div>

                        <h2>Información del equipo</h2>

                        <p>
                            Registra el dispositivo y la falla reportada.
                        </p>

                    </div>

                </div>


                <div class="nx-order-form-grid">

                    <label class="nx-field">

                        <span>Marca</span>

                        <input
                            id="newOrderBrand"
                            value="${this.escape(context.brand)}"
                            placeholder="Apple, Samsung, Xiaomi..."
                        >

                    </label>


                    <label class="nx-field">

                        <span>Modelo</span>

                        <input
                            id="newOrderModel"
                            value="${this.escape(context.model)}"
                            placeholder="iPhone 15 Pro Max..."
                        >

                    </label>


                    <label class="nx-field">

                        <span>IMEI / Serie</span>

                        <input
                            id="newOrderImei"
                            value="${this.escape(context.imei)}"
                            placeholder="IMEI o número de serie"
                        >

                    </label>


                    <label class="nx-field">

                        <span>Técnico</span>

                        <input
                            id="newOrderTech"
                            value="${this.escape(context.tech)}"
                            placeholder="Técnico responsable"
                        >

                    </label>


                    <label class="nx-field nx-field-full">

                        <span>Falla reportada</span>

                        <textarea
                            id="newOrderIssue"
                            rows="4"
                            placeholder="Describe la falla indicada por el cliente..."
                        >${this.escape(context.issue)}</textarea>

                    </label>


                    <label class="nx-field nx-field-full">

                        <span>Condición / accesorios</span>

                        <textarea
                            id="newOrderCondition"
                            rows="4"
                            placeholder="Estado físico, accesorios, detalles visibles..."
                        >${this.escape(context.condition)}</textarea>

                    </label>

                </div>

            </div>

        `;

    },


    mounted() {

        const fields = {

            brand:
                "#newOrderBrand",

            model:
                "#newOrderModel",

            imei:
                "#newOrderImei",

            tech:
                "#newOrderTech",

            issue:
                "#newOrderIssue",

            condition:
                "#newOrderCondition"

        };


        Object.entries(fields)
            .forEach(
                ([key, selector]) => {

                    const element =
                        document.querySelector(
                            selector
                        );

                    element?.addEventListener(
                        "input",
                        () => {

                            this.context[key] =
                                element.value;

                        }
                    );

                }
            );

    },


    validate() {

        const brand =
            document.querySelector(
                "#newOrderBrand"
            )?.value.trim();

        const model =
            document.querySelector(
                "#newOrderModel"
            )?.value.trim();

        const issue =
            document.querySelector(
                "#newOrderIssue"
            )?.value.trim();


        if (!brand) {

            alert("Indica la marca del equipo.");

            return false;

        }

        if (!model) {

            alert("Indica el modelo del equipo.");

            return false;

        }

        if (!issue) {

            alert("Describe la falla reportada.");

            return false;

        }


        this.context.brand =
            brand;

        this.context.model =
            model;

        this.context.imei =
            document.querySelector(
                "#newOrderImei"
            )?.value.trim() || "";

        this.context.tech =
            document.querySelector(
                "#newOrderTech"
            )?.value.trim() || "";

        this.context.issue =
            issue;

        this.context.condition =
            document.querySelector(
                "#newOrderCondition"
            )?.value.trim() || "";


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