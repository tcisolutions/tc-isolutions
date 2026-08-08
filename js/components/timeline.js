/**
 * ==========================================================
 * TC iSolutions NEXUS
 * Timeline Component V3
 * ==========================================================
 */
import { renderCard } from "./Card.js";

function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getEvent(item) {

    // Orden creada
    if (!item.old_status) {
        return {
            icon: "📋",
            color: "#3B82F6",
            title: "Orden creada",
            description: `Estado inicial: ${item.new_status}`
        };
    }

    // Equipo listo
    if (item.new_status === "Listo para entregar") {
        return {
            icon: "🎉",
            color: "#F59E0B",
            title: "Equipo listo",
            description: "La reparación fue finalizada."
        };
    }

    // Equipo entregado
    if (item.new_status === "Entregado") {
        return {
            icon: "✅",
            color: "#10B981",
            title: "Equipo entregado",
            description: "La orden fue concluida."
        };
    }

    // Cambio normal
    return {
        icon: "🔧",
        color: "#2563EB",
        title: "Cambio de estado",
        description: `${item.old_status} → ${item.new_status}`
    };

}

export function renderTimeline(history = []) {

    if (!history.length) {

        return renderCard(

    "📈 Historial",

    `

        ...

    `

);

    }

    let html = `
        <div class="box">

            <h3>📈 Historial de la Orden</h3>

            <div class="nexus-timeline">
    `;

    history.forEach(item => {

        const event = getEvent(item);

        html += `

            <div class="timeline-row">

                <div class="timeline-left">

                    <div
                        class="timeline-circle"
                        style="background:${event.color};">

                        ${event.icon}

                    </div>

                    <div class="timeline-line"></div>

                </div>

                <div class="timeline-right">

                    <div class="timeline-title">

                        ${event.title}

                    </div>

                    <div class="timeline-description">

                        ${event.description}

                    </div>

                    <div class="timeline-date">

                        ${formatDate(item.changed_at)}

                    </div>

                </div>

            </div>

        `;

    });

    html += `
            </div>
        </div>
    `;

    return html;

}