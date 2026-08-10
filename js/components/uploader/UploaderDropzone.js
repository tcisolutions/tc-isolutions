export function renderUploaderDropzone(){

    return `

        <section class="nx-dropzone">

            <div class="nx-dropzone-icon">

                ☁️

            </div>

            <h3>

                Arrastra fotografías aquí

            </h3>

            <p>

                o

            </p>

            <label
                class="nx-upload-button">

                📷 Seleccionar fotografías

                <input

                    class="nx-uploader-input"

                    type="file"

                    multiple

                    accept="image/*"

                    hidden>

            </label>

            <small>

                JPG · PNG · HEIC

            </small>

        </section>

    `;

}