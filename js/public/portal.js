import { renderHero } from "./hero.js";
import { renderSummary } from "./summary.js";

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

        </div>

    `;

}