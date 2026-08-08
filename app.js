import * as Automation from "./js/automation.js";
import * as PublicOrder from "./js/public/service-order.js";
import { initializeSystem } from "./js/services/systemService.js";
import {
    getCompanySettings
}
from "./js/services/companyService.js";
import {
    getCompleteOrder
}
from "./js/services/orderService.js";

import {
    renderTimeline
}
from "./js/components/timeline.js";

const C = window.TC_CONFIG || {};

const { createClient } = await import(
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
);

const sb = createClient(C.supabaseUrl, C.supabaseAnonKey);


let COMPANY = null;

async function loadCompany(){

    console.log("========== CARGANDO EMPRESA ==========");

    console.log("URL:", C.supabaseUrl);

    COMPANY = await getCompanySettings(sb);

    console.log("Empresa cargada:", COMPANY);

}

const $ = s => document.querySelector(s);

const money = n =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(+n || 0);

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

let profile;
let orders = [];


/* =========================
   LOGIN Y USUARIOS
========================= */

async function enter(user) {

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    $("#msg").textContent = error.message;
    return;
  }

  profile = data;

  // =======================================
// V8 CORE
// Inicializar servicios del sistema
// =======================================

await initializeSystem(sb);

  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");

  const userElement = $("#user");
const roleElement = $("#userRole");

if (userElement) {
    userElement.textContent = profile.full_name;
}

if (roleElement) {
    roleElement.textContent = profile.role;
}

  $("#cashBtn").classList.toggle(
    "hidden",
    profile.role !== "admin"
  );

  $("#newOrder").classList.toggle(
    "hidden",
    profile.role === "tecnico"
  );

/* =========================
   NAVEGACIÓN
========================= */

$("#homeBtn").onclick = () => {

    setActiveMenu("home");

    home();

};

document
    .querySelector('[data-view="orders"]')
    ?.addEventListener("click", () => {

        setActiveMenu("orders");

        ordersView();

    });

document
    .querySelector('[data-view="clients"]')
    ?.addEventListener("click", () => {

        setActiveMenu("clients");

        clientsView();

    });

document
    .querySelector('[data-view="inventory"]')
    ?.addEventListener("click", () => {

        setActiveMenu("inventory");

        inventoryView();

    });

document
    .querySelector('[data-view="cash"]')
    ?.addEventListener("click", () => {

        setActiveMenu("cash");

        cashView();

    });
  
  home();
  
  
  /* =========================
   MENÚ LATERAL
========================= */

$("#homeBtn").onclick = home;

document
    .querySelector('[data-view="orders"]')
    ?.addEventListener("click", ordersView);

document
    .querySelector('[data-view="clients"]')
    ?.addEventListener("click", clientsView);

document
    .querySelector('[data-view="inventory"]')
    ?.addEventListener("click", inventoryView);

document
    .querySelector('[data-view="cash"]')
    ?.addEventListener("click", cashView);
}


$("#loginBtn").onclick = async () => {

  $("#msg").textContent = "";

  const { data, error } =
    await sb.auth.signInWithPassword({
      email: $("#email").value,
      password: $("#password").value
    });

  if (error) {
    $("#msg").textContent = error.message;
    return;
  }

  enter(data.user);
};


$("#logout").onclick = async () => {
  await sb.auth.signOut();
  location.reload();
};


/* =========================
   ÓRDENES
========================= */

async function load() {

  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw error;
  }

  orders = data || [];
}


function table(a) {

  if (!a.length) {
    return '<div class="empty">Sin órdenes</div>';
  }

  return `
    <table>

      <tr>
        <th>Folio</th>
        <th>Cliente</th>
        <th>Equipo</th>
        <th>Estado</th>
        <th>Saldo</th>
        <th></th>
      </tr>

      ${a.map(o => `

        <tr>

          <td>
            ${esc(o.folio)}
          </td>

          <td>
            ${esc(o.client)}
          </td>

          <td>
            ${esc(o.brand)}
            ${esc(o.model)}
          </td>

          <td>
            ${esc(o.status)}
          </td>

          <td>
            ${money(
              (+o.total || 0) -
              (+o.deposit || 0)
            )}
          </td>

          <td style="white-space:nowrap">
            <button
              class="viewServiceOrder"
              data-id="${o.id}">
              Ver orden
            </button>
            <button
              class="edit"
              data-id="${o.id}">
              Editar
            </button>
          </td>

        </tr>

      `).join("")}

    </table>
  `;
}


function bind() {

  document
    .querySelectorAll(".edit")
    .forEach(button => {

      button.onclick = () =>
        edit(button.dataset.id);

    });

  document
    .querySelectorAll(".viewServiceOrder")
    .forEach(button => {

      button.onclick = () =>
        serviceOrderView(button.dataset.id);

    });
}

/* ==========================================================
   MENÚ ACTIVO
========================================================== */

function setActiveMenu(menu) {

    document
        .querySelectorAll(".sidebar-menu button")
        .forEach(button => {

            button.classList.remove("active");

        });

    switch (menu) {

        case "home":

            $("#homeBtn")?.classList.add("active");

            break;

        case "orders":

            document
                .querySelector('[data-view="orders"]')
                ?.classList.add("active");

            break;

        case "clients":

            document
                .querySelector('[data-view="clients"]')
                ?.classList.add("active");

            break;

        case "inventory":

            document
                .querySelector('[data-view="inventory"]')
                ?.classList.add("active");

            break;

        case "cash":

            document
                .querySelector('[data-view="cash"]')
                ?.classList.add("active");

            break;

    }

}


/* =========================
   ORDEN DE SERVICIO
========================= */

async function getServiceOrderParts(orderId) {
  const { data, error } = await sb
    .from("order_parts")
    .select("inventory_id,quantity,unit_cost,unit_price")
    .eq("order_id", orderId);

  if (error) throw error;

  const parts = data || [];
  if (!parts.length) return [];

  const ids = parts.map(p => p.inventory_id);

  const { data: inventory, error: invError } = await sb
    .from("inventory")
    .select("id,sku,name,brand")
    .in("id", ids);

  if (invError) throw invError;

  const byId = new Map((inventory || []).map(i => [i.id, i]));

  return parts.map(p => ({
    ...p,
    inventory: byId.get(p.inventory_id) || null
  }));
}


async function serviceOrderView(id) {

  /*

  let order =
    orders.find(o => o.id === id);

  if (!order) {
    const { data, error } = await sb
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("No se pudo abrir la orden: " + error.message);
      return;
    }

    order = data;
  }

  let parts = [];
  let photos = [];

  try {
    [parts, photos] = await Promise.all([
      getServiceOrderParts(order.id),
      getOrderPhotos(order.id)
    ]);
  } catch (error) {
    alert("No se pudo cargar la orden completa: " + error.message);
    return;
  }
*/
let order;
let parts = [];
let photos = [];
let history = [];
let communication = [];

try {

    const snapshot =
        await getCompleteOrder(
            sb,
            id
        );

    order =
        snapshot.order;

    parts =
        snapshot.parts;

    photos =
        snapshot.photos;

    history =
        snapshot.history;

    communication =
        snapshot.communication;

} catch (error) {

    alert(
        "No se pudo cargar la orden: " +
        error.message
    );

    return;

}

  const partsTotal =
    parts.reduce(
      (sum, p) =>
        sum +
        (+p.quantity || 0) *
        (+p.unit_price || 0),
      0
    );

  const total =
    +order.total || 0;

  const deposit =
    +order.deposit || 0;

  const balance =
    Math.max(0, total - deposit);

  // Como "labor" todavía no se guarda en Supabase,
  // se reconstruye a partir del total menos refacciones.
  const labor =
    Math.max(0, total - partsTotal);

  const created =
    order.created_at
      ? new Date(order.created_at)
          .toLocaleString("es-MX")
      : "—";

  $("#title").textContent =
    "Orden " + (order.folio || "");

  $("#content").innerHTML = `
    <div class="box service-order-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px">
      <button id="backServiceOrders">← Órdenes</button>
      <button id="editServiceOrder">Editar</button>
      ${
        order.status === "Entregado"
          ? `<button id="deliveryReceiptBtn" class="primary">Comprobante de entrega</button>`
          : `<button id="deliverEquipmentBtn" class="primary">Entregar equipo</button>`
      }
      <button id="printServiceOrder">Imprimir orden / PDF</button>
    </div>

    <div id="serviceOrderPrint" class="box" style="max-width:900px;margin:0 auto">

      <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:18px">
        <div>
          <h1 style="margin:0 0 4px">TC iSolutions</h1>
          <div>Orden de servicio</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700">${esc(order.folio || "—")}</div>
          <div>${esc(created)}</div>
          <div><strong>Estado:</strong> ${esc(order.status || "—")}</div>
        </div>
      </div>

      <div class="grid" style="margin-bottom:18px">
        <div>
          <h3>Cliente</h3>
          <p><strong>Nombre:</strong> ${esc(order.client || "—")}</p>
          <p><strong>WhatsApp:</strong> ${esc(order.phone || "—")}</p>
        </div>

        <div>
          <h3>Equipo</h3>
          <p><strong>Equipo:</strong> ${esc(order.brand || "")} ${esc(order.model || "")}</p>
          <p><strong>IMEI / Serie:</strong> ${esc(order.imei || "—")}</p>
          <p><strong>Técnico:</strong> ${esc(order.tech || "—")}</p>
        </div>
      </div>

      <div style="margin-bottom:18px">
        <h3>Recepción y diagnóstico</h3>
        <p><strong>Falla reportada:</strong><br>${esc(order.issue || "—")}</p>
        <p><strong>Condición / accesorios:</strong><br>${esc(order.condition || "—")}</p>
      </div>

      <div style="margin-bottom:18px">
        <h3>Refacciones / conceptos</h3>

        ${
          parts.length
            ? `
              <div style="overflow-x:auto">
                <table>
                  <tr>
                    <th>Concepto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Importe</th>
                  </tr>
                  ${parts.map(p => {
                    const item = p.inventory || {};
                    return `
                      <tr>
                        <td>
                          <strong>${esc(item.name || "Refacción")}</strong>
                          ${item.sku ? `<br><small>${esc(item.sku)}</small>` : ""}
                        </td>
                        <td>${esc(p.quantity)}</td>
                        <td>${money(p.unit_price)}</td>
                        <td>${money((+p.quantity || 0) * (+p.unit_price || 0))}</td>
                      </tr>
                    `;
                  }).join("")}
                </table>
              </div>
            `
            : `<div class="empty">Sin refacciones registradas</div>`
        }
      </div>

      <div style="margin-left:auto;max-width:380px">
        <table>
          <tr>
            <td>Refacciones</td>
            <td style="text-align:right">${money(partsTotal)}</td>
          </tr>
          <tr>
            <td>Mano de obra / servicio</td>
            <td style="text-align:right">${money(labor)}</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td style="text-align:right"><strong>${money(total)}</strong></td>
          </tr>
          <tr>
            <td>Anticipo</td>
            <td style="text-align:right">${money(deposit)}</td>
          </tr>
          <tr>
            <td><strong>Saldo</strong></td>
            <td style="text-align:right"><strong>${money(balance)}</strong></td>
          </tr>
        </table>
      </div>

      ${photoEvidenceHtml(photos)}

      <div style="margin-top:22px;border-top:1px solid #ccc;padding-top:14px">
        <p><strong>Garantía:</strong> ${esc(order.warranty ?? 0)} días</p>
        <p style="font-size:12px;opacity:.8">
          La garantía aplica al servicio realizado y/o refacciones especificadas en esta orden,
          sujeta a revisión del equipo.
        </p>
      </div>

      ${renderTimeline(history)}

      <div style="display:flex;gap:50px;margin-top:55px">
        <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
          Recibió TC iSolutions
        </div>
        <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
          Cliente
        </div>
      </div>

    </div>
  `;

  $("#backServiceOrders").onclick =
    ordersView;

  $("#editServiceOrder").onclick =
    () => edit(order.id);

  const deliverButton = $("#deliverEquipmentBtn");
  if (deliverButton) {
    deliverButton.onclick = () => deliveryConfirmView(order, parts, labor);
  }

  const deliveryReceiptButton = $("#deliveryReceiptBtn");
  if (deliveryReceiptButton) {
    deliveryReceiptButton.onclick = () => deliveryReceiptView(order, parts, labor);
  }

  $("#printServiceOrder").onclick =
    () => printServiceOrder();
}


