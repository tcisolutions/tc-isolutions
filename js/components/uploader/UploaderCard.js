export function renderUploaderCard(url, index, file){

    const size = (
        file.size / 1024 / 1024
    ).toFixed(2);

    return `

        <article
            class="nx-photo-card"
            data-index="${index}">

            <div class="nx-photo-image">

                <img
                    src="${url}"
                    alt="${file.name}">

            </div>

            <div class="nx-photo-content">

                <div class="nx-photo-name">

                    ${file.name}

                </div>

                <div class="nx-photo-size">

                    ${size} MB

                </div>

            </div>

            <button
                class="nx-photo-remove"
                type="button"
                data-index="${index}">

                🗑 Eliminar

            </button>

        </article>

    `;

}