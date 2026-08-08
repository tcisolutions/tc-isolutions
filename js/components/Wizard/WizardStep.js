export function renderWizardStep(wizard){

    const step = wizard.getCurrentStep();

    if(!step){

        return "";

    }

    return step.render();

}