function deliveryConfirmView(order, parts = [], labor = 0) {
  const total = +order.total || 0;
  const paid = +order.deposit || 0;
  const balance = Math.max(0, total - paid);

  $("#title").textContent = "Entregar equipo";

  $("#content").innerHTML = `
    <div class="box" style="max-width:800px;margin:0 auto">
      <button id="backDeliveryOrder">← Orden</button>
      <h2 style="margin-top:18px">Entrega de equipo</h2>

      <p><strong>Orden:</strong> ${esc(order.folio || "—")}</p>
      <p><strong>Cliente:</strong> ${esc(order.client || "—")}</p>
      <p><strong>Equipo:</strong> ${esc(order.brand || "")} ${esc(order.model || "")}</p>
      <p><strong>IMEI / Serie:</strong> ${esc(order.imei || "—")}</p>

      <div class="cards">
        <div class="card">Total<strong>${money(total)}</strong></div>
        <div class="card">Pagado<strong>${money(paid)}</strong></div>
        <div class="card">Saldo<strong>${money(balance)}</strong></div>
        <div class="card">Garantía<strong>${esc(order.warranty ?? 0)} días</strong></div>
      </div>

      ${
        balance > 0
          ? `<div class="empty" style="margin-top:18px">
               <strong>No se puede entregar este equipo.</strong><br>
               La orden todavía tiene un saldo pendiente de ${money(balance)}.
               Registra el pago en Caja antes de confirmar la entrega.
             </div>`
          : `
            <div class="empty" style="margin-top:18px">
              El saldo está liquidado. Al confirmar, la orden cambiará a
              <strong>Entregado</strong> y se generará el comprobante.
            </div>

            <form id="deliveryForm" style="margin-top:18px">
              <label>
                Notas de entrega
                <textarea name="notes" placeholder="Opcional: condición de entrega, accesorios entregados, observaciones..."></textarea>
              </label>

              <div style="border-top:1px solid #ddd;margin-top:18px;padding-top:16px">
                <strong>Fotos de entrega</strong>
                <div style="font-size:12px;opacity:.7;margin:4px 0 10px">
                  Documenta cómo se entrega el equipo al cliente. Puedes seleccionar varias fotos.
                </div>
                <input id="deliveryPhotosInput" type="file" accept="image/*" multiple>
                <div id="deliveryPhotosPreview"
                  style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-top:12px">
                </div>
              </div>

              <label style="display:flex;gap:8px;align-items:flex-start;margin-top:12px">
                <input name="accepted" type="checkbox" required style="width:auto;margin-top:3px">
                Confirmo que el equipo fue entregado al cliente y que la orden se encuentra liquidada.
              </label>

              <div class="actions">
                <button type="button" id="cancelDelivery">Cancelar</button>
                <button type="submit" class="primary">Confirmar entrega</button>
              </div>
            </form>
          `
      }
    </div>
  `;

  $("#backDeliveryOrder").onclick = () => serviceOrderView(order.id);

  const cancel = $("#cancelDelivery");
  if (cancel) cancel.onclick = () => serviceOrderView(order.id);

  const formDelivery = $("#deliveryForm");
  if (!formDelivery) return;

  const deliveryPhotosInput = $("#deliveryPhotosInput");
  const deliveryPhotosPreview = $("#deliveryPhotosPreview");

  if (deliveryPhotosInput && deliveryPhotosPreview) {
    deliveryPhotosInput.onchange = () => {
      const files = Array.from(deliveryPhotosInput.files || []);
      deliveryPhotosPreview.innerHTML = files.length
        ? files.map(file => photoPreviewCard(URL.createObjectURL(file), file.name)).join("")
        : `<div class="empty" style="grid-column:1/-1">Sin fotos de entrega seleccionadas</div>`;
    };
  }

  formDelivery.onsubmit = async event => {
    event.preventDefault();

    // Guardamos referencias y datos ANTES de cualquier await.
    // event.currentTarget puede quedar en null después de una operación asíncrona.
    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const accepted = form.elements["accepted"];
    const d = Object.fromEntries(new FormData(form));
    const deliveryFiles = Array.from($("#deliveryPhotosInput")?.files || []);

    if (submitButton?.disabled) return;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = "Procesando...";
    }

    try {
      if (accepted && !accepted.checked) {
        alert("Confirma que el equipo fue entregado al cliente.");
        return;
      }

      // Releer la orden evita entregar si el saldo cambió en otra sesión.
      const { data: currentOrder, error: readError } = await sb
        .from("orders")
        .select("*")
        .eq("id", order.id)
        .single();

      if (readError) {
        throw new Error("No se pudo validar la orden: " + readError.message);
      }

      const currentBalance = Math.max(
        0,
        (+currentOrder.total || 0) - (+currentOrder.deposit || 0)
      );

      if (currentBalance > 0.009) {
        alert(
          "La orden tiene saldo pendiente de " +
          money(currentBalance) +
          ". Debe liquidarse antes de entregar."
        );
        return;
      }

      const deliveredAt = new Date().toISOString();
      const deliveredBy = profile?.full_name || "—";

      if (deliveryFiles.length) {
        await uploadOrderPhotos(order.id, "delivery", deliveryFiles);
      }

      const { data: updatedRows, error: updateError } = await sb
        .from("orders")
        .update({ status: "Entregado" })
        .eq("id", order.id)
        .select("*");

      if (updateError) {
        throw new Error("No se pudo registrar la entrega: " + updateError.message);
      }

      if (!updatedRows || !updatedRows.length) {
        throw new Error(
          "Supabase no actualizó la orden. Revisa permisos RLS de UPDATE en orders."
        );
      }

      const deliveredOrder = {
        ...currentOrder,
        ...updatedRows[0],
        status: "Entregado",
        _delivery: {
          delivered_at: deliveredAt,
          delivered_by: deliveredBy,
          notes: d.notes?.trim() || null
        }
      };

      // Actualizamos también el arreglo local para que Dashboard/Órdenes
      // reflejen inmediatamente el nuevo estado.
      const index = orders.findIndex(o => o.id === order.id);
      if (index >= 0) orders[index] = { ...orders[index], ...deliveredOrder };

      deliveryReceiptView(deliveredOrder, parts, labor, true);

    } catch (error) {
      console.error("Error al entregar equipo:", error);
      alert(error?.message || "Ocurrió un error al confirmar la entrega.");
    } finally {
      // Si seguimos en el formulario (porque hubo error), restauramos el botón.
      const currentForm = $("#deliveryForm");
      const currentButton = currentForm?.querySelector('button[type="submit"]');

      if (currentButton) {
        currentButton.disabled = false;
        currentButton.textContent =
          currentButton.dataset.originalText || "Confirmar entrega";
      }
    }
  };
}


async function deliveryReceiptView(order, parts = [], labor = 0, justDelivered = false) {
  let photos = [];

  try {
    photos = await getOrderPhotos(order.id);
  } catch (error) {
    console.error("No se pudieron cargar las fotos del comprobante de entrega:", error);
  }

  const total = +order.total || 0;
  const paid = +order.deposit || 0;
  const balance = Math.max(0, total - paid);
  const delivery = order._delivery || {};
  const deliveredAt = delivery.delivered_at || new Date().toISOString();
  const deliveredBy = delivery.delivered_by || profile?.full_name || "—";
  const notes = delivery.notes || null;

  $("#title").textContent = "Comprobante de entrega";

  $("#content").innerHTML = `
    <div class="box" style="max-width:900px;margin:0 auto">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px">
        <button id="backDeliveryReceipt">← Orden</button>
        <button id="printDeliveryReceipt" class="primary">Imprimir / Guardar PDF</button>
        <button id="viewDigitalDeliveryReceipt">Ver comprobante digital</button>
      </div>

      ${justDelivered ? `<div class="empty" style="margin-bottom:15px"><strong>Equipo entregado correctamente.</strong> La orden quedó marcada como Entregado.</div>` : ""}

      <div id="deliveryReceiptPrint">
        <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:18px">
          <div>
            <h1 style="margin:0 0 4px">TC iSolutions</h1>
            <div>Comprobante de entrega</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:21px;font-weight:700">${esc(order.folio || "—")}</div>
            <div><strong>Estado:</strong> Entregado</div>
            <div>${esc(cashDate(deliveredAt))}</div>
          </div>
        </div>

        <div class="grid" style="margin-bottom:18px">
          <div>
            <h3>Cliente</h3>
            <p><strong>Nombre:</strong> ${esc(order.client || "—")}</p>
            <p><strong>Teléfono:</strong> ${esc(order.phone || "—")}</p>
          </div>
          <div>
            <h3>Equipo</h3>
            <p><strong>Equipo:</strong> ${esc(order.brand || "")} ${esc(order.model || "")}</p>
            <p><strong>IMEI / Serie:</strong> ${esc(order.imei || "—")}</p>
            <p><strong>Técnico:</strong> ${esc(order.tech || "—")}</p>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <h3>Servicio realizado</h3>
          <p><strong>Falla / servicio:</strong><br>${esc(order.issue || "—")}</p>
          ${
            parts.length
              ? `<p><strong>Refacciones:</strong> ${parts.map(p => esc(p.inventory?.name || "Refacción")).join(", ")}</p>`
              : ""
          }
        </div>

        <table>
          <tr><td>Total de la orden</td><td style="text-align:right">${money(total)}</td></tr>
          <tr><td>Total pagado</td><td style="text-align:right">${money(paid)}</td></tr>
          <tr><td><strong>Saldo</strong></td><td style="text-align:right"><strong>${money(balance)}</strong></td></tr>
        </table>

        <div style="margin-top:20px;border:1px solid #ddd;padding:14px">
          <p style="margin-top:0"><strong>Garantía:</strong> ${esc(order.warranty ?? 0)} días</p>
          <p style="font-size:12px;margin-bottom:0">
            La garantía aplica al servicio realizado y/o refacciones especificadas en la orden,
            sujeta a revisión del equipo. No cubre daños posteriores ajenos al servicio realizado.
          </p>
        </div>

        <div style="margin-top:18px">
          <p><strong>Entregado por:</strong> ${esc(deliveredBy)}</p>
          <p><strong>Fecha y hora de entrega:</strong> ${esc(cashDate(deliveredAt))}</p>
          ${notes ? `<p><strong>Notas de entrega:</strong><br>${esc(notes)}</p>` : ""}
        </div>

        ${photoEvidenceHtml(photos)}

        <div style="display:flex;gap:50px;margin-top:55px">
          <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
            Entregó TC iSolutions
          </div>
          <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
            Recibió cliente
          </div>
        </div>
      </div>
    </div>
  `;

  $("#backDeliveryReceipt").onclick = () => serviceOrderView(order.id);
  $("#printDeliveryReceipt").onclick = () => printDeliveryReceipt(order);
  $("#whatsappDeliveryReceipt").onclick = () => sendDeliveryReceiptWhatsApp(order, parts, photos, {
    delivered_at: deliveredAt,
    delivered_by: deliveredBy,
    notes
  });
  $("#viewDigitalDeliveryReceipt").onclick = () => {
    const shareUrl = buildDeliveryReceiptShareUrl(order, parts, photos, {
      delivered_at: deliveredAt,
      delivered_by: deliveredBy,
      notes
    });
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };
}

function deliveryReceiptShareData(order, parts = [], photos = [], delivery = {}) {
  return {
    v: 1,
    type: "delivery",
    folio: order.folio || "—",
    client: order.client || "Cliente",
    phone: order.phone || "",
    brand: order.brand || "",
    model: order.model || "",
    imei: order.imei || "",
    tech: order.tech || "",
    issue: order.issue || "",
    total: +order.total || 0,
    paid: +order.deposit || 0,
    warranty: +order.warranty || 0,
    delivered_at: delivery.delivered_at || new Date().toISOString(),
    delivered_by: delivery.delivered_by || profile?.full_name || "—",
    notes: delivery.notes || "",
    parts: (parts || []).map(p => ({
      name: p.inventory?.name || "Refacción"
    })),
    photos: (photos || []).map(p => ({
      stage: p.stage,
      public_url: normalizePhotoUrl(p)
    })).filter(p => p.public_url)
  };
}

function buildDeliveryReceiptShareUrl(order, parts = [], photos = [], delivery = {}) {
  const base = location.href.split("#")[0].split("?")[0];
  const data = deliveryReceiptShareData(order, parts, photos, delivery);
  return `${base}#entrega=${encodeURIComponent(encodeReceiptPayload(data))}`;
}

function renderPublicDeliveryReceipt(data) {
  const total = +data.total || 0;
  const paid = +data.paid || 0;
  const balance = Math.max(0, total - paid);

  document.title = `Entrega ${data.folio || ""} - TC iSolutions`;
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");

  const nav = document.querySelector("nav");
  if (nav) nav.classList.add("hidden");
  const aside = document.querySelector("aside");
  if (aside) aside.classList.add("hidden");
  const header = document.querySelector("header");
  if (header) header.classList.add("hidden");

  $("#title").textContent = "Comprobante de entrega";
  $("#content").innerHTML = `
    <div class="box" style="max-width:900px;margin:30px auto">
      <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:18px">
        <div><h1 style="margin:0 0 4px">TC iSolutions</h1><div>Comprobante digital de entrega</div></div>
        <div style="text-align:right">
          <div style="font-size:21px;font-weight:700">${esc(data.folio || "—")}</div>
          <div><strong>Estado:</strong> Entregado</div>
          <div>${esc(cashDate(data.delivered_at))}</div>
        </div>
      </div>

      <div class="grid" style="margin-bottom:18px">
        <div>
          <h3>Cliente</h3>
          <p><strong>Nombre:</strong> ${esc(data.client || "—")}</p>
          <p><strong>Teléfono:</strong> ${esc(data.phone || "—")}</p>
        </div>
        <div>
          <h3>Equipo</h3>
          <p><strong>Equipo:</strong> ${esc(data.brand || "")} ${esc(data.model || "")}</p>
          <p><strong>IMEI / Serie:</strong> ${esc(data.imei || "—")}</p>
          <p><strong>Técnico:</strong> ${esc(data.tech || "—")}</p>
        </div>
      </div>

      <div style="margin-bottom:18px">
        <h3>Servicio realizado</h3>
        <p><strong>Falla / servicio:</strong><br>${esc(data.issue || "—")}</p>
        ${Array.isArray(data.parts) && data.parts.length
          ? `<p><strong>Refacciones:</strong> ${data.parts.map(p => esc(p.name || "Refacción")).join(", ")}</p>`
          : ""}
      </div>

      <table>
        <tr><td>Total de la orden</td><td style="text-align:right">${money(total)}</td></tr>
        <tr><td>Total pagado</td><td style="text-align:right">${money(paid)}</td></tr>
        <tr><td><strong>Saldo</strong></td><td style="text-align:right"><strong>${money(balance)}</strong></td></tr>
      </table>

      <div style="margin-top:20px;border:1px solid #ddd;padding:14px">
        <p style="margin-top:0"><strong>Garantía:</strong> ${esc(data.warranty ?? 0)} días</p>
        <p style="font-size:12px;margin-bottom:0">
          La garantía aplica al servicio realizado y/o refacciones especificadas en la orden,
          sujeta a revisión del equipo. No cubre daños posteriores ajenos al servicio realizado.
        </p>
      </div>

      <div style="margin-top:18px">
        <p><strong>Entregado por:</strong> ${esc(data.delivered_by || "—")}</p>
        <p><strong>Fecha y hora de entrega:</strong> ${esc(cashDate(data.delivered_at))}</p>
        ${data.notes ? `<p><strong>Notas de entrega:</strong><br>${esc(data.notes)}</p>` : ""}
      </div>

      ${Array.isArray(data.photos) && data.photos.length ? photoEvidenceHtml(data.photos, true) : ""}

      <div style="display:flex;gap:50px;margin-top:55px">
        <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">Entregó TC iSolutions</div>
        <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">Recibió cliente</div>
      </div>

      <div style="margin-top:20px;font-size:12px;opacity:.65;text-align:center">
        Comprobante digital emitido por TC iSolutions
      </div>
    </div>`;
}

function sendDeliveryReceiptWhatsApp(order, parts = [], photos = [], delivery = {}) {
  const phone = normalizeWhatsAppPhone(order.phone);

  if (!phone) {
    alert("Esta orden no tiene un teléfono/WhatsApp registrado.");
    return;
  }

  const total = +order.total || 0;
  const paid = +order.deposit || 0;
  const balance = Math.max(0, total - paid);
  const receiptUrl = buildDeliveryReceiptShareUrl(order, parts, photos, delivery);

  const message = [
    `Hola ${order.client || "cliente"}.`,
    "",
    "*TC iSolutions - Comprobante de entrega*",
    `Orden: ${order.folio || "—"}`,
    `Equipo: ${(order.brand || "") + " " + (order.model || "")}`.trim(),
    `Total: ${money(total)}`,
    `Total pagado: ${money(paid)}`,
    `Saldo: ${money(balance)}`,
    `Garantía: ${order.warranty ?? 0} días`,
    "",
    `Ver comprobante digital: ${receiptUrl}`,
    "",
    "Gracias por tu preferencia."
  ].join("\n");

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!whatsappWindow) window.location.href = url;
}


function printDeliveryReceipt(order) {
  const node = $("#deliveryReceiptPrint");
  if (!node) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana de impresión.");
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Entrega ${esc(order.folio || "")} - TC iSolutions</title>
      <style>
        * { box-sizing:border-box; }
        body { font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:24px;font-size:14px; }
        h1,h2,h3 { margin-top:0; }
        p { line-height:1.45; }
        table { width:100%;border-collapse:collapse; }
        td,th { padding:8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top; }
        .grid { display:grid;grid-template-columns:1fr 1fr;gap:24px; }
        @media print { body { padding:0; } }
        @media (max-width:650px) { .grid { grid-template-columns:1fr; } }
      </style>
    </head>
    <body>
      ${node.innerHTML}
      <script>window.onload = () => window.print();<\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}


