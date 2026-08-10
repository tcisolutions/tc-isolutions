export function renderDashboardHeader({

    title = "¡Bienvenido, Técnico!",

    subtitle = "Resumen general del laboratorio",

    date = ""

}){

    return `

        <section class="nx-dashboard-header">

            <div class="nx-dashboard-heading">

                <span class="nx-dashboard-eyebrow">

                    NEXUS · TC iSOLUTIONS

                </span>

                <h1>

                    ${title}

                </h1>

                <p>

                    ${subtitle}

                </p>

            </div>

            <div class="nx-dashboard-date">

                <span>

                    ${date}

                </span>

                <span class="nx-dashboard-calendar">

                    📅

                </span>

            </div>

        </section>

    `;

}