import { renderWizardHeader } from "./WizardHeader.js";
import { renderWizardProgress } from "./WizardProgress.js";
import { renderWizardStep } from "./WizardStep.js";
import { renderWizardFooter } from "./WizardFooter.js";

export function renderWizardLayout(wizard) {

    return `

        <div class="nx-wizard">

            ${renderWizardHeader(wizard)}

            ${renderWizardProgress(wizard)}

            <div class="nx-wizard-body">

                ${renderWizardStep(wizard)}

            </div>

            ${renderWizardFooter(wizard)}

        </div>

    `;

}