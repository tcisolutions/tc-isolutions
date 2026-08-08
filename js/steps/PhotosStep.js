export const PhotosStep = {

    title:"Fotos",

    render() {

        return `

            <div class="delivery-step">

                <h2>📷 Fotografías finales</h2>

                <p>

                    Agrega las fotografías del equipo
                    antes de entregarlo.

                </p>

                <div class="step-placeholder">

                    Aquí aparecerá la galería.

                </div>

            </div>

        `;

    },

    validate() {

        return true;

    }

};