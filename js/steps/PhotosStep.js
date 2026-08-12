import {
    renderUploader,
    Uploader
}
from "../components/uploader/index.js";


export const PhotosStep = {

    title: "Fotos",

    uploader: null,

    render() {

        return `

            <div class="wizard-step">

                <h2>📷 Fotografías finales</h2>

                <p>
                    Agrega las fotografías del equipo
                    antes de entregarlo.
                </p>

                <div id="deliveryPhotoUploader">
                    ${renderUploader()}
                </div>

            </div>

        `;

    },


    mounted() {

        console.log("================================");
        console.log("📷 PHOTOS STEP MOUNTED");
        console.log("================================");

        console.log(
            "Contexto recibido:",
            this.context
        );


        const container =
            document.querySelector(
                "#deliveryPhotoUploader"
            );


        if (!container) {

            console.error(
                "❌ No se encontró #deliveryPhotoUploader"
            );

            return;

        }


        /*
        ==========================================
        CREAR UPLOADER
        ==========================================
        */

        this.uploader =
            new Uploader({

                onChange: files => {

                    console.log(
                        "📸 Fotos seleccionadas:",
                        files
                    );


                    /*
                    ==========================================
                    GUARDAR FOTOS EN EL CONTEXTO DEL WIZARD
                    ==========================================
                    */

                    if (this.context) {

                        this.context.photos =
                            Array.from(files || []);

                    }


                    console.log(
                        "📦 Fotos guardadas en context.photos:",
                        this.context?.photos
                    );

                }

            });


        /*
        ==========================================
        MONTAR UPLOADER EN EL DOM
        ==========================================
        */

        this.uploader.mount(
            container
        );


        console.log(
            "✅ Uploader montado correctamente"
        );

    },


    validate() {

        /*
        Las fotografías son opcionales
        */

        return true;

    },


    destroy() {

        if (
            this.uploader &&
            typeof this.uploader.destroy === "function"
        ) {

            this.uploader.destroy();

        }

        this.uploader = null;

    }

};