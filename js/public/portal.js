import { renderHero } from "./hero.js";
import { renderSummary } from "./summary.js";
import { renderWarranty } from "./warranty.js";
import { renderSocials } from "./socials.js";
import {
    getReceptionPhotos,
    getDeliveryPhotos,
    renderGallery
} from "./gallery.js";

import { buildTimeline }
from "../services/timeline.service.js";

import { renderTimeline }
from "../components/Timeline.js";

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

            ${renderTimeline(timeline)}

            ${renderWarranty(portal)}

            ${renderSocials(portal)}

        </div>

    `;

}