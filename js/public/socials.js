import { renderCard } from "../components/card/Card.js";

export function renderSocials(portal) {

    return renderCard(

        "Contacto",

        `

        <div style="display:flex;gap:12px;flex-wrap:wrap">

            <a href="https://wa.me/${portal.company.phone || ""}" target="_blank">

                WhatsApp

            </a>

            <a href="${portal.company.facebook || "#"}" target="_blank">

                Facebook

            </a>

            <a href="${portal.company.instagram || "#"}" target="_blank">

                Instagram

            </a>

        </div>

        `

    );

}