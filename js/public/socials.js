import { renderCard } from "../components/Card.js";

export function renderSummary(portal){

    return renderCard(

        "Información del equipo",

        `

        <div class="info-grid">

            <div>

                <strong>Cliente</strong>

                <span>${portal.order.client}</span>

            </div>

            <div>

                <strong>Equipo</strong>

                <span>

                    ${portal.order.brand}

                    ${portal.order.model}

                </span>

            </div>

            <div>

                <strong>IMEI</strong>

                <span>${portal.order.imei || "-"}</span>

            </div>

            <div>

                <strong>Falla</strong>

                <span>${portal.order.issue}</span>

            </div>

        </div>

        `

    );

}