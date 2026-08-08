import { renderHero } from "./hero.js";
import { renderSummary } from "./summary.js";
import { renderWarranty } from "./warranty.js";
import { renderSocials } from "./socials.js";
import {
    getReceptionPhotos,
    getDeliveryPhotos,
    renderGallery
} from "./gallery.js";

export function renderPortal(portal){

    const reception =
        getReceptionPhotos(portal.gallery);

    const delivery =
        getDeliveryPhotos(portal.gallery);

    return `

        <div class="public-order">

            ${renderHero(portal)}

            ${renderSummary(portal)}

            ${renderGallery(
                "Estado al recibir el equipo",
                reception
            )}

            ${renderGallery(
                "Estado al entregar el equipo",
                delivery
            )}

            ${renderWarranty(portal)}

            ${renderSocials(portal)}

        </div>

    `;

}