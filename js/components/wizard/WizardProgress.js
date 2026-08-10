export function renderWizardProgress(wizard){

    return `

        <section class="nx-progress">

            ${wizard.steps.map((step,index)=>{

                const active =
                    index === wizard.currentStep;

                const completed =
                    index < wizard.currentStep;

                return `

                    <div class="nx-progress-item">

                        <div
                            class="nx-progress-circle
                            ${active ? "active" : ""}
                            ${completed ? "completed" : ""}">

                            ${
                                completed
                                    ? "✓"
                                    : index + 1
                            }

                        </div>

                        <span>

                            ${step.title}

                        </span>

                        ${
                            index < wizard.steps.length-1

                            ?

                            `<div class="
                                nx-progress-line
                                ${completed
                                    ? "completed"
                                    : ""}
                            "></div>`

                            : ""

                        }

                    </div>

                `;

            }).join("")}

        </section>

    `;

}