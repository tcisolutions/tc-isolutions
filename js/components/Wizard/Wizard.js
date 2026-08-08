import { renderWizardLayout } from "./WizardLayout.js";

export class Wizard {

    constructor(options = {}) {

        this.title = options.title || "";

        this.subtitle = options.subtitle || "";

        this.icon = options.icon || "📦";

this.description =
    options.description || "";

        this.steps = options.steps || [];

        this.currentStep = 0;

        this.onFinish = options.onFinish || (() => {});

        this.container = null;

        this.onCancel =
    options.onCancel ||
    (()=>{});

this.beforeNext =
    options.beforeNext ||
    (()=>true);

this.afterNext =
    options.afterNext ||
    (()=>{});

this.beforePrevious =
    options.beforePrevious ||
    (()=>true);

this.afterPrevious =
    options.afterPrevious ||
    (()=>{});

    }

    mount(container) {

        this.container = container;

        this.render();

    }

    next() {

    console.log("NEXT");

    if (!this.beforeNext(this.currentStep)) {

        return;

    }

    if (this.currentStep < this.steps.length - 1) {

        this.currentStep++;

        this.afterNext(this.currentStep);

        this.render();

        return;

    }

    this.finish();

}

    previous(){

    if(!this.beforePrevious(this.currentStep)){

        return;

    }

    if(this.currentStep === 0){

        return;

    }

    this.currentStep--;

    this.afterPrevious(this.currentStep);

    this.render();

}

goTo(index){

    if(index < 0){

        return;

    }

    if(index >= this.steps.length){

        return;

    }

    this.currentStep = index;

    this.render();

}

reset(){

    this.currentStep=0;

    this.render();

}

finish() {

    console.log("🔥 FINISH");

    this.onFinish();

}

cancel(){

    this.onCancel();

}

    getCurrentStep() {

        return this.steps[this.currentStep];

    }

    render(){

    if(!this.container){

        return;

    }

    this.container.innerHTML =

        renderWizardLayout(this);

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

    if(previous){

        previous.onclick =
            ()=>this.previous();

    }

    if(next){

        next.onclick=()=>{

            const step =
                this.getCurrentStep();

            if(

                step.validate &&
                !step.validate()

            ){

                return;

            }

            this.next();

        };

    }

    if(cancel){

        cancel.onclick=()=>{

            this.onCancel();

        };

    }

}

}