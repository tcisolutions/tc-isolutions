export function renderSummary(portal){

    return `

    <section class="card">

        <h2>Información del equipo</h2>

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

                <span>

                    ${portal.order.imei || "-"}

                </span>

            </div>

            <div>

                <strong>Falla</strong>

                <span>

                    ${portal.order.issue}

                </span>

            </div>

        </div>

    </section>

    `;

}