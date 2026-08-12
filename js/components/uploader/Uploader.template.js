import { renderUploaderDropzone }
from "./UploaderDropzone.js";

import { renderUploaderCounter }
from "./UploaderCounter.js";

import { renderUploaderPreview }
from "./UploaderPreview.js";


export function renderUploaderTemplate(
    state = {}
) {

    return `

        <div class="nx-uploader">

            ${renderUploaderDropzone()}

            ${renderUploaderCounter(
                state.files || []
            )}

            ${renderUploaderPreview()}

        </div>

    `;

}