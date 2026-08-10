export function renderTimeline(history = []) {

    if (!Array.isArray(history) || !history.length) {

        return `

            <div class="nx-timeline-empty">

                <div class="nx-timeline-empty-icon">
                    🕘
                </div>

                <div>

                    <strong>
                        Sin historial todavía
                    </strong>

                    <span>
                        Los movimientos de esta orden aparecerán aquí.
                    </span>

                </div>

            </div>

        `;

    }


    return `

        <section class="nx-timeline">

            <div class="nx-timeline-header">

                <div>

                    <span class="nx-timeline-kicker">
                        HISTORIAL
                    </span>

                    <h3>
                        Actividad de la orden
                    </h3>

                </div>

                <span class="nx-timeline-count">
                    ${history.length}
                </span>

            </div>


            <div class="nx-timeline-list">

                ${history.map(
                    (item, index) => {

                        const date =
                            item.created_at
                                ? new Date(
                                    item.created_at
                                ).toLocaleString(
                                    "es-MX"
                                )
                                : "—";


                        const title =
                            item.title ||
                            item.event ||
                            item.action ||
                            item.status ||
                            "Actividad";


                        const description =
                            item.description ||
                            item.notes ||
                            item.message ||
                            "";


                        return `

                            <div
                                class="nx-timeline-item">

                                <div
                                    class="nx-timeline-marker">

                                    <span>
                                        ${index === 0 ? "●" : "•"}
                                    </span>

                                </div>


                                <div
                                    class="nx-timeline-content">

                                    <div
                                        class="nx-timeline-item-top">

                                        <strong>
                                            ${escapeTimeline(
                                                title
                                            )}
                                        </strong>

                                        <time>
                                            ${escapeTimeline(
                                                date
                                            )}
                                        </time>

                                    </div>


                                    ${
                                        description
                                            ?
                                            `
                                            <p>
                                                ${escapeTimeline(
                                                    description
                                                )}
                                            </p>
                                            `
                                            :
                                            ""
                                    }

                                </div>

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        </section>

    `;

}


function escapeTimeline(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        char => ({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#39;"
        }[char])
    );

}