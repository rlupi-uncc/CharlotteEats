"use strict";

const form = document.querySelector("#reservation-form");
const message = document.querySelector("#reservation-message");
const restaurantId = window.RESTAURANT_ID;

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const reservationDate = document.querySelector("#reservationDate").value;
  const reservationTime = document.querySelector("#reservationTime").value;
  const partySize = Number(document.querySelector("#partySize").value);
  const specialRequests = document.querySelector("#specialRequests").value.trim();

  try {
    const res = await fetch(`/restaurants/${restaurantId}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        reservationDate,
        reservationTime,
        partySize,
        specialRequests,
      }),
    });

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      let errMsg = "Failed to create reservation";
      if (contentType.includes("application/json")) {
        const payload = await res.json();
        errMsg = payload.message || errMsg;
      }
      throw new Error(errMsg);
    }

    message.textContent = "Reservation created successfully.";
    form.reset();
  } catch (err) {
    message.textContent = err.message;
  }
});