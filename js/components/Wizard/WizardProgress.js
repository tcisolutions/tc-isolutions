export function renderWizardProgress(wizard){

    const total = wizard.steps.length;

    let html = `

        <div class="nx-wizard-progress">

    `;

    wizard.steps.forEach((step,index)=>{

        let status="pending";

        if(index<wizard.currentStep){

            status="completed";

        }

        else if(index===wizard.currentStep){

            status="active";

        }

        html+=`

            <div class="nx-step">

                <div class="nx-step-circle ${status}">

                    ${index+1}

                </div>

                <div class="nx-step-label">

                    ${step.title || `Paso ${index+1}`}

                </div>

            </div>

        `;

        if(index<total-1){

            html+=`

                <div class="nx-step-line ${status}"></div>

            `;

        }

    });

    html+=`

        </div>

    `;

    return html;

}