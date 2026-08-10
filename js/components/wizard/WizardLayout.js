import { renderWizardHeader }
from "./WizardHeader.js";

import { renderWizardProgress }
from "./WizardProgress.js";

import { renderWizardStep }
from "./WizardStep.js";

import { renderWizardFooter }
from "./WizardFooter.js";

export function renderWizardLayout(wizard){

    return `

        <section class="nx-wizard">

            ${renderWizardHeader(wizard)}

            ${renderWizardProgress(wizard)}

            <main class="nx-content">

                ${renderWizardStep(wizard)}

            </main>

            ${renderWizardFooter(wizard)}

        </section>

    `;

}