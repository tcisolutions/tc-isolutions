import {

    renderUploader,

    Uploader

}

from "../components/uploader/index.js";

export const PhotosStep = {

    title: "Fotos",

    files: [],

    render() {

        return `

            <div class="wizard-step">

                <h2>📷 Fotografías finales</h2>

                <p>

                    Agrega las fotografías del equipo
                    antes de entregarlo.

                </p>

                ${renderUploader()}

            </div>

        `;

    },

    validate() {

        return true;

    },

    mounted() {

    console.log("✅ mounted ejecutado");

    console.log("Context:", this.context);

    this.uploader = new Uploader({

        onChange: files => {

            console.log("📸 onChange ejecutado");

            console.log(files);

            console.log("Context:", this.context);

            if (this.context) {

                this.context.photos = files;

            }

        }

    });

    this.uploader.mount();

}

}

        

