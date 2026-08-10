export function renderDashboardStats({

    active = 0,

    diagnostic = 0,

    repair = 0,

    ready = 0,

    total = 0

} = {}){

    return `

        <section class="nx-dashboard-stats">

            <article class="nx-dashboard-stat nx-stat-blue">

                <div class="nx-dashboard-stat-top">

                    <span>

                        ÓRDENES ACTIVAS

                    </span>

                    <span class="nx-dashboard-stat-icon">

                        📋

                    </span>

                </div>

                <strong>

                    ${active}

                </strong>

                <small>

                    En proceso

                </small>

            </article>


            <article class="nx-dashboard-stat nx-stat-yellow">

                <div class="nx-dashboard-stat-top">

                    <span>

                        EN DIAGNÓSTICO

                    </span>

                    <span class="nx-dashboard-stat-icon">

                        🔍

                    </span>

                </div>

                <strong>

                    ${diagnostic}

                </strong>

                <small>

                    Equipos

                </small>

            </article>


            <article class="nx-dashboard-stat nx-stat-orange">

                <div class="nx-dashboard-stat-top">

                    <span>

                        EN REPARACIÓN

                    </span>

                    <span class="nx-dashboard-stat-icon">

                        🔧

                    </span>

                </div>

                <strong>

                    ${repair}

                </strong>

                <small>

                    Equipos

                </small>

            </article>


            <article class="nx-dashboard-stat nx-stat-green">

                <div class="nx-dashboard-stat-top">

                    <span>

                        LISTOS PARA ENTREGA

                    </span>

                    <span class="nx-dashboard-stat-icon">

                        ✓

                    </span>

                </div>

                <strong>

                    ${ready}

                </strong>

                <small>

                    Equipos

                </small>

            </article>


            <article class="nx-dashboard-stat nx-stat-gray">

                <div class="nx-dashboard-stat-top">

                    <span>

                        TOTAL ÓRDENES

                    </span>

                    <span class="nx-dashboard-stat-icon">

                        📊

                    </span>

                </div>

                <strong>

                    ${total}

                </strong>

                <small>

                    Registradas

                </small>

            </article>

        </section>

    `;

}