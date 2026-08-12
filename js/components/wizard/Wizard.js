import { renderWizardLayout }
from "./WizardLayout.js";

export class Wizard {

    constructor(options = {}) {

        this.title = options.title || "";

        this.subtitle = options.subtitle || "";

        this.icon = options.icon || "📦";

        this.description =
            options.description || "";

        this.steps =
            options.steps || [];

        this.context =
            options.context || {};

        this.currentStep = 0;

        this.container = null;

        this.onFinish =
            options.onFinish || (() => {});

        this.onCancel =
            options.onCancel || (() => {});

        this.beforeNext =
            options.beforeNext || (() => true);

        this.afterNext =
            options.afterNext || (() => {});

        this.beforePrevious =
            options.beforePrevious || (() => true);

        this.afterPrevious =
            options.afterPrevious || (() => {});

    }

    mount(container) {

        this.container = container;

        // Solo para depuración
        if (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        ) {

            window.wizard = this;

        }

        this.render();

    }

    getCurrentStep() {

        return this.steps[
            this.currentStep
        ];

    }

    destroyCurrentStep() {

        const step =
            this.getCurrentStep();

        if (
            step &&
            typeof step.destroy === "function"
        ) {

            step.destroy();

        }

    }

    async next() {

    console.log("NEXT");


    if (
        !this.beforeNext(
            this.currentStep
        )
    ) {

        return;

    }


    const step =
        this.getCurrentStep();


    /*
    ==========================================
    VALIDAR STEP
    ==========================================
    */

    if (
        step &&
        typeof step.validate === "function"
    ) {

        const valid =
            await step.validate();


        if (!valid) {

            return;

        }

    }


    /*
    ==========================================
    AVANZAR
    ==========================================
    */

    if (
        this.currentStep <
        this.steps.length - 1
    ) {

        this.destroyCurrentStep();


        this.currentStep++;


        this.afterNext(
            this.currentStep
        );


        this.render();


        return;

    }


    /*
    ==========================================
    FINALIZAR
    ==========================================
    */

    this.finish();

}

    previous() {

        if (
            !this.beforePrevious(
                this.currentStep
            )
        ) {

            return;

        }

        if (
            this.currentStep === 0
        ) {

            return;

        }

        this.destroyCurrentStep();

        this.currentStep--;

        this.afterPrevious(
            this.currentStep
        );

        this.render();

    }

    goTo(index) {

        if (
            index < 0 ||
            index >= this.steps.length
        ) {

            return;

        }

        this.destroyCurrentStep();

        this.currentStep = index;

        this.render();

    }

    reset() {

        this.destroyCurrentStep();

        this.currentStep = 0;

        this.render();

    }

    finish() {

        console.log("🔥 FINISH");

        this.destroyCurrentStep();

        this.onFinish();

    }

    cancel() {

        this.destroyCurrentStep();

        this.onCancel();

    }

    render() {

        if (!this.container) {

            return;

        }

        this.container.innerHTML =

            renderWizardLayout(this);

        const step =
            this.getCurrentStep();

        /*
         * IMPORTANTE:
         * Cada Step recibe el mismo contexto
         * que pertenece al Wizard.
         */
        if (step) {

            step.context =
                this.context;

        }

        if (
            step &&
            typeof step.mounted === "function"
        ) {

            step.mounted();

        }

        this.bindFooter();

    }

    bindFooter() {

        const previous =
            this.container.querySelector(
                "#wizardPrevious"
            );

        const next =
            this.container.querySelector(
                "#wizardNext"
            );

        const cancel =
            this.container.querySelector(
                "#wizardCancel"
            );

        if (previous) {

            previous.onclick =
                () => this.previous();

        }

        if (next) {

            next.onclick =
                () => this.next();

        }

        if (cancel) {

            cancel.onclick =
                () => this.cancel();

        }

    }

}