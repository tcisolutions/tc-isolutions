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


    mount(container) {

        /*
        ==========================================
        MONTAR COMPONENTE
        ==========================================
        */

        this.container = container;

        if (!this.container) {

            console.error(
                "❌ Uploader: no se recibió container"
            );

            return;

        }


        this.render();


        /*
        ==========================================
        IMPORTANTE
        ==========================================

        Ejecutamos directamente el montaje de
        eventos después de renderizar.

        ==========================================
        */

        this.afterRender();


        console.log(
            "📷 Uploader montado:",
            this.container
        );

    }


    afterRender() {

        console.log(
            "📷 Uploader.afterRender()"
        );


        if (!this.container) {

            console.error(
                "❌ Uploader: no existe container"
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


        const dropzone =
            this.container.querySelector(
                ".nx-dropzone"
            );


        console.log(
            "Input encontrado:",
            input
        );

        console.log(
            "Preview encontrado:",
            preview
        );

        console.log(
            "Dropzone encontrado:",
            dropzone
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
        INPUT DE ARCHIVOS
        ==========================================
        */

        input.onchange = event => {

            console.log(
                "📸 CHANGE DEL INPUT"
            );


            const files =
                Array.from(
                    event.target.files || []
                );


            console.log(
                "Archivos seleccionados:",
                files
            );


            this.state.files =
                files;


            this.renderPreview();


            /*
            ==========================================
            NOTIFICAR AL PHOTOS STEP
            ==========================================
            */

            this.onChange(
                this.state.files
            );

        };


        console.log(
            "✅ onchange conectado:",
            input.onchange
        );


        /*
        ==========================================
        DRAG & DROP
        ==========================================
        */

        this.bindDropzone();

    }


    renderPreview() {

        const preview =
            this.container?.querySelector(
                ".nx-uploader-preview"
            );


        if (!preview) {

            console.error(
                "❌ No existe .nx-uploader-preview"
            );

            return;

        }


        preview.innerHTML = "";


        this.state.files.forEach(
            (file, index) => {

                const url =
                    URL.createObjectURL(file);


                preview.innerHTML +=
                    renderUploaderCard(
                        url,
                        index,
                        file
                    );

            }
        );


        this.bindEvents();


        /*
        ==========================================
        ACTUALIZAR CONTADOR
        ==========================================
        */

        const counter =
            this.container.querySelector(
                ".nx-uploader-counter"
            );


        if (counter) {

            counter.textContent =
                `${this.state.files.length} fotografía${this.state.files.length === 1 ? "" : "s"}`;

        }

    }


    bindEvents() {

        if (!this.container) {
            return;
        }


        this.container
            .querySelectorAll(
                ".nx-photo-remove"
            )
            .forEach(button => {

                button.onclick = () => {

                    this.removeFile(
                        Number(
                            button.dataset.index
                        )
                    );

                };

            });

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