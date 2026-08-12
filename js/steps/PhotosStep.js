import {
    renderUploader,
    Uploader
} from "../components/uploader/index.js";


export const PhotosStep = {

    title: "Fotos",


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

        console.log(
            "=============================="
        );

        console.log(
            "📸 PHOTOS STEP MOUNTED"
        );

        console.log(
            "Contexto:",
            this.context
        );


        const container =
            document.querySelector(
                "#deliveryPhotoUploader"
            );


        if (!container) {

            console.error(
                "❌ No existe #deliveryPhotoUploader"
            );

            return;

        }


        console.log(
            "✅ Contenedor del uploader encontrado:",
            container
        );


        this.uploader =
            new Uploader({

                onChange: files => {

                    console.log(
                        "📸 Uploader onChange"
                    );

                    console.log(
                        "Archivos:",
                        files
                    );


                    if (this.context) {

                        this.context.photos =
                            Array.from(
                                files || []
                            );


                        console.log(
                            "✅ context.photos actualizado:",
                            this.context.photos
                        );

                    }

                }

            });


        this.uploader.mount(
            container
        );


        console.log(
            "✅ Uploader montado"
        );


        const input =
            container.querySelector(
                ".nx-uploader-input"
            );


        console.log(
            "Input encontrado:",
            input
        );


        console.log(
            "onchange después de montar:",
            input?.onchange
        );

    },


    validate() {

        /*
         * Las fotografías son opcionales
         * por ahora.
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