export function renderWizardHeader(wizard){

    return `

        <header class="nx-wizard-header">

            <div class="nx-wizard-header-left">

                <div class="nx-wizard-icon">

                    ${wizard.icon}

                </div>

                <div>

                    <h2>

                        ${wizard.title}

                    </h2>

                    <small>

                        ${wizard.subtitle || ""}

                    </small>

                    <div class="nx-wizard-description">

                        ${wizard.description || ""}

                    </div>

                </div>

            </div>

        </header>

    `;

}