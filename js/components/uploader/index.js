import { renderUploaderDropzone }
from "./UploaderDropzone.js";

import { renderUploaderCounter }
from "./UploaderCounter.js";

import { renderUploaderPreview }
from "./UploaderPreview.js";

import { renderUploaderCard }
from "./UploaderCard.js";


export function renderUploader() {

    return `

        <div class="nx-uploader">

            ${renderUploaderDropzone()}

            ${renderUploaderCounter([])}

            ${renderUploaderPreview()}

        </div>

    `;

}


export class Uploader {

    constructor(options = {}) {

        this.files = [];

        this.container = null;

        this.onChange =
            options.onChange || (() => {});

    }


    mount(container) {

        this.container = container;


        if (!this.container) {

            console.error(
                "❌ Uploader: no se recibió container."
            );

            return;

        }


        const input =
            this.container.querySelector(
                ".nx-uploader-input"
            );


        const preview =
            this.container.querySelector(
                ".nx-uploader-preview"
            );


        if (!input) {

            console.error(
                "❌ Uploader: no se encontró .nx-uploader-input"
            );

            return;

        }


        if (!preview) {

            console.error(
                "❌ Uploader: no se encontró .nx-uploader-preview"
            );

            return;

        }


        /*
        ==========================================
        INPUT DE FOTOGRAFÍAS
        ==========================================
        */

        input.onchange = event => {

            console.log(
                "📸 Uploader CHANGE ejecutado"
            );


            this.files =
                Array.from(
                    event.target.files || []
                );


            console.log(
                "📸 Fotografías seleccionadas:",
                this.files
            );


            this.renderPreview(
                preview
            );


            this.onChange(
                this.files
            );

        };


        console.log(
            "✅ Uploader: onchange conectado"
        );

    }


    renderPreview(preview) {

        if (!preview) {

            return;

        }


        preview.innerHTML = "";


        this.files.forEach(
            (file, index) => {

                const url =
                    URL.createObjectURL(
                        file
                    );


                preview.innerHTML +=
                    renderUploaderCard(
                        url,
                        index,
                        file
                    );

            }
        );


        this.bindRemoveButtons();

    }


    bindRemoveButtons() {

        if (!this.container) {

            return;

        }


        this.container
            .querySelectorAll(
                ".nx-photo-remove"
            )
            .forEach(button => {

                button.onclick = () => {

                    const index =
                        Number(
                            button.dataset.index
                        );


                    this.files =
                        this.files.filter(
                            (_, i) =>
                                i !== index
                        );


                    const preview =
                        this.container.querySelector(
                            ".nx-uploader-preview"
                        );


                    this.renderPreview(
                        preview
                    );


                    this.onChange(
                        this.files
                    );

                };

            });

    }


    getFiles() {

        return this.files;

    }


    destroy() {

        this.files = [];

        this.container = null;

    }

}