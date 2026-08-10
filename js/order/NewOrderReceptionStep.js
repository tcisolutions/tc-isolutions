import {
    renderUploader,
    Uploader
}
from "../components/uploader/index.js";


export const NewOrderReceptionStep = {

    title: "Recepción",

    uploader: null,


    render() {

        return `

            <div class="nx-order-step">

                <div class="nx-order-step-header">

                    <div class="nx-order-step-icon">
                        📷
                    </div>

                    <div>

                        <h2>Recepción del equipo</h2>

                        <p>
                            Documenta visualmente cómo llega el equipo.
                        </p>

                    </div>

                </div>


                <div class="nx-order-photo-section">

                    ${renderUploader()}

                </div>

            </div>

        `;

    },


    mounted() {

        this.uploader =
            new Uploader({

                onChange:
                    files => {

                        this.context.photos =
                            files;

                    }

            });


        const container =
            document.querySelector(
                ".nx-order-photo-section"
            );


        if (container) {

            this.uploader.mount(
                container
            );

        }

    },


    validate() {

        this.context.photos =
            this.uploader
                ? this.uploader.getFiles()
                : [];


        return true;

    },


    destroy() {

        if (
            this.uploader &&
            typeof this.uploader.destroy ===
                "function"
        ) {

            this.uploader.destroy();

        }

        this.uploader = null;

    }

};