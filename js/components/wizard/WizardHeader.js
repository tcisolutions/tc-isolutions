export function renderWizardHeader(wizard){

    return `

        <header class="nx-header">

            <div class="nx-header-icon">

                ${wizard.icon}

            </div>

            <div class="nx-header-content">

                <h1>

                    ${wizard.title}

                </h1>

                <p>

                    ${wizard.description ||

                    "Sigue los pasos para completar este proceso."}

                </p>

            </div>

        </header>

    `;

}