export function renderUploaderToolbar(){

    return `

        <div class="nx-upload-toolbar">

            <label
                class="nx-upload-button">

                📷 Agregar fotografías

                <input
                    id="deliveryPhotos"
                    type="file"
                    multiple
                    accept="image/*"
                    hidden>

            </label>

        </div>

    `;

}