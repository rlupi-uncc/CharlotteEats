"use strict";

const form = document.querySelector("#reservation-form");
const message = document.querySelector("#reservation-message");
const restaurantId = window.RESTAURANT_ID;

// Show login link
function showLoginMessage() {
  message.innerHTML = `
    <span>You must be logged in to make a reservation. </span>
    <a href="/login" class="login-link">Sign in here</a>
  `;
}

// Show success
function showSuccess() {
  message.textContent = "Reservation created successfully.";
}

// Show generic error
function showError(msg) {
  message.textContent = msg || "Something went wrong.";
}

// API call
async function createReservation(data) {
  const res = await fetch(`/restaurants/${restaurantId}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const contentType = res.headers.get("content-type") || "";

  // If redirected to login (HTML response)
  if (contentType.includes("text/html")) {
    throw new Error("NOT_AUTHENTICATED");
  }

  // Handle non-OK responses
  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const payload = await res.json().catch(() => null);

      // Explicit 401 or auth message
      if (res.status === 401) {
        throw new Error("NOT_AUTHENTICATED");
      }

      throw new Error(payload?.message || "Failed to create reservation");
    }

    throw new Error("Failed to create reservation");
  }

  return res.json();
}

// Form submit handler
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!restaurantId) {
    return showError("Missing restaurant id.");
  }

  if (!form.reportValidity()) return;

  const reservationDate = document.querySelector("#reservationDate").value;
  const reservationTime = document.querySelector("#reservationTime").value;
  const partySize = Number(document.querySelector("#partySize").value);
  const specialRequests = document.querySelector("#specialRequests").value.trim();

  try {
    await createReservation({
      reservationDate,
      reservationTime,
      partySize,
      specialRequests,
    });

    showSuccess();
    form.reset();
  } catch (err) {
    if (err.message === "NOT_AUTHENTICATED") {
      showLoginMessage();
    } else {
      showError(err.message);
    }
  }
});