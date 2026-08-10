export function renderStatsCard({

    icon = "📊",

    title = "",

    value = "",

    color = "primary",

    subtitle = ""

}){

    return `

        <div class="nx-stat nx-stat-${color}">

            <div class="nx-stat-icon">

                ${icon}

            </div>

            <div class="nx-stat-content">

                <small>

                    ${title}

                </small>

                <h2>

                    ${value}

                </h2>

                <span>

                    ${subtitle}

                </span>

            </div>

        </div>

    `;

}