export function renderWizardFooter(wizard){

    const isFirst =
        wizard.currentStep === 0;

    const isLast =
        wizard.currentStep ===
        wizard.steps.length - 1;

    return `

        <footer class="nx-wizard-footer">

            <button
                class="nx-btn nx-btn-light"
                id="wizardCancel">

                Cancelar

            </button>

            <div class="nx-footer-actions">

                <button
                    class="nx-btn"
                    id="wizardPrevious"

                    ${isFirst ? "disabled" : ""}>

                    ← Anterior

                </button>

                <button
                    class="nx-btn nx-btn-primary"
                    id="wizardNext">

                    ${isLast ? "Finalizar" : "Siguiente →"}

                </button>

            </div>

        </footer>

    `;

}