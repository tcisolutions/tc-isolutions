import { PHOTO_STAGE } from "../constants/photoStages.js";

/* ==========================================
   OBTENER FOTOS DE RECEPCIÓN
========================================== */

export function getReceptionPhotos(photos = []){

    return photos.filter(

        photo => photo.stage === PHOTO_STAGE.RECEPTION

    );

}

/* ==========================================
   OBTENER FOTOS DE ENTREGA
========================================== */

export function getDeliveryPhotos(photos = []){

    return photos.filter(

        photo => photo.stage === PHOTO_STAGE.DELIVERY

    );

}

/* ==========================================
   RENDER GALERÍA
========================================== */

export function renderGallery(title, photos){

    if(!photos.length){

        return "";

    }

    const galleryId =
        Math.random().toString(36).substring(2);

    return `

    <section class="card">

        <h2>📷 ${title}</h2>

        <div class="gallery-viewer">

            <img

                id="main-${galleryId}"

                class="gallery-main"

                src="${photos[0].public_url}"

            >

        </div>

        <div class="gallery-thumbnails">

            ${photos.map(photo=>`

                <img

                    src="${photo.public_url}"

                    class="gallery-thumb"

                    onclick="document.getElementById('main-${galleryId}').src='${photo.public_url}'"

                >

            `).join("")}

        </div>

    </section>

    `;

}