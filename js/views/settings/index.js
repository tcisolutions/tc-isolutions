/**
 * ==========================================================
 * TC iSolutions NEXUS
 * Centro de Configuración
 * ==========================================================
 */

export function settingsView() {

    return `
    
    <div class="box">

        <h2>⚙️ Centro de Configuración</h2>

        <p>
            Bienvenido al Centro de Configuración de NEXUS.
        </p>

        <div class="settings-grid">

            <button class="settings-card"
                data-module="company">

                🏢

                <strong>Empresa</strong>

                <small>
                    Información del negocio
                </small>

            </button>

            <button class="settings-card"
                data-module="templates">

                💬

                <strong>Plantillas</strong>

                <small>
                    WhatsApp
                </small>

            </button>

            <button class="settings-card"
                data-module="automations">

                ⚙️

                <strong>Automatizaciones</strong>

                <small>
                    Eventos
                </small>

            </button>

            <button class="settings-card"
                data-module="users">

                👥

                <strong>Usuarios</strong>

                <small>
                    Roles y permisos
                </small>

            </button>

        </div>

    </div>

    `;

}