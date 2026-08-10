export function renderCard({

    title="",

    body="",

    footer=""

}){

    return `

        <section class="nx-card">

            <div class="nx-card-header">

                <div class="nx-card-title">

                    ${title}

                </div>

            </div>

            <div class="nx-card-body">

                ${body}

            </div>

            ${

                footer

                ?

                `

                <div class="nx-card-footer">

                    ${footer}

                </div>

                `

                :

                ""

            }

        </section>

    `;

}