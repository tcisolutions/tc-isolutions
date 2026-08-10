export function renderHero(portal){

    const today =
        new Date().toLocaleString("es-MX",{

            dateStyle:"long",

            timeStyle:"short"

        });

    return `

    <section class="hero">

        <img

            src="${portal.company.logo}"

            class="company-logo"

            alt="${portal.company.name}">

        <h1>

            ${portal.company.name}

        </h1>

        <p class="subtitle">

            ${portal.company.slogan}

        </p>

        <div class="divider"></div>

        <small>

            ORDEN DE SERVICIO

        </small>

        <div class="order-number">

            ${portal.order.folio}

        </div>

        <div class="status">

            ${portal.order.status}

        </div>

        <div class="updated">

            Última actualización

            <br>

            ${today}

        </div>

    </section>

    `;

}