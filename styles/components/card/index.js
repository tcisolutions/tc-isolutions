export function renderCard({

    title="",

    subtitle="",

    icon="",

    body="",

    footer=""

}){

    return `

        <section class="nx-card">

            <header class="nx-card-header">

                <div>

                    <div class="nx-card-title">

                        <span>

                            ${icon}

                        </span>

                        <h2>

                            ${title}

                        </h2>

                    </div>

                    <div class="nx-card-subtitle">

                        ${subtitle}

                    </div>

                </div>

            </header>

            <div class="nx-card-body">

                ${body}

            </div>

            ${footer ?

            `

            <footer class="nx-card-footer">

                ${footer}

            </footer>

            `

            : ""}

        </section>

    `;

}