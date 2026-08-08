import { Wizard }
from "./js/components/Wizard/Wizard.js";

import { DummyStep }
from "./js/steps/DummyStep.js";

const wizard = new Wizard({

    title:"Prueba Wizard",

    steps:[

        DummyStep,

        DummyStep,

        DummyStep

    ],

    onFinish(){

        alert("Wizard terminado.");

    }

});

wizard.mount(

    document.querySelector("#app")

);