export function renderCardHeader({

    title = "",

    subtitle = "",

    icon = ""

}){

    return `

        <header class="nx-card-header">

            <div class="nx-card-title">

                ${icon ? `

                    <div class="nx-card-icon">

                        ${icon}

                    </div>

                ` : ""}

                <div>

                    <h2>${title}</h2>

                    ${subtitle ? `

                        <p>${subtitle}</p>

                    ` : ""}

                </div>

            </div>

        </header>

    `;

}