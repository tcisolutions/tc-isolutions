import { BaseComponent }
from "../../framework/BaseComponent.js";

import {
    renderUploaderTemplate
}
from "./Uploader.template.js";

import {
    renderUploaderCard
}
from "./UploaderCard.js";


export class Uploader extends BaseComponent {

    constructor(options = {}) {

        super(options);

        this.state = {

            files: []

        };

        this.onChange =
            options.onChange || (() => {});

    }


    template() {

        return renderUploaderTemplate(
            this.state
        );

    }


    mount(container = null) {

    this.container =
        container ||
        document.querySelector(".nx-uploader");

    if (!this.container) {

        console.error(
            "❌ Uploader: no se encontró el contenedor."
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


    input.onchange = event => {

        console.log(
            "📸 CHANGE DEL INPUT EJECUTADO"
        );


        this.files =
            Array.from(
                event.target.files || []
            );


        console.log(
            "📸 Archivos seleccionados:",
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
        "✅ onchange conectado correctamente:",
        input.onchange
    );

}

    removeFile(index) {

        this.state.files =
            this.state.files.filter(
                (_, i) =>
                    i !== index
            );


        this.renderPreview();


        this.onChange(
            this.state.files
        );

    }


    bindDropzone() {

        const zone =
            this.container?.querySelector(
                ".nx-dropzone"
            );


        const input =
            this.container?.querySelector(
                ".nx-uploader-input"
            );


        if (!zone || !input) {

            return;

        }


        /*
        ==========================================
        DRAG ENTER
        ==========================================
        */

        zone.addEventListener(
            "dragenter",
            event => {

                event.preventDefault();

                zone.classList.add(
                    "is-dragging"
                );

            }
        );


        /*
        ==========================================
        DRAG OVER
        ==========================================
        */

        zone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                zone.classList.add(
                    "is-dragging"
                );

            }
        );


        /*
        ==========================================
        DRAG LEAVE
        ==========================================
        */

        zone.addEventListener(
            "dragleave",
            event => {

                event.preventDefault();

                zone.classList.remove(
                    "is-dragging"
                );

            }
        );


        /*
        ==========================================
        DROP
        ==========================================
        */

        zone.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                zone.classList.remove(
                    "is-dragging"
                );


                const files =
                    Array.from(
                        event.dataTransfer?.files || []
                    ).filter(
                        file =>
                            String(
                                file.type || ""
                            ).startsWith("image/")
                    );


                if (!files.length) {

                    return;

                }


                this.state.files =
                    files;


                this.renderPreview();


                this.onChange(
                    this.state.files
                );

            }
        );

    }


    getInput() {

        return this.container?.querySelector(
            ".nx-uploader-input"
        );

    }


    getPreview() {

        return this.container?.querySelector(
            ".nx-uploader-preview"
        );

    }


    getDropzone() {

        return this.container?.querySelector(
            ".nx-dropzone"
        );

    }


    getFiles() {

        return this.state.files;

    }


    destroy() {

        this.state.files = [];

        if (this.container) {

            this.container.innerHTML = "";

        }

        this.container = null;

    }

}