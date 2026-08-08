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

    return `

        <section class="card">

            <h2>📷 ${title}</h2>

            <div class="gallery">

                ${photos.map(photo => `

                    <img
                        src="${photo.public_url}"
                        class="gallery-thumb"
                        alt="Fotografía">

                `).join("")}

            </div>

        </section>

    `;

}