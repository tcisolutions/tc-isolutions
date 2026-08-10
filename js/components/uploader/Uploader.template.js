import { renderUploaderDropzone }
from "./UploaderDropzone.js";

import { renderUploaderCounter }
from "./UploaderCounter.js";

import { renderUploaderPreview }
from "./UploaderPreview.js";

export function renderUploaderTemplate(){

    return `

        <div class="nx-uploader">

            ${renderUploaderDropzone()}

            ${renderUploaderCounter(

    this?.state?.files || []

)}

            ${renderUploaderPreview()}

        </div>

    `;

}