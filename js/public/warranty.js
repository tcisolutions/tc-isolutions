import { renderCard } from "../components/Card.js";

export function renderWarranty(portal) {

    return renderCard(

        "Garantía",

        `

        <div class="info-grid">

            <div>

                <strong>Garantía</strong>

                <span>${portal.order.warranty ?? 0} días</span>

            </div>

            <div>

                <strong>Válida hasta</strong>

                <span>${portal.order.warranty_end || "-"}</span>

            </div>

        </div>

        `

    );

}