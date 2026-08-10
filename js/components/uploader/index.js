import { renderUploaderDropzone }
from "./UploaderDropzone.js";

import { renderUploaderCounter }
from "./UploaderCounter.js";

import { renderUploaderPreview }
from "./UploaderPreview.js";

import { renderUploaderCard }
from "./UploaderCard.js";

export function renderUploader(){

    return `

        <div class="nx-uploader">

            ${renderUploaderDropzone()}

            ${renderUploaderCounter()}

            ${renderUploaderPreview()}

        </div>

    `;

}

export class Uploader{

    constructor(options = {}){

        this.files = [];

        this.onChange =
            options.onChange || (()=>{});

    }

    mount(){

        const input =
            document.querySelector("#deliveryPhotos");

        const preview =
            document.querySelector("#deliveryPreview");

        if(!input || !preview){

            return;

        }

        input.onchange = ()=>{

            this.files =
                Array.from(input.files);

            this.renderPreview(preview);

            this.onChange(this.files);

        };

    }

    renderPreview(preview){

        preview.innerHTML = "";

        this.files.forEach((file,index)=>{

            const url =
                URL.createObjectURL(file);

            preview.innerHTML +=
                renderUploaderCard(
                    url,
                    index
                );

        });

    }

    getFiles(){

        return this.files;

    }

}