function printServiceOrder() {

  const node =
    $("#serviceOrderPrint");

  if (!node) return;

  const printWindow =
    window.open("", "_blank");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana de impresión.");
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Orden de servicio</title>
      <style>
        * { box-sizing:border-box; }
        body {
          font-family:Arial,Helvetica,sans-serif;
          color:#111;
          margin:0;
          padding:24px;
          font-size:14px;
        }
        h1,h2,h3 { margin-top:0; }
        p { line-height:1.45; }
        table {
          width:100%;
          border-collapse:collapse;
        }
        th,td {
          padding:8px;
          border-bottom:1px solid #ddd;
          text-align:left;
          vertical-align:top;
        }
        .grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:24px;
        }
        .empty {
          padding:14px;
          border:1px dashed #bbb;
        }
        @media print {
          body { padding:0; }
        }
        @media (max-width:650px) {
          .grid { grid-template-columns:1fr; }
        }
      </style>
    </head>
    <body>
      ${node.innerHTML}
      <script>
        window.onload = () => {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}


/* =========================
   DASHBOARD
========================= */

async function home() {

    setActiveMenu("home");

  await load();

  $("#title").textContent =
    "Dashboard";

  $("#content").innerHTML = `

    <div class="cards">

      <div class="card">
        Activos
        <strong>
          ${
            orders.filter(
              o => o.status !== "Entregado"
            ).length
          }
        </strong>
      </div>

      <div class="card">
        En reparación
        <strong>
          ${
            orders.filter(
              o => o.status === "En reparación"
            ).length
          }
        </strong>
      </div>

      <div class="card">
        Listos
        <strong>
          ${
            orders.filter(
              o =>
                o.status ===
                "Listo para entregar"
            ).length
          }
        </strong>
      </div>

      <div class="card">
        Total órdenes
        <strong>
          ${orders.length}
        </strong>
      </div>

    </div>

    <div class="box">

      <h3>
        Órdenes recientes
      </h3>

      ${table(
        orders.slice(0, 8)
      )}

    </div>
  `;

  bind();
}


/* =========================
   PANTALLA ÓRDENES
========================= */

async function ordersView() {

     setActiveMenu("orders");

  await load();

  $("#title").textContent =
    "Órdenes";

  $("#content").innerHTML = `

    <div class="box">

      <h3>
        Órdenes de servicio
      </h3>

      ${table(orders)}

    </div>
  `;

  bind();
}


/* =========================
   CLIENTES
========================= */

async function clientsView() {

   setActiveMenu("clients");

  $("#title").textContent =
    "Clientes";

  $("#content").innerHTML = `

    <div class="box">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        flex-wrap:wrap;
        margin-bottom:15px;
      ">

        <h3 style="margin:0">
          Clientes
        </h3>

        <div style="
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        ">

          <input
            id="clientSearch"
            placeholder="Buscar cliente..."
            style="
              width:230px;
              max-width:100%;
            "
          >

          <button
            id="addClient"
            class="primary">
            + Nuevo cliente
          </button>

        </div>

      </div>

      <div id="clientsList">

        <div class="empty">
          Cargando clientes...
        </div>

      </div>

    </div>
  `;


  const { data, error } = await sb
    .from("clients")
    .select("*")
    .order("name", {
      ascending: true
    });


  if (error) {

    $("#clientsList").innerHTML = `
      <div class="empty">
        Error al cargar clientes:
        ${esc(error.message)}
      </div>
    `;

    return;
  }


  const clients = data || [];


  function renderClients(list) {

    if (!list.length) {

      $("#clientsList").innerHTML = `
        <div class="empty">
          Sin clientes registrados
        </div>
      `;

      return;
    }


    $("#clientsList").innerHTML = `

      <table>

        <tr>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>WhatsApp</th>
          <th>Correo</th>
          <th></th>
        </tr>

        ${list.map(c => `

          <tr>

            <td>
              <strong>
                ${esc(c.name)}
              </strong>
            </td>

            <td>
              ${esc(c.phone)}
            </td>

            <td>
              ${esc(c.whatsapp)}
            </td>

            <td>
              ${esc(c.email)}
            </td>

            <td>

              <button
                class="clientHistory"
                data-id="${c.id}">
                Expediente
              </button>

              ${
                profile.role !== "tecnico"
                  ? `
                    <button
                      class="editClient"
                      data-id="${c.id}">
                      Editar
                    </button>
                  `
                  : ""
              }

            </td>

          </tr>

        `).join("")}

      </table>
    `;


    document
      .querySelectorAll(
        ".clientHistory"
      )
      .forEach(button => {

        button.onclick = () => {

          const client =
            clients.find(
              c =>
                c.id ===
                button.dataset.id
            );

          clientHistory(client);
        };

      });


    document
      .querySelectorAll(
        ".editClient"
      )
      .forEach(button => {

        button.onclick = () => {

          const client =
            clients.find(
              c =>
                c.id ===
                button.dataset.id
            );

          clientEditor(client);
        };

      });
  }


  renderClients(clients);


  $("#clientSearch").oninput =
    event => {

      const q =
        event.target.value
          .trim()
          .toLowerCase();

      const filtered =
        clients.filter(c =>

          String(c.name || "")
            .toLowerCase()
            .includes(q) ||

          String(c.phone || "")
            .toLowerCase()
            .includes(q) ||

          String(c.whatsapp || "")
            .toLowerCase()
            .includes(q) ||

          String(c.email || "")
            .toLowerCase()
            .includes(q)

        );

      renderClients(filtered);
    };


  $("#addClient").onclick = () => {

    if (profile.role === "tecnico") {

      alert(
        "El técnico no puede crear clientes."
      );

      return;
    }

    clientEditor();
  };
}


/* =========================
   CREAR / EDITAR CLIENTE
========================= */


function clientEditor(client = {}) {

  $("#title").textContent =
    client.id
      ? "Editar cliente"
      : "Nuevo cliente";


  $("#content").innerHTML = `

    <div class="box">

      <h3>
        ${
          client.id
            ? "Editar cliente"
            : "Nuevo cliente"
        }
      </h3>

      <form id="clientForm">

        <input
          type="hidden"
          name="id"
          value="${esc(client.id || "")}"
        >


        <div class="grid">

          <label>
            Nombre
            <input
              name="name"
              required
              value="${esc(client.name || "")}"
            >
          </label>


          <label>
            Teléfono
            <input
              name="phone"
              value="${esc(client.phone || "")}"
            >
          </label>


          <label>
            WhatsApp
            <input
              name="whatsapp"
              value="${esc(client.whatsapp || "")}"
            >
          </label>


          <label>
            Correo
            <input
              name="email"
              type="email"
              value="${esc(client.email || "")}"
            >
          </label>

        </div>


        <label>
          Dirección
          <input
            name="address"
            value="${esc(client.address || "")}"
          >
        </label>


        <label>
          Notas
          <textarea
            name="notes"
          >${esc(client.notes || "")}</textarea>
        </label>


        <div class="actions">

          <button
            type="button"
            id="cancelClient">
            Cancelar
          </button>

          <button
            type="submit"
            class="primary">
            Guardar
          </button>

        </div>

      </form>

    </div>
  `;


  $("#cancelClient").onclick =
    clientsView;


  $("#clientForm").onsubmit =
    async event => {

      event.preventDefault();


      const formData =
        Object.fromEntries(
          new FormData(
            event.currentTarget
          )
        );


      const id =
        formData.id;

      delete formData.id;


      /* =========================
         LIMPIAR DATOS
      ========================= */

      Object.keys(formData)
        .forEach(key => {

          if (
            typeof formData[key] ===
            "string"
          ) {

            formData[key] =
              formData[key].trim();

          }


          if (formData[key] === "") {

            formData[key] = null;

          }

        });


      /* =========================
         VALIDAR NOMBRE
      ========================= */

      if (!formData.name) {

        alert(
          "Escribe el nombre del cliente."
        );

        return;
      }


      /* =========================
         TELÉFONO / WHATSAPP
      ========================= */

      // Si solamente escribió WhatsApp,
      // también lo guardamos como teléfono.

      if (
        !formData.phone &&
        formData.whatsapp
      ) {

        formData.phone =
          formData.whatsapp;

      }


      // Si solamente escribió teléfono,
      // también lo guardamos como WhatsApp.

      if (
        !formData.whatsapp &&
        formData.phone
      ) {

        formData.whatsapp =
          formData.phone;

      }


      // Debe existir al menos uno.

      if (
        !formData.phone &&
        !formData.whatsapp
      ) {

        alert(
          "Ingresa un teléfono o WhatsApp."
        );

        return;
      }


      /* =========================
         GUARDAR EN SUPABASE
      ========================= */

      let error;


      if (id) {

        // EDITAR CLIENTE EXISTENTE

        ({ error } =
          await sb
            .from("clients")
            .update(formData)
            .eq("id", id));

      } else {

        // CREAR CLIENTE NUEVO

        ({ error } =
          await sb
            .from("clients")
            .insert(formData));

      }


      /* =========================
         ERROR
      ========================= */

      if (error) {

        alert(
          "No se pudo guardar el cliente: " +
          error.message
        );

        return;
      }


      /* =========================
         GUARDADO CORRECTAMENTE
      ========================= */

      alert(
        id
          ? "Cliente actualizado correctamente."
          : "Cliente creado correctamente."
      );


      clientsView();

    };

}


/* =========================
   EXPEDIENTE DEL CLIENTE
========================= */

async function clientHistory(client) {

  if (!client) {
    return;
  }


  $("#title").textContent =
    client.name;


  $("#content").innerHTML = `

    <div class="box">

      <button
        id="backClients">
        ← Clientes
      </button>

      <h2 style="margin-top:18px">
        ${esc(client.name)}
      </h2>

      <p>
        <strong>Teléfono:</strong>
        ${esc(client.phone) || "—"}
      </p>

      <p>
        <strong>WhatsApp:</strong>
        ${esc(client.whatsapp) || "—"}
      </p>

      <p>
        <strong>Correo:</strong>
        ${esc(client.email) || "—"}
      </p>

      <p>
        <strong>Dirección:</strong>
        ${esc(client.address) || "—"}
      </p>

      <p>
        <strong>Notas:</strong>
        ${esc(client.notes) || "—"}
      </p>

    </div>


    <div class="box">

      <h3>
        Historial de reparaciones
      </h3>

      <div id="clientOrders">

        <div class="empty">
          Cargando historial...
        </div>

      </div>

    </div>
  `;


  $("#backClients").onclick =
    clientsView;


  const {
    data,
    error
  } = await sb
    .from("orders")
    .select("*")
    .eq(
      "client_id",
      client.id
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    $("#clientOrders").innerHTML = `
      <div class="empty">
        Error:
        ${esc(error.message)}
      </div>
    `;

    return;
  }


  $("#clientOrders").innerHTML =
    table(data || []);


  bind();
}



/* =========================
   INVENTARIO
========================= */

