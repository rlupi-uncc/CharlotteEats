"use strict";

function showError(message) {
  alert(message || "Something went wrong.");
}

async function deleteReservation(restaurantId, reservationId) {
  const res = await fetch(`/restaurants/${restaurantId}/reservations/${reservationId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = res.headers.get("content-type") || "";

  // Only treat 401 as auth failure
  if (res.status === 401) {
    throw new Error("You must be signed in to delete a reservation.");
  }

  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message || `Failed to delete reservation (${res.status}).`);
    }

    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to delete reservation (${res.status}).`);
  }

  return true;
}

document.addEventListener("submit", async (e) => {
  const form = e.target.closest(".delete-reservation-form");
  if (!form) return;

  e.preventDefault();

  const reservationId = form.dataset.reservationId;
  const restaurantId = form.dataset.restaurantId;

  if (!reservationId || !restaurantId) {
    showError("Missing reservation information.");
    return;
  }

  const confirmed = window.confirm("Are you sure you want to delete this reservation?");
  if (!confirmed) return;

  try {
    await deleteReservation(restaurantId, reservationId);

    const card = form.closest(".reservation-card");
    if (card) {
      card.remove();
    }

    const remainingCards = document.querySelectorAll(".reservation-card");
    const container = document.querySelector(".reservation-cards");

    if (container && remainingCards.length === 0) {
      container.innerHTML = `<p class="empty-state">No reservations yet.</p>`;
    }
  } catch (err) {
    showError(err.message);
  }
});