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

    afterRender() {

        const input =
            this.getInput();

        const preview =
            this.getPreview();

        if (!input || !preview) {

            return;

        }

        input.onchange = () => {

            this.state.files =

                Array.from(

                    input.files

                );

            this.renderPreview();

            this.onChange(

                this.state.files

            );

        };

        this.bindDropzone();

    }

    renderPreview() {

        const preview =
            this.getPreview();

        if (!preview) {

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

    }

    bindEvents() {

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

                (_, i) => i !== index

            );

        this.renderPreview();

        this.onChange(

            this.state.files

        );

    }

    bindDropzone() {

        const zone =

            this.getDropzone();

        if (!zone) {

            return;

        }

        /*
            Aquí implementaremos:

            dragenter

            dragleave

            dragover

            drop
        */

    }

    getInput() {

        return this.container.querySelector(

            ".nx-uploader-input"

        );

    }

    getPreview() {

        return this.container.querySelector(

            ".nx-uploader-preview"

        );

    }

    getDropzone() {

        return this.container.querySelector(

            ".nx-dropzone"

        );

    }

    getFiles() {

        return this.state.files;

    }

}