async function inventoryView() {

  setActiveMenu("inventory");

  $("#title").textContent = "Inventario";

  $("#content").innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:15px">
        <h3 style="margin:0">Inventario</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input id="inventorySearch" placeholder="Buscar producto..." style="width:230px;max-width:100%">
          <button id="addInventory" class="primary">+ Nuevo producto</button>
        </div>
      </div>
      <div id="inventoryList"><div class="empty">Cargando inventario...</div></div>
    </div>
  `;

  const { data, error } = await sb
    .from("inventory")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    $("#inventoryList").innerHTML =
      `<div class="empty">Error al cargar inventario: ${esc(error.message)}</div>`;
    return;
  }

  const items = data || [];

  function render(list) {
    if (!list.length) {
      $("#inventoryList").innerHTML =
        '<div class="empty">Sin productos registrados</div>';
      return;
    }

    $("#inventoryList").innerHTML = `
      <div style="overflow-x:auto">
        <table>
          <tr>
            <th>SKU</th><th>Producto</th><th>Categoría</th><th>Stock</th>
            <th>Costo</th><th>Precio</th><th>Valor</th><th></th>
          </tr>
          ${list.map(i => {
            const low = (+i.stock || 0) <= (+i.min_stock || 0);
            return `
              <tr>
                <td>${esc(i.sku) || "—"}</td>
                <td><strong>${esc(i.name)}</strong><br><small>${esc(i.brand) || ""} ${esc(i.compatible_models) || ""}</small></td>
                <td>${esc(i.category) || "—"}</td>
                <td><strong>${esc(i.stock)}</strong>${low ? ' <span title="Stock bajo">⚠️</span>' : ""}<br><small>Mín. ${esc(i.min_stock)}</small></td>
                <td>${money(i.cost)}</td>
                <td>${money(i.price)}</td>
                <td>${money((+i.stock || 0) * (+i.cost || 0))}</td>
                <td style="white-space:nowrap">
                  <button class="invMove" data-id="${i.id}">Movimiento</button>
                  <button class="invHistory" data-id="${i.id}">Historial</button>
                  ${profile.role !== "tecnico" ? `<button class="invEdit" data-id="${i.id}">Editar</button>` : ""}
                </td>
              </tr>`;
          }).join("")}
        </table>
      </div>
    `;

    document.querySelectorAll(".invMove").forEach(b => {
      b.onclick = () => inventoryMovement(items.find(i => i.id === b.dataset.id));
    });
    document.querySelectorAll(".invHistory").forEach(b => {
      b.onclick = () => inventoryHistory(items.find(i => i.id === b.dataset.id));
    });
    document.querySelectorAll(".invEdit").forEach(b => {
      b.onclick = () => inventoryEditor(items.find(i => i.id === b.dataset.id));
    });
  }

  render(items);

  $("#inventorySearch").oninput = e => {
    const q = e.target.value.trim().toLowerCase();
    render(items.filter(i =>
      [i.sku, i.name, i.category, i.brand, i.compatible_models, i.supplier, i.location]
        .some(v => String(v || "").toLowerCase().includes(q))
    ));
  };

  $("#addInventory").onclick = () => {
    if (profile.role === "tecnico") {
      alert("El técnico no puede crear productos.");
      return;
    }
    inventoryEditor();
  };
}

function inventoryEditor(item = {}) {
  $("#title").textContent = item.id ? "Editar producto" : "Nuevo producto";

  $("#content").innerHTML = `
    <div class="box">
      <h3>${item.id ? "Editar producto" : "Nuevo producto"}</h3>
      <form id="inventoryForm">
        <input type="hidden" name="id" value="${esc(item.id || "")}">
        <div class="grid">
          <label>SKU<input name="sku" value="${esc(item.sku || "")}"></label>
          <label>Producto<input name="name" required value="${esc(item.name || "")}"></label>
          <label>Categoría<input name="category" value="${esc(item.category || "")}"></label>
          <label>Marca<input name="brand" value="${esc(item.brand || "")}"></label>
          <label>Modelos compatibles<input name="compatible_models" value="${esc(item.compatible_models || "")}"></label>
          <label>Stock mínimo<input name="min_stock" type="number" min="0" value="${esc(item.min_stock ?? 1)}"></label>
          <label>Costo<input name="cost" type="number" min="0" step=".01" value="${esc(item.cost ?? 0)}"></label>
          <label>Precio de venta<input name="price" type="number" min="0" step=".01" value="${esc(item.price ?? 0)}"></label>
          <label>Proveedor<input name="supplier" value="${esc(item.supplier || "")}"></label>
          <label>Ubicación<input name="location" value="${esc(item.location || "")}"></label>
        </div>
        ${item.id ? `<p><strong>Existencia actual:</strong> ${esc(item.stock)}. Usa “Movimiento” para cambiar stock.</p>` :
          `<label>Existencia inicial<input name="initial_stock" type="number" min="0" value="0"></label>`}
        <label>Notas<textarea name="notes">${esc(item.notes || "")}</textarea></label>
        <div class="actions">
          <button type="button" id="cancelInventory">Cancelar</button>
          <button type="submit" class="primary">Guardar</button>
        </div>
      </form>
    </div>`;

  $("#cancelInventory").onclick = inventoryView;

  $("#inventoryForm").onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const id = d.id;
    const initialStock = Math.max(0, parseInt(d.initial_stock || "0", 10) || 0);
    delete d.id;
    delete d.initial_stock;

    Object.keys(d).forEach(k => {
      if (typeof d[k] === "string") d[k] = d[k].trim();
      if (d[k] === "") d[k] = null;
    });

    if (!d.name) return alert("Escribe el nombre del producto.");
    d.min_stock = Math.max(0, parseInt(d.min_stock || "0", 10) || 0);
    d.cost = +d.cost || 0;
    d.price = +d.price || 0;

    let error;

    if (id) {
      ({ error } = await sb.from("inventory").update(d).eq("id", id));
    } else {
      const result = await sb.from("inventory").insert({ ...d, stock: 0 }).select().single();
      error = result.error;

      if (!error && initialStock > 0) {
        const move = await sb.rpc("inventory_move", {
          p_inventory_id: result.data.id,
          p_type: "entrada",
          p_quantity: initialStock,
          p_order_id: null,
          p_unit_cost: d.cost,
          p_reason: "Existencia inicial",
          p_notes: null
        });
        error = move.error;
      }
    }

    if (error) return alert("No se pudo guardar: " + error.message);
    inventoryView();
  };
}

function inventoryMovement(item) {
  if (!item) return;

  $("#title").textContent = "Movimiento de inventario";
  $("#content").innerHTML = `
    <div class="box">
      <button id="backInventory">← Inventario</button>
      <h3>${esc(item.name)}</h3>
      <p><strong>Stock actual:</strong> ${esc(item.stock)}</p>
      <form id="movementForm">
        <div class="grid">
          <label>Tipo
            <select name="type">
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste de existencia</option>
            </select>
          </label>
          <label>Cantidad / nueva existencia
            <input name="quantity" type="number" min="1" step="1" required>
          </label>
          <label>Costo unitario
            <input name="unit_cost" type="number" min="0" step=".01" value="${esc(item.cost ?? 0)}">
          </label>
          <label>Motivo<input name="reason" placeholder="Compra, reparación, conteo físico..."></label>
        </div>
        <label>Notas<textarea name="notes"></textarea></label>
        <div class="actions">
          <button type="button" id="cancelMovement">Cancelar</button>
          <button type="submit" class="primary">Registrar movimiento</button>
        </div>
      </form>
    </div>`;

  $("#backInventory").onclick = inventoryView;
  $("#cancelMovement").onclick = inventoryView;

  $("#movementForm").onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const quantity = parseInt(d.quantity, 10);

    if (!quantity || quantity < 1) return alert("Ingresa una cantidad válida.");

    const { error } = await sb.rpc("inventory_move", {
      p_inventory_id: item.id,
      p_type: d.type,
      p_quantity: quantity,
      p_order_id: null,
      p_unit_cost: d.unit_cost === "" ? null : (+d.unit_cost || 0),
      p_reason: d.reason.trim() || null,
      p_notes: d.notes.trim() || null
    });

    if (error) return alert("No se pudo registrar: " + error.message);
    alert("Movimiento registrado correctamente.");
    inventoryView();
  };
}

async function inventoryHistory(item) {
  if (!item) return;
  $("#title").textContent = "Historial de inventario";
  $("#content").innerHTML = `
    <div class="box">
      <button id="backInventory">← Inventario</button>
      <h3>${esc(item.name)}</h3>
      <p><strong>Stock actual:</strong> ${esc(item.stock)}</p>
      <div id="movementList"><div class="empty">Cargando movimientos...</div></div>
    </div>`;

  $("#backInventory").onclick = inventoryView;

  const { data, error } = await sb
    .from("inventory_movements")
    .select("*,orders(folio)")
    .eq("inventory_id", item.id)
    .order("created_at", { ascending: false });

  if (error) {
    $("#movementList").innerHTML = `<div class="empty">Error: ${esc(error.message)}</div>`;
    return;
  }

  const movements = data || [];
  if (!movements.length) {
    $("#movementList").innerHTML = '<div class="empty">Sin movimientos registrados</div>';
    return;
  }

  $("#movementList").innerHTML = `
    <div style="overflow-x:auto">
      <table>
        <tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Antes</th><th>Después</th><th>Orden</th><th>Motivo</th><th>Notas</th></tr>
        ${movements.map(m => `
          <tr>
            <td>${esc(new Date(m.created_at).toLocaleString("es-MX"))}</td>
            <td>${esc(m.type)}</td>
            <td>${esc(m.quantity)}</td>
            <td>${esc(m.previous_stock)}</td>
            <td>${esc(m.new_stock)}</td>
            <td>${esc(m.orders?.folio) || "—"}</td>
            <td>${esc(m.reason) || "—"}</td>
            <td>${esc(m.notes) || "—"}</td>
          </tr>`).join("")}
      </table>
    </div>`;
}




/* =========================
   EVIDENCIA FOTOGRÁFICA V7.7
========================= */

const ORDER_PHOTOS_BUCKET = "order-evidence";
let receptionPhotosDraft = [];

function photoStageLabel(stage) {
  return stage === "delivery" ? "Entrega" : "Recepción";
}

function safePhotoFileName(name) {
  const ext = String(name || "foto.jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

function photoPreviewCard(src, label = "", removeIndex = null) {
  return `
    <div style="border:1px solid #ddd;border-radius:10px;padding:7px">
      <img src="${esc(src)}" alt="${esc(label || "Evidencia")}"
        style="width:100%;height:110px;object-fit:cover;border-radius:7px;display:block">
      ${label ? `<div style="font-size:11px;margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</div>` : ""}
      ${removeIndex !== null ? `<button type="button" class="removeReceptionPhoto" data-index="${removeIndex}" style="width:100%;margin-top:6px">Quitar</button>` : ""}
    </div>`;
}

function renderReceptionPhotosPreview(existing = []) {
  const node = $("#receptionPhotosPreview");
  if (!node) return;

  const existingHtml = existing.map(p =>
    photoPreviewCard(p.public_url, "Guardada · " + photoStageLabel(p.stage))
  ).join("");

  const draftHtml = receptionPhotosDraft.map((file, index) => {
    const url = URL.createObjectURL(file);
    return photoPreviewCard(url, file.name, index);
  }).join("");

  node.innerHTML = existingHtml + draftHtml ||
    `<div class="empty" style="grid-column:1/-1">Sin fotos de recepción</div>`;

  document.querySelectorAll(".removeReceptionPhoto").forEach(btn => {
    btn.onclick = () => {
      receptionPhotosDraft.splice(+btn.dataset.index, 1);
      renderReceptionPhotosPreview(existing);
    };
  });
}

async function getOrderPhotos(orderId) {
  const { data, error } = await sb
    .from("order_photos")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw new Error("No se pudieron cargar las fotos: " + error.message);
  return (data || []).map(photo => ({
    ...photo,
    stage: String(photo.stage || "").trim().toLowerCase()
  }));
}

async function uploadOrderPhotos(orderId, stage, files) {
  const list = Array.from(files || []);
  if (!list.length) return [];

  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("La sesión expiró. Inicia sesión nuevamente.");

  const uploaded = [];

  for (const file of list) {
    if (!String(file.type || "").startsWith("image/")) {
      throw new Error(`"${file.name}" no es una imagen válida.`);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`"${file.name}" supera el límite de 10 MB.`);
    }

    const path = `${orderId}/${stage}/${safePhotoFileName(file.name)}`;

    const { error: uploadError } = await sb.storage
      .from(ORDER_PHOTOS_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined
      });

    if (uploadError) {
      throw new Error("No se pudo subir " + file.name + ": " + uploadError.message);
    }

    const { data: publicData } = sb.storage
      .from(ORDER_PHOTOS_BUCKET)
      .getPublicUrl(path);

    const row = {
      order_id: orderId,
      stage,
      storage_path: path,
      public_url: publicData.publicUrl,
      created_by: user.id
    };

    const { data: inserted, error: rowError } = await sb
      .from("order_photos")
      .insert(row)
      .select("*")
      .single();

    if (rowError) {
      await sb.storage.from(ORDER_PHOTOS_BUCKET).remove([path]);
      throw new Error("La foto subió, pero no pudo vincularse a la orden: " + rowError.message);
    }

    uploaded.push(inserted);
  }

  return uploaded;
}

function normalizePhotoUrl(photo) {
  const direct = String(photo?.public_url || "").trim();
  if (direct) return direct;

  const path = String(photo?.storage_path || "").trim();
  if (!path) return "";

  const { data } = sb.storage
    .from(ORDER_PHOTOS_BUCKET)
    .getPublicUrl(path);

  return data?.publicUrl || "";
}

function photoEvidenceHtml(photos = [], publicMode = false) {
  const normalized = (photos || []).map(p => ({
    ...p,
    _url: normalizePhotoUrl(p)
  }));

  const reception = normalized.filter(p => p.stage === "reception");
  const delivery = normalized.filter(p => p.stage === "delivery");

  const group = (title, list) => `
    <div style="margin-top:18px">
      <h3>${title} <small style="font-weight:400;opacity:.65">(${list.length})</small></h3>
      ${
        list.length
          ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">
              ${list.map(p => p._url ? `
                <a href="${esc(p._url)}" target="_blank" rel="noopener noreferrer"
                  title="Abrir fotografía"
                  style="display:block;border:1px solid #ddd;border-radius:10px;padding:6px;text-decoration:none;color:inherit">
                  <img src="${esc(p._url)}" alt="${esc(title)}" loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
                    style="width:100%;height:135px;object-fit:cover;border-radius:7px;display:block">
                  <div style="display:none;padding:14px 6px;font-size:12px">
                    No se pudo mostrar la miniatura. Toca aquí para abrir la fotografía.
                  </div>
                </a>` : `<div class="empty">Foto registrada, pero sin URL disponible.</div>`).join("")}
            </div>`
          : `<div class="empty">Sin fotografías</div>`
      }
    </div>`;

  return `
    <div style="border-top:1px solid #ddd;margin-top:22px;padding-top:4px">
      <h2 style="margin-top:16px">Evidencia fotográfica</h2>
      ${group("Estado al recibir", reception)}
      ${group("Estado al entregar", delivery)}
    </div>`;
}

/* =========================
   CAJA
========================= */

const cashDate = value =>
  value
    ? new Date(value).toLocaleString("es-MX")
    : "—";

const cashTypeLabel = type => ({
  anticipo: "Anticipo",
  pago: "Pago de orden",
  ingreso: "Ingreso",
  gasto: "Gasto"
}[type] || type || "—");

const cashMethodLabel = method => ({
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  otro: "Otro"
}[method] || method || "—");


async function getOpenCashSession() {
  const { data, error } = await sb
    .from("cash_sessions")
    .select("*")
    .eq("status", "abierta")
    .order("opened_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return (data || [])[0] || null;
}


async function getCashMovements(sessionId) {
  if (!sessionId) return [];

  const { data, error } = await sb
    .from("cash_movements")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}


function cashSummary(session, movements) {
  const sum = (filter) =>
    movements
      .filter(filter)
      .reduce((total, m) => total + (+m.amount || 0), 0);

  const incomes = sum(m =>
    ["anticipo", "pago", "ingreso"].includes(m.type)
  );

  const expenses = sum(m => m.type === "gasto");

  const cashIn = sum(m =>
    m.payment_method === "efectivo" &&
    ["anticipo", "pago", "ingreso"].includes(m.type)
  );

  const cashOut = sum(m =>
    m.payment_method === "efectivo" &&
    m.type === "gasto"
  );

  const transfer = sum(m =>
    m.payment_method === "transferencia" &&
    ["anticipo", "pago", "ingreso"].includes(m.type)
  );

  const card = sum(m =>
    m.payment_method === "tarjeta" &&
    ["anticipo", "pago", "ingreso"].includes(m.type)
  );

  const expected =
    (+session?.opening_amount || 0) +
    cashIn -
    cashOut;

  return {
    incomes,
    expenses,
    cashIn,
    cashOut,
    transfer,
    card,
    expected,
    net: incomes - expenses
  };
}


async function cashView() {

setActiveMenu("cash");

  $("#title").textContent = "Caja";

  if (profile?.role !== "admin") {
    $("#content").innerHTML =
      '<div class="box"><div class="empty">Solo el administrador puede acceder a Caja.</div></div>';
    return;
  }

  $("#content").innerHTML =
    '<div class="box"><div class="empty">Cargando caja...</div></div>';

  let session;
  let movements = [];

  try {
    session = await getOpenCashSession();
    if (session) movements = await getCashMovements(session.id);
    await load();
  } catch (error) {
    $("#content").innerHTML =
      `<div class="box"><div class="empty">Error al cargar Caja: ${esc(error.message)}</div></div>`;
    return;
  }

  if (!session) {
    $("#content").innerHTML = `
      <div class="box" style="max-width:650px">
        <h2>Abrir caja</h2>
        <p>No hay una caja abierta. Registra el fondo inicial para comenzar.</p>

        <form id="cashOpenForm">
          <label>
            Fondo inicial en efectivo
            <input name="opening_amount" type="number" min="0" step=".01" value="0" required>
          </label>

          <label>
            Notas de apertura
            <textarea name="notes" placeholder="Opcional"></textarea>
          </label>

          <div class="actions">
            <button type="submit" class="primary">Abrir caja</button>
          </div>
        </form>

        <div style="margin-top:18px">
          <button id="cashHistoryBtn">Ver cierres anteriores</button>
        </div>
      </div>
    `;

    $("#cashOpenForm").onsubmit = async event => {
      event.preventDefault();
      const d = Object.fromEntries(new FormData(event.currentTarget));

      const { error } = await sb.rpc("cash_open", {
        p_opening_amount: +d.opening_amount || 0,
        p_notes: d.notes || null
      });

      if (error) {
        alert("No se pudo abrir la caja: " + error.message);
        return;
      }

      alert("Caja abierta correctamente.");
      cashView();
    };

    $("#cashHistoryBtn").onclick = cashHistoryView;
    return;
  }

  const summary = cashSummary(session, movements);

  const pendingOrders =
    orders.filter(o =>
      Math.max(
        0,
        (+o.total || 0) -
        (+o.deposit || 0)
      ) > 0
    );

  const orderMap =
    new Map(
      orders.map(o => [o.id, o])
    );

  $("#content").innerHTML = `
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:15px;flex-wrap:wrap">
        <div>
          <h2 style="margin-bottom:5px">Caja abierta</h2>
          <div><strong>Apertura:</strong> ${esc(cashDate(session.opened_at))}</div>
          <div><strong>Fondo inicial:</strong> ${money(session.opening_amount)}</div>
          ${session.opening_notes ? `<div><strong>Notas:</strong> ${esc(session.opening_notes)}</div>` : ""}
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="cashChargeBtn" class="primary">+ Cobrar orden</button>
          <button id="cashIncomeBtn">+ Ingreso</button>
          <button id="cashExpenseBtn">+ Gasto</button>
          <button id="cashHistoryBtn">Historial de cajas</button>
          <button id="cashCloseBtn" class="primary">Cerrar caja</button>
        </div>
      </div>
    </div>

    <div class="cards">
      <div class="card">Ingresos<strong>${money(summary.incomes)}</strong></div>
      <div class="card">Gastos<strong>${money(summary.expenses)}</strong></div>
      <div class="card">Efectivo esperado<strong>${money(summary.expected)}</strong></div>
      <div class="card">Neto<strong>${money(summary.net)}</strong></div>
    </div>

    <div class="cards">
      <div class="card">Efectivo recibido<strong>${money(summary.cashIn)}</strong></div>
      <div class="card">Transferencias<strong>${money(summary.transfer)}</strong></div>
      <div class="card">Tarjeta<strong>${money(summary.card)}</strong></div>
      <div class="card">Salidas en efectivo<strong>${money(summary.cashOut)}</strong></div>
    </div>

    <div class="box">
      <h3>Cobrar órdenes pendientes</h3>
      ${
        pendingOrders.length
          ? `
            <div style="overflow-x:auto">
              <table>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Pagado</th>
                  <th>Saldo</th>
                  <th></th>
                </tr>
                ${pendingOrders.map(o => {
                  const balance = Math.max(
                    0,
                    (+o.total || 0) -
                    (+o.deposit || 0)
                  );
                  return `
                    <tr>
                      <td>${esc(o.folio)}</td>
                      <td>${esc(o.client)}</td>
                      <td>${money(o.total)}</td>
                      <td>${money(o.deposit)}</td>
                      <td><strong>${money(balance)}</strong></td>
                      <td>
                        <button class="cashPayOrder" data-id="${o.id}">
                          Cobrar
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </table>
            </div>
          `
          : '<div class="empty">No hay órdenes con saldo pendiente.</div>'
      }
    </div>

    <div class="box">
      <h3>Movimientos de la caja actual</h3>
      ${
        movements.length
          ? `
            <div style="overflow-x:auto">
              <table>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Orden</th>
                  <th>Método</th>
                  <th>Importe</th>
                  <th></th>
                </tr>
                ${movements.map(m => {
                  const o = orderMap.get(m.order_id);
                  return `
                    <tr>
                      <td>${esc(cashDate(m.created_at))}</td>
                      <td>${esc(cashTypeLabel(m.type))}</td>
                      <td>
                        ${esc(m.concept)}
                        ${m.notes ? `<br><small>${esc(m.notes)}</small>` : ""}
                      </td>
                      <td>${esc(o?.folio || "—")}</td>
                      <td>${esc(cashMethodLabel(m.payment_method))}</td>
                      <td>
                        <strong>
                          ${m.type === "gasto" ? "-" : ""}
                          ${money(m.amount)}
                        </strong>
                      </td>
                      <td>
                        ${m.order_id && ["anticipo","pago"].includes(m.type)
                          ? `<button class="cashReceiptBtn" data-movement="${m.id}" data-order="${m.order_id}">Recibo</button>`
                          : ""}
                      </td>
                    </tr>
                  `;
                }).join("")}
              </table>
            </div>
          `
          : '<div class="empty">Todavía no hay movimientos.</div>'
      }
    </div>
  `;

  $("#cashChargeBtn").onclick =
    cashOrderFinderView;

  $("#cashIncomeBtn").onclick =
    () => cashManualMovement("ingreso");

  $("#cashExpenseBtn").onclick =
    () => cashManualMovement("gasto");

  $("#cashCloseBtn").onclick =
    () => cashCloseView(session, summary);

  $("#cashHistoryBtn").onclick =
    cashHistoryView;

  document
    .querySelectorAll(".cashPayOrder")
    .forEach(button => {
      button.onclick = () => {
        const order =
          orders.find(o => o.id === button.dataset.id);

        if (order) cashOrderPaymentView(order);
      };
    });

  document.querySelectorAll(".cashReceiptBtn").forEach(button => {
    button.onclick = () => {
      const movement = movements.find(m => String(m.id) === String(button.dataset.movement));
      const order = orders.find(o => String(o.id) === String(button.dataset.order));
      if (movement && order) paymentReceiptView(order, movement, cashView);
    };
  });
}


async function cashOrderFinderView() {
  $("#title").textContent = "Cobrar orden";
  $("#content").innerHTML = `
    <div class="box">
      <button id="backCash">← Caja</button>
      <h2 style="margin-top:18px">Buscar orden para cobrar</h2>
      <p>Busca por folio, cliente, teléfono, IMEI/serie, marca o modelo.</p>
      <input id="cashOrderSearch" placeholder="Ej. TC-1024, Juan, 443..., iPhone 13..." style="width:100%;max-width:650px">
      <div id="cashOrderResults" style="margin-top:16px"><div class="empty">Escribe para buscar una orden.</div></div>
    </div>`;

  $("#backCash").onclick = cashView;

  try {
    await load();
  } catch (error) {
    $("#cashOrderResults").innerHTML = `<div class="empty">Error: ${esc(error.message)}</div>`;
    return;
  }

  const input = $("#cashOrderSearch");
  const results = $("#cashOrderResults");

  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '<div class="empty">Escribe para buscar una orden.</div>';
      return;
    }

    const found = orders.filter(o => {
      const balance = Math.max(0, (+o.total || 0) - (+o.deposit || 0));
      if (balance <= 0) return false;
      return [o.folio, o.client, o.phone, o.imei, o.brand, o.model]
        .some(v => String(v || "").toLowerCase().includes(q));
    }).slice(0, 50);

    if (!found.length) {
      results.innerHTML = '<div class="empty">No se encontraron órdenes con saldo pendiente.</div>';
      return;
    }

    results.innerHTML = `
      <div style="overflow-x:auto">
        <table>
          <tr><th>Folio</th><th>Cliente</th><th>Equipo</th><th>IMEI / Serie</th><th>Total</th><th>Pagado</th><th>Saldo</th><th></th></tr>
          ${found.map(o => {
            const balance = Math.max(0, (+o.total || 0) - (+o.deposit || 0));
            return `<tr>
              <td>${esc(o.folio || "—")}</td>
              <td>${esc(o.client || "—")}<br><small>${esc(o.phone || "")}</small></td>
              <td>${esc(o.brand || "")} ${esc(o.model || "")}</td>
              <td>${esc(o.imei || "—")}</td>
              <td>${money(o.total)}</td>
              <td>${money(o.deposit)}</td>
              <td><strong>${money(balance)}</strong></td>
              <td><button class="cashFinderPay" data-id="${o.id}">Cobrar</button></td>
            </tr>`;
          }).join("")}
        </table>
      </div>`;

    results.querySelectorAll(".cashFinderPay").forEach(button => {
      button.onclick = () => {
        const order = orders.find(o => o.id === button.dataset.id);
        if (order) cashOrderPaymentView(order);
      };
    });
  };

  input.oninput = render;
  setTimeout(() => input.focus(), 50);
}


function cashManualMovement(type) {
  const isExpense = type === "gasto";

  $("#title").textContent =
    isExpense ? "Registrar gasto" : "Registrar ingreso";

  $("#content").innerHTML = `
    <div class="box" style="max-width:700px">
      <button id="backCash">← Caja</button>
      <h2 style="margin-top:18px">
        ${isExpense ? "Nuevo gasto" : "Nuevo ingreso"}
      </h2>

      <form id="cashMovementForm">
        <label>
          Concepto
          <input name="concept" required placeholder="${isExpense ? "Ej. compra de material" : "Ej. venta mostrador"}">
        </label>

        <div class="grid">
          <label>
            Importe
            <input name="amount" type="number" min=".01" step=".01" required>
          </label>

          <label>
            Método de pago
            <select name="payment_method">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </select>
          </label>
        </div>

        <label>
          Notas
          <textarea name="notes" placeholder="Opcional"></textarea>
        </label>

        <div class="actions">
          <button type="button" id="cancelCashMovement">Cancelar</button>
          <button type="submit" class="primary">Guardar movimiento</button>
        </div>
      </form>
    </div>
  `;

  $("#backCash").onclick = cashView;
  $("#cancelCashMovement").onclick = cashView;

  $("#cashMovementForm").onsubmit = async event => {
    event.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(event.currentTarget)
      );

    const { error } = await sb.rpc("cash_move", {
      p_type: type,
      p_amount: +d.amount || 0,
      p_payment_method: d.payment_method,
      p_concept: d.concept,
      p_order_id: null,
      p_notes: d.notes || null
    });

    if (error) {
      alert("No se pudo guardar el movimiento: " + error.message);
      return;
    }

    alert(isExpense ? "Gasto registrado." : "Ingreso registrado.");
    cashView();
  };
}


function cashOrderPaymentView(order) {
  const balance =
    Math.max(
      0,
      (+order.total || 0) -
      (+order.deposit || 0)
    );

  $("#title").textContent =
    "Cobrar " + (order.folio || "");

  $("#content").innerHTML = `
    <div class="box" style="max-width:750px">
      <button id="backCash">← Caja</button>

      <h2 style="margin-top:18px">Cobro de orden</h2>

      <p><strong>Folio:</strong> ${esc(order.folio || "—")}</p>
      <p><strong>Cliente:</strong> ${esc(order.client || "—")}</p>

      <div class="cards">
        <div class="card">Total<strong>${money(order.total)}</strong></div>
        <div class="card">Pagado<strong>${money(order.deposit)}</strong></div>
        <div class="card">Saldo<strong>${money(balance)}</strong></div>
      </div>

      <form id="cashOrderPaymentForm">
        <div class="grid">
          <label>
            Importe a cobrar
            <input
              name="amount"
              type="number"
              min=".01"
              max="${balance}"
              step=".01"
              value="${balance.toFixed(2)}"
              required
            >
          </label>

          <label>
            Método de pago
            <select name="payment_method">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </select>
          </label>
        </div>

        <label>
          Notas
          <textarea name="notes" placeholder="Opcional"></textarea>
        </label>

        <div class="actions">
          <button type="button" id="cancelCashPayment">Cancelar</button>
          <button type="submit" class="primary">Registrar pago</button>
        </div>
      </form>
    </div>
  `;

  $("#backCash").onclick = cashView;
  $("#cancelCashPayment").onclick = cashView;

  $("#cashOrderPaymentForm").onsubmit = async event => {
    event.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(event.currentTarget)
      );

    const amount = +d.amount || 0;

    if (amount <= 0 || amount > balance) {
      alert("El importe debe ser mayor a cero y no superar el saldo.");
      return;
    }

    const { error } = await sb.rpc("cash_order_payment", {
      p_order_id: order.id,
      p_amount: amount,
      p_payment_method: d.payment_method,
      p_notes: d.notes || null
    });

    if (error) {
      alert("No se pudo registrar el pago: " + error.message);
      return;
    }

    await load();

    const { data: receiptRows } = await sb
      .from("cash_movements")
      .select("*")
      .eq("order_id", order.id)
      .eq("type", "pago")
      .order("created_at", { ascending: false })
      .limit(1);

    const receiptMovement = (receiptRows || [])[0] || {
      order_id: order.id,
      type: "pago",
      amount,
      payment_method: d.payment_method,
      notes: d.notes || null,
      created_at: new Date().toISOString()
    };

    const updatedOrder = orders.find(o => o.id === order.id) || {
      ...order,
      deposit: (+order.deposit || 0) + amount
    };

    paymentReceiptView(updatedOrder, receiptMovement, cashView, true);
  };
}


function paymentReceiptView(order, movement, backView = cashView, justPaid = false) {
  const total = +order.total || 0;
  const paid = +order.deposit || 0;
  const balance = Math.max(0, total - paid);
  const amount = +movement.amount || 0;
  const receiptNo = movement.id
    ? String(movement.id).slice(0, 8).toUpperCase()
    : "NUEVO";

  $("#title").textContent = "Recibo de pago";

  $("#content").innerHTML = `
    <div class="box" style="max-width:850px;margin:0 auto">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px">
        <button id="backPaymentReceipt">← Caja</button>
        <button id="printPaymentReceipt" class="primary">Imprimir / Guardar PDF</button>
        <button id="whatsappPaymentReceipt" class="primary">Enviar recibo por WhatsApp</button>
        <button id="viewDigitalPaymentReceipt">Ver recibo digital</button>
      </div>

      ${justPaid ? `<div class="empty" style="margin-bottom:15px"><strong>Pago registrado correctamente.</strong> Ya puedes imprimir o guardar el recibo.</div>` : ""}

      <div id="paymentReceiptPrint">
        <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:18px">
          <div>
            <h1 style="margin:0 0 4px">TC iSolutions</h1>
            <div>Recibo de pago</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:20px;font-weight:700">${esc(order.folio || "—")}</div>
            <div><strong>Recibo:</strong> ${esc(receiptNo)}</div>
            <div>${esc(cashDate(movement.created_at))}</div>
          </div>
        </div>

        <div class="grid" style="margin-bottom:18px">
          <div>
            <h3>Cliente</h3>
            <p><strong>Nombre:</strong> ${esc(order.client || "—")}</p>
            <p><strong>Teléfono:</strong> ${esc(order.phone || "—")}</p>
          </div>
          <div>
            <h3>Equipo</h3>
            <p><strong>Equipo:</strong> ${esc(order.brand || "")} ${esc(order.model || "")}</p>
            <p><strong>IMEI / Serie:</strong> ${esc(order.imei || "—")}</p>
          </div>
        </div>

        <div style="border:1px solid #ddd;padding:16px;margin:18px 0">
          <div style="font-size:13px">Importe recibido</div>
          <div style="font-size:30px;font-weight:700;margin:5px 0">${money(amount)}</div>
          <div><strong>Método:</strong> ${esc(cashMethodLabel(movement.payment_method))}</div>
          ${movement.notes ? `<div style="margin-top:6px"><strong>Notas:</strong> ${esc(movement.notes)}</div>` : ""}
        </div>

        <table>
          <tr><td>Total de la orden</td><td style="text-align:right">${money(total)}</td></tr>
          <tr><td>Total pagado</td><td style="text-align:right">${money(paid)}</td></tr>
          <tr><td><strong>Saldo restante</strong></td><td style="text-align:right"><strong>${money(balance)}</strong></td></tr>
        </table>

        <div style="margin-top:20px;font-size:12px;opacity:.8">
          Comprobante de pago correspondiente a la orden ${esc(order.folio || "—")}.
        </div>

        <div style="display:flex;gap:50px;margin-top:55px">
          <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
            TC iSolutions
          </div>
          <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
            Cliente
          </div>
        </div>
      </div>
    </div>
  `;

  $("#backPaymentReceipt").onclick = backView;
  $("#printPaymentReceipt").onclick = () => printPaymentReceipt(order);
  $("#whatsappPaymentReceipt").onclick = () => sendPaymentReceiptWhatsApp(order, movement);
  $("#viewDigitalPaymentReceipt").onclick = async () => {
    const shareUrl = await buildPaymentReceiptShareUrl(order, movement);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };
}

function normalizeWhatsAppPhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  // México: un número local de 10 dígitos se convierte a 52 + número.
  if (digits.length === 10) digits = "52" + digits;

  // Formato mexicano antiguo 521 + 10 dígitos: WhatsApp usa 52 + 10 dígitos.
  if (digits.length === 13 && digits.startsWith("521")) {
    digits = "52" + digits.slice(3);
  }

  return digits;
}

function paymentReceiptShareData(order, movement) {
  return {
    v: 1,
    folio: order.folio || "—",
    client: order.client || "Cliente",
    phone: order.phone || "",
    brand: order.brand || "",
    model: order.model || "",
    imei: order.imei || "",
    total: +order.total || 0,
    paid: +order.deposit || 0,
    amount: +movement.amount || 0,
    method: cashMethodLabel(movement.payment_method),
    notes: movement.notes || "",
    receipt: movement.id ? String(movement.id).slice(0, 8).toUpperCase() : "NUEVO",
    date: cashDate(movement.created_at),
    photos: []
  };
}

async function paymentReceiptShareDataWithPhotos(order, movement) {
  const data = paymentReceiptShareData(order, movement);

  if (!order.id) return data;

  try {
    const photos = await getOrderPhotos(order.id);
    data.photos = photos.map(p => ({
      stage: p.stage,
      public_url: p.public_url
    }));
  } catch (error) {
    console.error("No se pudieron adjuntar fotos al recibo digital:", error);
  }

  return data;
}

function encodeReceiptPayload(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeReceiptPayload(value) {
  try {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (_) {
    return null;
  }
}

async function buildPaymentReceiptShareUrl(order, movement) {
  if (!movement?.id) {
    throw new Error("El movimiento no tiene ID; no se puede generar el recibo público.");
  }

  const base = location.href.split("#")[0].split("?")[0];
  return `${base}?r=${encodeURIComponent(movement.id)}`;
}

async function getPublicPaymentReceiptById(receiptId) {
  const { data, error } = await sb.rpc("public_payment_receipt", {
    p_movement_id: receiptId
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    v: 2,
    folio: row.folio || "—",
    client: row.client || "Cliente",
    phone: row.phone || "",
    brand: row.brand || "",
    model: row.model || "",
    imei: row.imei || "",
    total: +row.total || 0,
    paid: +row.paid || 0,
    amount: +row.amount || 0,
    method: cashMethodLabel(row.payment_method),
    notes: row.payment_notes || "",
    receipt: row.receipt_no || String(receiptId).slice(0, 8).toUpperCase(),
    date: cashDate(row.payment_created_at),
    photos: Array.isArray(row.photos) ? row.photos : []
  };
}

function renderPublicReceiptError(message) {
  document.title = "Recibo - TC iSolutions";
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");

  const nav = document.querySelector("nav");
  if (nav) nav.classList.add("hidden");

  const aside = document.querySelector("aside");
  if (aside) aside.classList.add("hidden");

  const header = document.querySelector("header");
  if (header) header.classList.add("hidden");

  $("#title").textContent = "Recibo digital";
  $("#content").innerHTML = `
    <div class="box" style="max-width:700px;margin:30px auto">
      <h2>No se pudo abrir el recibo</h2>
      <div class="empty">${esc(message || "El enlace no es válido o el recibo ya no está disponible.")}</div>
    </div>
  `;
}

function renderPublicPaymentReceipt(data) {
  const balance = Math.max(0, (+data.total || 0) - (+data.paid || 0));
  document.title = `Recibo ${data.receipt || ""} - TC iSolutions`;
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");
  const nav = document.querySelector("nav");
  if (nav) nav.classList.add("hidden");
  const aside = document.querySelector("aside");
  if (aside) aside.classList.add("hidden");
  const header = document.querySelector("header");
  if (header) header.classList.add("hidden");
  $("#title").textContent = "Recibo digital";
  $("#content").innerHTML = `
    <div class="box" style="max-width:760px;margin:30px auto">
      <div id="paymentReceiptPrint">
        <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:18px">
          <div><h1 style="margin:0 0 4px">TC iSolutions</h1><div>Recibo digital de pago</div></div>
          <div style="text-align:right"><div style="font-size:20px;font-weight:700">${esc(data.folio || "—")}</div><div><strong>Recibo:</strong> ${esc(data.receipt || "—")}</div><div>${esc(data.date || "")}</div></div>
        </div>
        <div class="grid" style="margin-bottom:18px">
          <div><h3>Cliente</h3><p><strong>Nombre:</strong> ${esc(data.client || "—")}</p><p><strong>Teléfono:</strong> ${esc(data.phone || "—")}</p></div>
          <div><h3>Equipo</h3><p><strong>Equipo:</strong> ${esc(data.brand || "")} ${esc(data.model || "")}</p><p><strong>IMEI / Serie:</strong> ${esc(data.imei || "—")}</p></div>
        </div>
        <div style="border:1px solid #ddd;padding:16px;margin:18px 0"><div style="font-size:13px">Importe recibido</div><div style="font-size:30px;font-weight:700;margin:5px 0">${money(data.amount)}</div><div><strong>Método:</strong> ${esc(data.method || "—")}</div>${data.notes ? `<div style="margin-top:6px"><strong>Notas:</strong> ${esc(data.notes)}</div>` : ""}</div>
        <table><tr><td>Total de la orden</td><td style="text-align:right">${money(data.total)}</td></tr><tr><td>Total pagado</td><td style="text-align:right">${money(data.paid)}</td></tr><tr><td><strong>Saldo restante</strong></td><td style="text-align:right"><strong>${money(balance)}</strong></td></tr></table>
        ${Array.isArray(data.photos) && data.photos.length ? photoEvidenceHtml(data.photos, true) : ""}
        <div style="margin-top:20px;font-size:12px;opacity:.8">Comprobante de pago correspondiente a la orden ${esc(data.folio || "—")}.</div>
      </div>
    
      <div style="margin-top:20px;font-size:12px;opacity:.65;text-align:center">
        Recibo digital emitido por TC iSolutions
      </div>
    </div>`;

 }

function sendPublicPaymentReceiptWhatsApp(data) {
  const phone = normalizeWhatsAppPhone(data.phone);

  if (!phone) {
    alert("Este recibo no tiene un teléfono/WhatsApp registrado.");
    return;
  }

  const total = +data.total || 0;
  const paid = +data.paid || 0;
  const balance = Math.max(0, total - paid);
  const amount = +data.amount || 0;
  const receiptNo = data.receipt || "—";
  const receiptUrl = location.href;

  const message = [
    `Hola ${data.client || "cliente"}.`,
    "",
    "*TC iSolutions - Recibo de pago*",
    `Orden: ${data.folio || "—"}`,
    `Recibo: ${receiptNo}`,
    `Pago recibido: ${money(amount)}`,
    `Método: ${data.method || "—"}`,
    `Total de la orden: ${money(total)}`,
    `Total pagado: ${money(paid)}`,
    `Saldo restante: ${money(balance)}`,
    "",
    `Ver recibo digital: ${receiptUrl}`,
    "",
    "Gracias por tu preferencia."
  ].join("\n");

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!whatsappWindow) window.location.href = url;
}

async function sendPaymentReceiptWhatsApp(order, movement) {
  const phone = normalizeWhatsAppPhone(order.phone);

  if (!phone) {
    alert("Esta orden no tiene un teléfono/WhatsApp registrado.");
    return;
  }

  const total = +order.total || 0;
  const paid = +order.deposit || 0;
  const balance = Math.max(0, total - paid);
  const amount = +movement.amount || 0;
  const receiptNo = movement.id
    ? String(movement.id).slice(0, 8).toUpperCase()
    : "NUEVO";

  const message = [
    `Hola ${order.client || "cliente"}.`,
    "",
    "*TC iSolutions - Recibo de pago*",
    `Orden: ${order.folio || "—"}`,
    `Recibo: ${receiptNo}`,
    `Pago recibido: ${money(amount)}`,
    `Método: ${cashMethodLabel(movement.payment_method)}`,
    `Total de la orden: ${money(total)}`,
    `Total pagado: ${money(paid)}`,
    `Saldo restante: ${money(balance)}`,
    "",
    `Ver recibo digital: ${await buildPaymentReceiptShareUrl(order, movement)}`,
    "",
    "Gracias por tu preferencia."
  ].join("\n");

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(url, "_blank", "noopener,noreferrer");
async function sendServiceOrderWhatsApp(order) {

  const phone = normalizeWhatsAppPhone(order.phone);

  if (!phone) {
    alert("Esta orden no tiene un teléfono/WhatsApp registrado.");
    return;
  }

  const total = +order.total || 0;
  const anticipo = +order.deposit || 0;
  const saldo = Math.max(0, total - anticipo);

  const message = [

`Hola ${order.client}. 👋`,

"",

"*TC iSolutions*",

"",

"Tu equipo fue registrado correctamente.",

"",

`📋 Orden: ${order.folio}`,

`📱 Equipo: ${order.brand} ${order.model}`,

`🔧 Estado: ${order.status}`,

"",

"Puedes consultar el estado aquí:",

order.publicUrl,

"",

"Gracias por confiar en nosotros."

].join("\n");

  const url =
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const whatsappWindow =
    window.open(url, "_blank", "noopener,noreferrer");

  if (!whatsappWindow) {
    window.location.href = url;
  }

}

  
}


function printPaymentReceipt(order) {
  const node = $("#paymentReceiptPrint");
  if (!node) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana de impresión.");
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Recibo ${esc(order.folio || "")} - TC iSolutions</title>
      <style>
        * { box-sizing:border-box; }
        body { font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:24px;font-size:14px; }
        h1,h2,h3 { margin-top:0; }
        p { line-height:1.45; }
        table { width:100%;border-collapse:collapse; }
        td,th { padding:8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top; }
        .grid { display:grid;grid-template-columns:1fr 1fr;gap:24px; }
        @media print { body { padding:0; } }
        @media (max-width:650px) { .grid { grid-template-columns:1fr; } }
      </style>
    </head>
    <body>
      ${node.innerHTML}
      <script>window.onload = () => window.print();<\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}


function cashCloseView(session, summary) {
  $("#title").textContent = "Cerrar caja";

  $("#content").innerHTML = `
    <div class="box" style="max-width:750px">
      <button id="backCash">← Caja</button>

      <h2 style="margin-top:18px">Cierre de caja</h2>

      <div class="cards">
        <div class="card">Fondo inicial<strong>${money(session.opening_amount)}</strong></div>
        <div class="card">Efectivo esperado<strong>${money(summary.expected)}</strong></div>
        <div class="card">Ingresos<strong>${money(summary.incomes)}</strong></div>
        <div class="card">Gastos<strong>${money(summary.expenses)}</strong></div>
      </div>

      <p>
        Cuenta únicamente el <strong>efectivo físico</strong> disponible en caja.
        Transferencias y tarjeta no se incluyen en el efectivo esperado.
      </p>

      <form id="cashCloseForm">
        <label>
          Efectivo contado
          <input name="actual_cash" type="number" min="0" step=".01" required>
        </label>

        <div id="cashDifferencePreview" class="empty">
          Captura el efectivo contado para calcular la diferencia.
        </div>

        <label>
          Notas de cierre
          <textarea name="notes" placeholder="Opcional"></textarea>
        </label>

        <div class="actions">
          <button type="button" id="cancelCashClose">Cancelar</button>
          <button type="submit" class="primary">Confirmar cierre</button>
        </div>
      </form>
    </div>
  `;

  $("#backCash").onclick = cashView;
  $("#cancelCashClose").onclick = cashView;

  const actualInput =
    $("#cashCloseForm").elements["actual_cash"];

  actualInput.oninput = () => {
    const difference =
      (+actualInput.value || 0) -
      summary.expected;

    $("#cashDifferencePreview").innerHTML =
      `<strong>Diferencia:</strong> ${money(difference)}`;
  };

  $("#cashCloseForm").onsubmit = async event => {
    event.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(event.currentTarget)
      );

    const actual = +d.actual_cash;

    if (!Number.isFinite(actual) || actual < 0) {
      alert("Captura un efectivo contado válido.");
      return;
    }

    const difference = actual - summary.expected;

    const ok = confirm(
      "Efectivo esperado: " + money(summary.expected) +
      "\nEfectivo contado: " + money(actual) +
      "\nDiferencia: " + money(difference) +
      "\n\n¿Cerrar la caja?"
    );

    if (!ok) return;

    const { error } = await sb.rpc("cash_close", {
      p_actual_cash: actual,
      p_notes: d.notes || null
    });

    if (error) {
      alert("No se pudo cerrar la caja: " + error.message);
      return;
    }

    alert("Caja cerrada correctamente.");
    cashView();
  };
}


async function cashHistoryView() {
  $("#title").textContent = "Historial de cajas";

  $("#content").innerHTML =
    '<div class="box"><div class="empty">Cargando historial...</div></div>';

  const { data, error } = await sb
    .from("cash_sessions")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(50);

  if (error) {
    $("#content").innerHTML =
      `<div class="box"><div class="empty">Error: ${esc(error.message)}</div></div>`;
    return;
  }

  const sessions = data || [];

  $("#content").innerHTML = `
    <div class="box">
      <button id="backCash">← Caja</button>
      <h2 style="margin-top:18px">Historial de cajas</h2>

      ${
        sessions.length
          ? `
            <div style="overflow-x:auto">
              <table>
                <tr>
                  <th>Apertura</th>
                  <th>Cierre</th>
                  <th>Estado</th>
                  <th>Fondo</th>
                  <th>Esperado</th>
                  <th>Contado</th>
                  <th>Diferencia</th>
                  <th></th>
                </tr>
                ${sessions.map(s => `
                  <tr>
                    <td>${esc(cashDate(s.opened_at))}</td>
                    <td>${esc(cashDate(s.closed_at))}</td>
                    <td>${esc(s.status)}</td>
                    <td>${money(s.opening_amount)}</td>
                    <td>${s.expected_cash == null ? "—" : money(s.expected_cash)}</td>
                    <td>${s.actual_cash == null ? "—" : money(s.actual_cash)}</td>
                    <td>${s.difference == null ? "—" : money(s.difference)}</td>
                    <td>
                      <button class="cashSessionDetail" data-id="${s.id}">
                        Ver
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </table>
            </div>
          `
          : '<div class="empty">Todavía no hay sesiones de caja.</div>'
      }
    </div>
  `;

  $("#backCash").onclick = cashView;

  document
    .querySelectorAll(".cashSessionDetail")
    .forEach(button => {
      button.onclick = () =>
        cashSessionDetail(
          sessions.find(s => s.id === button.dataset.id)
        );
    });
}


async function cashSessionDetail(session) {
  if (!session) return;

  $("#title").textContent = "Detalle de caja";

  let movements = [];

  try {
    movements = await getCashMovements(session.id);
  } catch (error) {
    alert("No se pudieron cargar los movimientos: " + error.message);
    return;
  }

  const summary =
    cashSummary(session, movements);

  $("#content").innerHTML = `
    <div class="box">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="backCashHistory">← Historial</button>
        <button id="printCashCut" class="primary">Imprimir corte / Guardar PDF</button>
      </div>

      <div id="cashCutPrint">
      <h2 style="margin-top:18px">
        Corte de caja · ${esc(cashDate(session.opened_at))}
      </h2>

      <div class="cards">
        <div class="card">Fondo inicial<strong>${money(session.opening_amount)}</strong></div>
        <div class="card">Ingresos<strong>${money(summary.incomes)}</strong></div>
        <div class="card">Gastos<strong>${money(summary.expenses)}</strong></div>
        <div class="card">Efectivo esperado<strong>${money(session.expected_cash ?? summary.expected)}</strong></div>
      </div>

      ${
        session.status === "cerrada"
          ? `
            <div class="cards">
              <div class="card">Efectivo contado<strong>${money(session.actual_cash)}</strong></div>
              <div class="card">Diferencia<strong>${money(session.difference)}</strong></div>
              <div class="card">Transferencias<strong>${money(summary.transfer)}</strong></div>
              <div class="card">Tarjeta<strong>${money(summary.card)}</strong></div>
            </div>
          `
          : ""
      }

      <p><strong>Estado:</strong> ${esc(session.status)}</p>
      ${session.opening_notes ? `<p><strong>Notas apertura:</strong> ${esc(session.opening_notes)}</p>` : ""}
      ${session.closing_notes ? `<p><strong>Notas cierre:</strong> ${esc(session.closing_notes)}</p>` : ""}
    </div>

    <div class="box">
      <h3>Movimientos</h3>
      ${
        movements.length
          ? `
            <div style="overflow-x:auto">
              <table>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Método</th>
                  <th>Importe</th>
                  <th></th>
                </tr>
                ${movements.map(m => `
                  <tr>
                    <td>${esc(cashDate(m.created_at))}</td>
                    <td>${esc(cashTypeLabel(m.type))}</td>
                    <td>
                      ${esc(m.concept)}
                      ${m.notes ? `<br><small>${esc(m.notes)}</small>` : ""}
                    </td>
                    <td>${esc(cashMethodLabel(m.payment_method))}</td>
                    <td>
                      ${m.type === "gasto" ? "-" : ""}
                      ${money(m.amount)}
                    </td>
                    <td>
                      ${m.order_id && ["anticipo","pago"].includes(m.type)
                        ? `<button class="cashHistoryReceiptBtn" data-movement="${m.id}" data-order="${m.order_id}">Recibo</button>`
                        : ""}
                    </td>
                  </tr>
                `).join("")}
              </table>
            </div>
          `
          : '<div class="empty">Sin movimientos.</div>'
      }
    </div>
    </div>
  `;

  $("#backCashHistory").onclick =
    cashHistoryView;

  $("#printCashCut").onclick =
    () => printCashCut(session);

  document.querySelectorAll(".cashHistoryReceiptBtn").forEach(button => {
    button.onclick = async () => {
      let order = orders.find(o => String(o.id) === String(button.dataset.order));

      if (!order) {
        const { data, error } = await sb
          .from("orders")
          .select("*")
          .eq("id", button.dataset.order)
          .single();

        if (error) {
          alert("No se pudo cargar la orden del recibo: " + error.message);
          return;
        }
        order = data;
      }

      const movement = movements.find(m => String(m.id) === String(button.dataset.movement));
      if (movement && order) paymentReceiptView(order, movement, () => cashSessionDetail(session));
    };
  });
}


function printCashCut(session) {
  const node = $("#cashCutPrint");
  if (!node) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana de impresión.");
    return;
  }

  const responsible =
    profile?.full_name || "—";

  const status =
    session?.status || "—";

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Corte de caja - TC iSolutions</title>
      <style>
        * { box-sizing:border-box; }
        body {
          font-family:Arial,Helvetica,sans-serif;
          color:#111;
          margin:0;
          padding:24px;
          font-size:13px;
        }
        .header {
          display:flex;
          justify-content:space-between;
          gap:20px;
          align-items:flex-start;
          border-bottom:2px solid #111;
          padding-bottom:14px;
          margin-bottom:18px;
        }
        h1,h2,h3 { margin-top:0; }
        .meta { text-align:right; line-height:1.55; }
        .responsible {
          margin:12px 0 20px;
          padding:10px 12px;
          border:1px solid #ddd;
        }
        .cards {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:10px;
          margin:14px 0;
        }
        .card {
          border:1px solid #ddd;
          padding:10px;
        }
        .card strong {
          display:block;
          font-size:16px;
          margin-top:5px;
        }
        table {
          width:100%;
          border-collapse:collapse;
        }
        th,td {
          padding:7px;
          border-bottom:1px solid #ddd;
          text-align:left;
          vertical-align:top;
        }
        .empty {
          padding:12px;
          border:1px dashed #bbb;
        }
        @media print {
          body { padding:0; }
        }
        @media (max-width:700px) {
          .cards { grid-template-columns:1fr 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 style="margin-bottom:4px">TC iSolutions</h1>
          <div>Corte de caja</div>
        </div>
        <div class="meta">
          <div><strong>Apertura:</strong> ${esc(cashDate(session?.opened_at))}</div>
          <div><strong>Cierre:</strong> ${esc(cashDate(session?.closed_at))}</div>
          <div><strong>Estado:</strong> ${esc(status)}</div>
        </div>
      </div>

      <div class="responsible">
        <strong>Responsable que genera el corte:</strong>
        ${esc(responsible)}
      </div>

      ${node.innerHTML}

      <div style="display:flex;gap:50px;margin-top:55px">
        <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
          Responsable
        </div>
        <div style="flex:1;text-align:center;border-top:1px solid #555;padding-top:8px">
          Revisión
        </div>
      </div>

      <script>
        window.onload = () => window.print();
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}



/* =========================
   PLACEHOLDERS
========================= */

function placeholder(t) {

  $("#title").textContent = t;

  $("#content").innerHTML = `

    <div class="box">

      <div class="empty">

        ${t}:
        módulo preparado para
        la siguiente integración.

      </div>

    </div>
  `;
}


/* =========================
   NAVEGACIÓN
========================= */

document
  .querySelectorAll(
    "[data-view]"
  )
  .forEach(button => {

    button.onclick = () => {

      const views = {

        home,

        orders:
          ordersView,

        clients:
          clientsView,

        inventory:
          inventoryView,

        cash:
          cashView
      };


      const view =
        views[
          button.dataset.view
        ];


      if (view) {
        view();
      }
    };
  });


/* =========================
   FORMULARIO DE ÓRDENES
========================= */

const dlg = $("#dlg");

const form =
  $("#orderForm");


/* =========================
   REFACCIONES EN ÓRDENES
========================= */

let orderPartsDraft = [];
let originalOrderPartIds = new Set();
let inventoryForOrders = [];

async function loadInventoryForOrder() {
  const { data, error } = await sb
    .from("inventory")
    .select("id,sku,name,brand,compatible_models,stock,cost,price")
    .order("name", { ascending: true });

  if (error) {
    alert("No se pudo cargar el inventario: " + error.message);
    inventoryForOrders = [];
    return false;
  }

  inventoryForOrders = data || [];
  return true;
}

function renderOrderParts() {
  const container = $("#orderPartsList");
  const totalNode = $("#orderPartsTotal");

  if (!container) return;

  if (!orderPartsDraft.length) {
    container.innerHTML = '<div class="empty">Sin refacciones agregadas</div>';
    if (totalNode) totalNode.textContent = money(0);
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto">
      <table>
        <tr>
          <th>Refacción</th><th>Stock</th><th>Cantidad</th>
          <th>Precio</th><th>Importe</th><th></th>
        </tr>
        ${orderPartsDraft.map((p, index) => `
          <tr>
            <td><strong>${esc(p.name)}</strong><br><small>${esc(p.sku || "")} ${esc(p.brand || "")}</small></td>
            <td>${esc(p.stock)}</td>
            <td><input class="orderPartQty" data-index="${index}" type="number" min="1" step="1" value="${esc(p.quantity)}" style="width:85px"></td>
            <td><input class="orderPartPrice" data-index="${index}" type="number" min="0" step=".01" value="${esc(p.unit_price)}" style="width:110px"></td>
            <td>${money((+p.quantity || 0) * (+p.unit_price || 0))}</td>
            <td><button type="button" class="removeOrderPart" data-index="${index}">Quitar</button></td>
          </tr>
        `).join("")}
      </table>
    </div>`;

  document.querySelectorAll(".orderPartQty").forEach(input => {
    input.onchange = () => {
      const i = +input.dataset.index;
      orderPartsDraft[i].quantity = Math.max(1, parseInt(input.value, 10) || 1);
      renderOrderParts();
    };
  });

  document.querySelectorAll(".orderPartPrice").forEach(input => {
    input.onchange = () => {
      const i = +input.dataset.index;
      orderPartsDraft[i].unit_price = Math.max(0, +input.value || 0);
      renderOrderParts();
    };
  });

  document.querySelectorAll(".removeOrderPart").forEach(button => {
    button.onclick = () => {
      orderPartsDraft.splice(+button.dataset.index, 1);
      renderOrderParts();
    };
  });

  if (totalNode) {
    totalNode.textContent = money(
      orderPartsDraft.reduce((sum, p) =>
        sum + (+p.quantity || 0) * (+p.unit_price || 0), 0)
    );
  }

  updateSuggestedOrderTotal(true);
}

function openPartsPicker() {

  const picker = $("#partsPickerDlg");
  const search = $("#partsSearch");
  const results = $("#partsSearchResults");

  if (!picker || !search || !results) {
    alert("No se encontró el selector de refacciones.");
    return;
  }

  const renderResults = () => {

    const q =
      search.value
        .trim()
        .toLowerCase();

    const available =
      inventoryForOrders.filter(item =>
        !orderPartsDraft.some(
          p => p.inventory_id === item.id
        )
      );

    const filtered =
      available.filter(item => {

        if (!q) return true;

        return [
          item.sku,
          item.name,
          item.brand,
          item.compatible_models
        ].some(value =>
          String(value || "")
            .toLowerCase()
            .includes(q)
        );
      });


    if (!filtered.length) {

      results.innerHTML =
        '<div class="empty">No se encontraron refacciones disponibles</div>';

      return;
    }


    results.innerHTML = `
      <div style="overflow-x:auto;max-height:420px;overflow-y:auto">
        <table>
          <tr>
            <th>Producto</th>
            <th>Compatible</th>
            <th>Stock</th>
            <th>Costo</th>
            <th>Precio</th>
            <th></th>
          </tr>

          ${filtered.map(item => `
            <tr>
              <td>
                <strong>${esc(item.name)}</strong><br>
                <small>${esc(item.sku || "")} ${esc(item.brand || "")}</small>
              </td>
              <td>${esc(item.compatible_models) || "—"}</td>
              <td>
                <strong>${esc(item.stock)}</strong>
                ${(+item.stock || 0) <= 0 ? " ⚠️" : ""}
              </td>
              <td>${money(item.cost)}</td>
              <td>${money(item.price)}</td>
              <td>
                <button
                  type="button"
                  class="pickOrderPart"
                  data-id="${item.id}"
                  ${(+item.stock || 0) <= 0 ? "disabled" : ""}>
                  Agregar
                </button>
              </td>
            </tr>
          `).join("")}
        </table>
      </div>
    `;


    results
      .querySelectorAll(".pickOrderPart")
      .forEach(button => {

        button.onclick = () => {

          const selected =
            inventoryForOrders.find(
              item =>
                item.id ===
                button.dataset.id
            );

          if (!selected) {
            return;
          }


          if ((+selected.stock || 0) <= 0) {

            alert(
              "Esta refacción no tiene existencias."
            );

            return;
          }


          orderPartsDraft.push({
            inventory_id:
              selected.id,

            sku:
              selected.sku || "",

            name:
              selected.name,

            brand:
              selected.brand || "",

            stock:
              +selected.stock || 0,

            quantity:
              1,

            unit_cost:
              +selected.cost || 0,

            unit_price:
              +selected.price || 0
          });


          renderOrderParts();

          picker.close();
        };

      });
  };


  search.value = "";

  search.oninput =
    renderResults;


  $("#closePartsPicker").onclick =
    () => picker.close();


  renderResults();

  picker.showModal();

  setTimeout(
    () => search.focus(),
    50
  );
}


async function addOrderPart() {

  if (!inventoryForOrders.length) {

    if (
      !await loadInventoryForOrder()
    ) {
      return;
    }
  }

  openPartsPicker();
}


async function prepareOrderParts(order = null) {
  orderPartsDraft = [];
  originalOrderPartIds = new Set();

  await loadInventoryForOrder();

  if (order?.id) {
    const { data, error } = await sb
      .from("order_parts")
      .select("inventory_id,quantity,unit_cost,unit_price")
      .eq("order_id", order.id);

    if (error) {
      alert("No se pudieron cargar las refacciones: " + error.message);
    } else {
      for (const part of data || []) {
        const item = inventoryForOrders.find(i => i.id === part.inventory_id);
        if (!item) continue;

        originalOrderPartIds.add(part.inventory_id);
        orderPartsDraft.push({
          inventory_id: part.inventory_id,
          sku: item.sku || "",
          name: item.name,
          brand: item.brand || "",
          stock: +item.stock || 0,
          quantity: +part.quantity || 1,
          unit_cost: +part.unit_cost || 0,
          unit_price: +part.unit_price || 0
        });
      }
    }
  }

  renderOrderParts();
}

async function syncOrderParts(orderId) {
  const currentIds = new Set(orderPartsDraft.map(p => p.inventory_id));

  for (const inventoryId of originalOrderPartIds) {
    if (!currentIds.has(inventoryId)) {
      const { error } = await sb.rpc("order_part_set", {
        p_order_id: orderId,
        p_inventory_id: inventoryId,
        p_quantity: 0,
        p_unit_cost: 0,
        p_unit_price: 0
      });
      if (error) throw error;
    }
  }

  for (const part of orderPartsDraft) {
    const quantity = parseInt(part.quantity, 10);
    if (!quantity || quantity < 1) {
      throw new Error("Cantidad inválida para " + part.name);
    }

    const { error } = await sb.rpc("order_part_set", {
      p_order_id: orderId,
      p_inventory_id: part.inventory_id,
      p_quantity: quantity,
      p_unit_cost: +part.unit_cost || 0,
      p_unit_price: +part.unit_price || 0
    });
    if (error) throw error;
  }
}

const addOrderPartButton = $("#addOrderPart");
if (addOrderPartButton) addOrderPartButton.onclick = addOrderPart;



function orderPartsAmount() {
  return orderPartsDraft.reduce(
    (sum, p) =>
      sum +
      (+p.quantity || 0) *
      (+p.unit_price || 0),
    0
  );
}


function updateSuggestedOrderTotal(force = false) {

  const laborInput =
    form.elements["labor"];

  const totalInput =
    form.elements["total"];

  if (
    !laborInput ||
    !totalInput
  ) {
    return;
  }


  const suggested =
    (+laborInput.value || 0) +
    orderPartsAmount();


  /*
    El total sigue siendo editable.
    Lo actualizamos automáticamente
    al cambiar mano de obra/refacciones.
  */
  if (
    force ||
    !totalInput.dataset.manualTotal
  ) {

    totalInput.value =
      suggested.toFixed(2);
  }
}


function bindOrderTotalCalculator() {

  const laborInput =
    form.elements["labor"];

  const totalInput =
    form.elements["total"];


  if (laborInput) {

    laborInput.oninput = () => {
      updateSuggestedOrderTotal(true);
    };
  }


  if (totalInput) {

    totalInput.oninput = () => {
      totalInput.dataset.manualTotal = "1";
    };
  }
}

bindOrderTotalCalculator();


/* =========================
   SELECTOR DE CLIENTES
========================= */

async function prepareClientSelector(order = null) {

  const clientInput =
    form.elements["client"];

  if (!clientInput) {
    return;
  }


  let clientIdInput =
    form.elements["client_id"];

  // Conservamos la selección actual cuando recargamos
  // el catálogo de clientes desde una orden abierta.
  const currentClientName =
    clientInput.value || "";

  const currentClientId =
    clientIdInput
      ? clientIdInput.value
      : "";


  if (!clientIdInput) {

    clientIdInput =
      document.createElement(
        "input"
      );

    clientIdInput.type =
      "hidden";

    clientIdInput.name =
      "client_id";

    form.appendChild(
      clientIdInput
    );
  }


  let list =
    document.getElementById(
      "orderClientsList"
    );


  if (!list) {

    list =
      document.createElement(
        "datalist"
      );

    list.id =
      "orderClientsList";

    document.body
      .appendChild(list);
  }


  clientInput.setAttribute(
    "list",
    "orderClientsList"
  );


  const {
    data,
    error
  } = await sb
    .from("clients")
    .select(
      "id,name,phone,whatsapp,email"
    )
    .order(
      "name",
      {
        ascending: true
      }
    );


  if (error) {

    console.error(
      "No se pudieron cargar clientes:",
      error
    );

    return;
  }


  const clients =
    data || [];


  list.innerHTML =
    clients
      .map(c => `

        <option
          value="${esc(c.name)}"
          data-id="${c.id}">
          ${
            esc(
              c.phone ||
              c.whatsapp ||
              c.email ||
              ""
            )
          }
        </option>

      `)
      .join("");


  const syncClient = () => {

    const name =
      clientInput.value
        .trim()
        .toLowerCase();


    const selected =
      clients.find(c =>

        String(c.name || "")
          .trim()
          .toLowerCase() ===
        name

      );


    clientIdInput.value =
      selected
        ? selected.id
        : "";


    /*
      Si lo escrito todavía no
      coincide con un cliente
      registrado, no modificamos
      el teléfono.
    */

    if (!selected) {
      return;
    }


    /*
      El formulario actual de
      órdenes utiliza "phone"
      como WhatsApp/teléfono.
    */

    const phoneInput =
      form.elements["phone"];


    if (phoneInput) {

      phoneInput.value =
        selected.whatsapp ||
        selected.phone ||
        "";

    }


    /*
      Si en una futura versión
      agregamos un campo separado
      llamado whatsapp al formulario,
      este código ya lo soportará.
    */

    const whatsappInput =
      form.elements["whatsapp"];


    if (whatsappInput) {

      whatsappInput.value =
        selected.whatsapp ||
        selected.phone ||
        "";

    }
  };


  clientInput.oninput =
    syncClient;

  clientInput.onchange =
    syncClient;


  /*
    Si estamos editando una orden,
    mantenemos el cliente y su
    client_id existentes.
  */

  if (order) {

    clientInput.value =
      order.client || "";

    clientIdInput.value =
      order.client_id || "";

  } else if (currentClientId) {

    clientInput.value =
      currentClientName;

    clientIdInput.value =
      currentClientId;

  } else {

    clientIdInput.value = "";

  }
}


/* =========================
   NUEVA ORDEN
========================= */

$("#newOrder").onclick =
  async () => {

    form.reset();

    form.id.value = "";

    if (form.elements["labor"]) {
      form.elements["labor"].value = "0";
    }

    if (form.elements["total"]) {
      delete form.elements["total"].dataset.manualTotal;
    }

    $("#formTitle")
      .textContent =
        "Nueva orden";


    await prepareClientSelector();

    await prepareOrderParts();

    receptionPhotosDraft = [];
    const receptionInput = $("#receptionPhotosInput");
    if (receptionInput) receptionInput.value = "";
    renderReceptionPhotosPreview([]);

    dlg.showModal();
  };


$("#cancel").onclick = () =>
  dlg.close();


/* =========================
   EDITAR ORDEN
========================= */

async function edit(id) {

  const order =
    orders.find(
      x => x.id === id
    );


  if (!order) {
    return;
  }


  for (
    const [key, value]
    of Object.entries(order)
  ) {

    if (
      form.elements[key]
    ) {

      form.elements[key]
        .value =
          value ?? "";
    }
  }


  await prepareClientSelector(
    order
  );

  await prepareOrderParts(
    order
  );

  receptionPhotosDraft = [];
  const receptionInput = $("#receptionPhotosInput");
  if (receptionInput) receptionInput.value = "";

  try {
    const existingPhotos = await getOrderPhotos(order.id);
    renderReceptionPhotosPreview(existingPhotos.filter(p => p.stage === "reception"));
  } catch (photoError) {
    console.error(photoError);
    renderReceptionPhotosPreview([]);
  }

  if (form.elements["labor"]) {
    const partsAmount =
      orderPartsAmount();

    form.elements["labor"].value =
      order.labor != null
        ? (+order.labor || 0)
        : Math.max(
            0,
            (+order.total || 0) -
            partsAmount
          );
  }

  if (form.elements["total"]) {
    form.elements["total"].dataset.manualTotal = "1";
  }


  $("#formTitle")
    .textContent =
      order.folio;


  dlg.showModal();
}



const receptionPhotosInput = $("#receptionPhotosInput");

if (receptionPhotosInput) {
  receptionPhotosInput.onchange = () => {
    const incoming = Array.from(receptionPhotosInput.files || []);
    receptionPhotosDraft = [...receptionPhotosDraft, ...incoming];
    receptionPhotosInput.value = "";

    const orderId = form.elements["id"]?.value;
    if (orderId) {
      getOrderPhotos(orderId)
        .then(rows => renderReceptionPhotosPreview(rows.filter(p => p.stage === "reception")))
        .catch(() => renderReceptionPhotosPreview([]));
    } else {
      renderReceptionPhotosPreview([]);
    }
  };
}

/* =========================
   GUARDAR ORDEN
========================= */

form.onsubmit =
  async event => {

    event.preventDefault();

    const d = Object.fromEntries(new FormData(form));
    const id = d.id;
    delete d.id;

    d.total = +d.total || 0;
    d.deposit = +d.deposit || 0;

    // Mano de obra se usa para calcular el total
    // en la interfaz. No se envía a orders
    // hasta crear una columna específica.
    delete d.labor;
    d.warranty = +d.warranty || 0;

    if ("client_id" in d && !d.client_id) {
      d.client_id = null;
    }

    for (const part of orderPartsDraft) {
      if (!part.quantity || +part.quantity < 1) {
        alert("Revisa la cantidad de " + part.name);
        return;
      }
    }

    // =======================================
// V8 CORE
// Estado anterior de la orden
// =======================================

let previousOrder = null;

if (id) {

    const { data } = await sb
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    previousOrder = data;

}

    let orderId = id;
    let error;

    if (id) {
      ({ error } = await sb.from("orders").update(d).eq("id", id));
    } else {
      const { data: { user } } = await sb.auth.getUser();
      d.created_by = user.id;

      const result = await sb
        .from("orders")
        .insert(d)
        .select("id")
        .single();

      error = result.error;
      orderId = result.data?.id;
    }

    if (error) {
      alert("No se pudo guardar la orden: " + error.message);
      return;
    }

    if (!orderId) {
      alert("La orden se guardó, pero no se pudo obtener su ID para registrar las refacciones.");
      return;
    }

    try {
      await syncOrderParts(orderId);
    } catch (partsError) {
      alert("La orden se guardó, pero hubo un problema con las refacciones: " + partsError.message);
      return;
    }

    if (receptionPhotosDraft.length) {
      try {
        await uploadOrderPhotos(orderId, "reception", receptionPhotosDraft);
        receptionPhotosDraft = [];
      } catch (photoError) {
        alert("La orden se guardó, pero hubo un problema con las fotos de recepción: " + photoError.message);
        return;
      }
    }
if (!id) {

    const { data: savedOrder, error: readError } =
    await sb
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

if (readError) {

    throw readError;

}

const newOrder = savedOrder;

const publicToken =
    await PublicOrder.createPublicServiceOrder(
        sb,
        newOrder
    );

newOrder.publicToken =
    publicToken;

newOrder.publicUrl =
    PublicOrder.buildPublicServiceOrderUrl(
        publicToken
    );

    console.log("PUBLIC URL:");
console.log(newOrder.publicUrl);

try {

    await Automation.orderCreated(
        newOrder
    );

} catch (error) {

    console.error(
        "Error en Automation:",
        error
    );

}

}
// =======================================
// V8 CORE
// Detectar cambio de estado
// =======================================

if (id && previousOrder) {

    const oldStatus = previousOrder.status;

    const newStatus = d.status;

    if (oldStatus !== newStatus) {

        const updatedOrder = {

            ...previousOrder,

            ...d,

            id: orderId

        };

        await Automation.statusChanged(
            oldStatus,
            newStatus,
            updatedOrder
        );

    }

}
    
    dlg.close();
    ordersView();
  };

/* =========================
   NUEVO CLIENTE DESDE ORDEN
========================= */

const quickClientDlg =
  $("#quickClientDlg");

const quickClientForm =
  $("#quickClientForm");

const newClientFromOrder =
  $("#newClientFromOrder");

const cancelQuickClient =
  $("#cancelQuickClient");


if (newClientFromOrder) {

  newClientFromOrder.onclick = () => {

    /*
      La orden permanece abierta
      detrás del formulario.

      No usamos form.reset(),
      así que los datos de la
      reparación no se pierden.
    */

    quickClientForm.reset();

    quickClientDlg.showModal();
  };
}


if (cancelQuickClient) {

  cancelQuickClient.onclick = () => {

    quickClientDlg.close();

  };
}


if (quickClientForm) {

  quickClientForm.onsubmit =
    async event => {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            quickClientForm
          )
        );


      /*
        Limpiamos espacios.
      */

      Object.keys(data)
        .forEach(key => {

          if (
            typeof data[key] ===
            "string"
          ) {

            data[key] =
              data[key].trim();

          }

          if (data[key] === "") {
            data[key] = null;
          }

        });


      if (!data.name) {

        alert(
          "Escribe el nombre del cliente."
        );

        return;
      }


      /*
        Si no escribió WhatsApp,
        usamos teléfono.
      */

      /*
  Teléfono y WhatsApp:
  si solo se captura uno,
  usamos ese número en ambos campos.
*/

if (!data.phone && data.whatsapp) {
  data.phone = data.whatsapp;
}

if (!data.whatsapp && data.phone) {
  data.whatsapp = data.phone;
}

if (!data.phone && !data.whatsapp) {
  alert("Ingresa un teléfono o WhatsApp.");
  return;
}


      /*
        Guardamos y pedimos que
        Supabase nos devuelva el
        cliente recién creado.
      */

      const {
        data: created,
        error
      } = await sb
        .from("clients")
        .insert(data)
        .select()
        .single();


      if (error) {

        alert(
          "No se pudo crear el cliente: " +
          error.message
        );

        return;
      }


      /*
        Cerramos únicamente la
        ventana de cliente.
      */

      quickClientDlg.close();


      /*
        Volvemos a cargar el selector
        para que el cliente recién
        creado ya forme parte de
        las sugerencias.
      */

      await prepareClientSelector();


      /*
        Seleccionamos automáticamente
        al cliente nuevo.
      */

      const clientInput =
        form.elements["client"];

      const phoneInput =
        form.elements["phone"];

      const clientIdInput =
        form.elements["client_id"];


      if (clientInput) {

        clientInput.value =
          created.name || "";

      }


      if (phoneInput) {

        phoneInput.value =
          created.whatsapp ||
          created.phone ||
          "";

      }


      if (clientIdInput) {

        clientIdInput.value =
          created.id;

      }


      /*
        Regresamos a la orden.
      */

      if (!dlg.open) {
        dlg.showModal();
      }


      /*
        Continuamos donde estábamos.
      */

      const brandInput =
        form.elements["brand"];

      if (brandInput) {
        brandInput.focus();
      }

    };
}
/* =========================
   INICIO: RECIBO PÚBLICO PRIMERO
========================= */

function getPublicReceiptRequestFromLocation() {
  try {
    const params = new URLSearchParams(window.location.search);

    // Nuevo formato corto: ?r=<cash_movement_id>
    const receiptId = params.get("r");
    if (receiptId) {
      return {
        type: "id",
        value: receiptId.trim()
      };
    }

    // Compatibilidad con enlaces anteriores.
    const hash = String(window.location.hash || "");
    const match = hash.match(/^#recibo=([^&]+)$/);

    if (match && match[1]) {
      return {
        type: "payload",
        value: decodeReceiptPayload(decodeURIComponent(match[1]))
      };
    }

    const legacyReceipt = params.get("recibo");
    if (legacyReceipt) {
      return {
        type: "payload",
        value: decodeReceiptPayload(legacyReceipt)
      };
    }
  } catch (error) {
    console.error("No se pudo leer el recibo público:", error);
  }

  return null;
}

/* =========================
   ORDEN PÚBLICA
========================= */



const publicOrderToken =
    PublicOrder.getPublicOrderToken();
    console.log("TOKEN:", publicOrderToken);

if (publicOrderToken) {

    try {

        const order =
    await PublicOrder.loadPublicServiceOrder(
        sb,
        publicOrderToken
    );

    console.log("TOKEN:", publicOrderToken);
console.log("ORDEN:", order);

await loadCompany();

PublicOrder.renderPublicServiceOrder(
    order,
    COMPANY
);

        // Detener completamente la carga del ERP
        throw new Error("__PUBLIC_ORDER__");

        

    } catch (error) {

        if (error.message === "__PUBLIC_ORDER__") {

            // Ya se mostró el portal público.
            // No continuar cargando el ERP.
            throw error;

        }

        console.error(error);

        console.log("ERROR DEL PORTAL:");
console.log(error);

        document.body.innerHTML = `

            <div style="
                max-width:700px;
                margin:100px auto;
                text-align:center;
                font-family:Arial,sans-serif">

                <h1>Orden no encontrada</h1>

                <p>

                    El enlace es inválido
                    o la orden ya no existe.

                </p>

            </div>

        `;

        throw error;

    }

}
const publicReceiptRequest = getPublicReceiptRequestFromLocation();

if (publicReceiptRequest?.type === "id") {
  try {
    const publicReceipt = await getPublicPaymentReceiptById(publicReceiptRequest.value);

    if (publicReceipt) {
      renderPublicPaymentReceipt(publicReceipt);
    } else {
      renderPublicReceiptError("El recibo no existe o ya no está disponible.");
    }
  } catch (error) {
    console.error("No se pudo cargar el recibo público:", error);
    renderPublicReceiptError(
      "No fue posible consultar el recibo. Verifica que la función pública de Supabase esté instalada."
    );
  }
} else if (publicReceiptRequest?.type === "payload" && publicReceiptRequest.value) {
  renderPublicPaymentReceipt(publicReceiptRequest.value);
} else {

await loadCompany();

console.log("Empresa cargada correctamente");

const {
  data: { session }
} = await sb.auth.getSession();

if (session) {
  enter(session.user);
}
}
