export function renderWizardStep(wizard){

    const step = wizard.getCurrentStep();

step.context = wizard.context;

return step.render();

}