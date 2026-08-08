export function renderWarranty(portal){

    return `

    <section class="card">

        <h2>🛡️ Garantía</h2>

        <ul>

            <li>

                Garantía de ${portal.order.warranty} días.

            </li>

            ${portal.warranty.map(item=>`

                <li>${item}</li>

            `).join("")}

        </ul>

    </section>

    `;

}