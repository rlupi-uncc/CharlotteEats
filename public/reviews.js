"use strict";

// const { updateSearchIndex } = require("../models/Restaurant");

const MAX_LENGTH = 200;

// Like button cooldown
const LIKE_COOLDOWN_MS = 800;

const restaurantId = window.RESTAURANT_ID;

const reviewsSection = document.querySelector(".reviews");
const addButton = document.querySelector(".new-review-btn");
const formSection = document.querySelector(".new-review-section");
const form = document.querySelector(".new-review-form");
var likeImage;

// Expect HTML inputs with these IDs:
const titleInput = document.querySelector("#title");
const ratingInput = document.querySelector("#rating");
const bodyInput = document.querySelector("#body");

// Helpers

function formatDate(value) {
  const d = value ? new Date(value) : new Date();
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

function showError(msg) {
  // minimal: alert
  alert(msg || "Something went wrong.");
}

// Rendering
function addEntry(review) {
  const article = document.createElement("article");
  article.classList.add("review");

  // Store reviewId on element (for delete)
  if (review._id) article.dataset.reviewId = review._id;

  const header = document.createElement("h3");
  header.classList.add("review-header");
  header.textContent = review.title && review.title.trim() ? review.title : "Review";
  article.append(header);

  // author + date line
  const meta = document.createElement("p");
  const author = review.authorName ? `by ${review.authorName}` : "";
  const date = review.createdAt ? formatDate(review.createdAt) : formatDate(review.date);
  meta.textContent = [author, date].filter(Boolean).join(" • ");
  
  // Add avatar next to author name if author exists
  if (review.authorName) {
    const avatar = document.createElement("img");
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.authorName)}&background=6495ED&color=fff&size=24&font-size=0.4`;
    avatar.alt = `${review.authorName} avatar`;
    avatar.classList.add("review-avatar");
    avatar.style.width = "24px";
    avatar.style.height = "24px";
    avatar.style.borderRadius = "50%";
    avatar.style.marginRight = "8px";
    avatar.style.verticalAlign = "middle";
    
    // Insert avatar at the beginning of the meta paragraph
    meta.insertBefore(avatar, meta.firstChild);
  }
  
  article.append(meta);

  // rating line
  if (typeof review.rating === "number") {
    const ratingLine = document.createElement("p");
    ratingLine.textContent = `Rating: ${review.rating}/5`;
    article.append(ratingLine);
  }

  const contentP = document.createElement("p");
  article.append(contentP);

  const content = review.body ?? review.content ?? "";
  if (content.length > MAX_LENGTH) {
    contentP.textContent = content.substring(0, MAX_LENGTH);

    const spanDots = document.createElement("span");
    spanDots.textContent = "...";
    contentP.appendChild(spanDots);

    const spanHidden = document.createElement("span");
    spanHidden.classList.add("hide");
    spanHidden.textContent = content.substring(MAX_LENGTH);
    contentP.appendChild(spanHidden);

    const readButton = document.createElement("button");
    readButton.textContent = "Read More";
    readButton.classList.add("more-less-btn");
    article.appendChild(readButton);
  } else {
    contentP.textContent = content;
  }

  // Add Like Button
  likeImage = document.createElement("img");
  likeImage.src = "img/reviewicon/unliked-thumbs-up.jpg";
  likeImage.classList.add("img", "like-btn");
  likeImage.dataset.likes = review.likes ?? 0;

  likeImage.src = "img/reviewicon/unliked-thumbs-up.jpg";

  header.append(likeImage);

  const alreadyLiked = (review.likedBy || [])
    .map(String)
    .includes(String(window.CURRENT_USER_ID));

  if (alreadyLiked) {
    likeImage.src = "img/reviewicon/liked-thumbs-up.jpg";
  } else {
    likeImage.src = "img/reviewicon/unliked-thumbs-up.jpg";
  }

  // Remove Like Button from Current User's Review
  if (
    review._id &&
    review.userId &&
    window.CURRENT_USER_ID &&
    String(review.userId) === String(window.CURRENT_USER_ID)
  ) {
    header.removeChild(likeImage);
  }

  // likes section
  if (typeof review.likes === "number") {
    const likesLine = document.createElement("p");
    likesLine.classList.add("likes-line");
    likesLine.textContent = `Likes: ${review.likes}`;
    article.append(likesLine);
  }

  // delete button 
  if (
    review._id &&
    review.userId &&
    window.CURRENT_USER_ID &&
    String(review.userId) === String(window.CURRENT_USER_ID)
  ) {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "[x]";
    removeBtn.classList.add("delete-btn");
    header.append(removeBtn);
  }

  reviewsSection.append(article);
}

function clearReviewsUI() {
  // Keep the section title, remove review articles
  // If your section contains only title + reviews, simplest is:
  const nodes = Array.from(reviewsSection.querySelectorAll("article.review"));
  nodes.forEach((n) => n.remove());
}

// API calls
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error("Not authenticated (redirected). Please log in.");
  }

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch (_) { }
    const msg = payload?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

async function loadReviews(restaurantId) {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") || "newest";
  const data = await apiFetch(`/restaurants/${restaurantId}/reviews?sort=${sort}`);
  clearReviewsUI();
  (data || []).forEach(addEntry);
}

async function createReview(restaurantId, review) {
  return apiFetch(`/restaurants/${restaurantId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
}

async function deleteReview(restaurantId, reviewId) {
  return apiFetch(`/restaurants/${restaurantId}/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

async function updateReviewLikes(restaurantId, reviewId) {
  return apiFetch(`/restaurants/${restaurantId}/reviews/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ likes: 1, userId: window.CURRENT_USER_ID }),
  });
}

// UI Events
function formState() {
  formSection.classList.toggle("hide");
}

addButton?.addEventListener("click", formState);

// Handle submit properly
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!restaurantId) return showError("Missing restaurant id for reviews page.");

  if (!form.reportValidity()) return;

  const title = titleInput?.value?.trim() ?? "";
  const rating = Number(ratingInput?.value);
  const body = bodyInput?.value?.trim() ?? "";

  try {
    const created = await createReview(restaurantId, { title, rating, body });

    // reset fields
    if (titleInput) titleInput.value = "";
    if (ratingInput) ratingInput.value = "";
    if (bodyInput) bodyInput.value = "";

    formSection.classList.add("hide");

    await loadReviews(restaurantId);
  } catch (err) {
    showError(err.message);
  }
});

// Delete + Read More/Less handler
reviewsSection.addEventListener("click", async (e) => {

  if (e.target.classList.contains("more-less-btn")) {
    const paragraph = e.target.previousElementSibling;
    const spans = paragraph.querySelectorAll("span");
    spans.forEach((s) => s.classList.toggle("hide"));
    e.target.textContent = e.target.textContent === "Read More" ? "Read Less" : "Read More";
    return;
  }

  // Delete
  if (e.target.classList.contains("delete-btn")) {
    if (!restaurantId) return showError("Missing restaurant id for reviews page.");

    const article = e.target.closest(".review");
    const reviewId = article?.dataset?.reviewId;
    if (!reviewId) return showError("Missing review id.");

    try {
      await deleteReview(restaurantId, reviewId);
      article.remove();
    } catch (err) {
      showError(err.message);
    }
  }

  // Like Review
  if (e.target.classList.contains("like-btn")) {
    const likeBtn = e.target;
    const article = likeBtn.closest(".review");
    const reviewId = article?.dataset?.reviewId;
    if (!reviewId) return;

    // prevent spam clicks while request is in flight or cooldown is active
    if (likeBtn.dataset.coolingDown === "true") return;
    likeBtn.dataset.coolingDown = "true";
    likeBtn.style.pointerEvents = "none";
    likeBtn.style.opacity = "0.6";

    const isLiked =
      likeBtn.src.includes("liked-thumbs-up.jpg") &&
      !likeBtn.src.includes("unliked-thumbs-up.jpg");

    try {
      const updatedReview = await updateReviewLikes(restaurantId, reviewId);

      likeBtn.dataset.likes = updatedReview.likes;

      const likesLine = article.querySelector(".likes-line");
      if (likesLine) {
        likesLine.textContent = `Likes: ${updatedReview.likes}`;
      }

      const nowLiked = (updatedReview.likedBy || [])
        .map(String)
        .includes(String(window.CURRENT_USER_ID));

      likeBtn.src = nowLiked
        ? "/img/reviewicon/liked-thumbs-up.jpg"
        : "/img/reviewicon/unliked-thumbs-up.jpg";
    } catch (err) {
      showError(err.message);
    } finally {
      setTimeout(() => {
        likeBtn.dataset.coolingDown = "false";
        likeBtn.style.pointerEvents = "";
        likeBtn.style.opacity = "";
      }, LIKE_COOLDOWN_MS);
    }
  }
});

// Initial load
(async function init() {
  if (!restaurantId) {
    // If you haven't wired restaurantId into the page yet, you'll hit this.
    // Add ?id=<restaurantId> to the reviews page link.
    console.warn("No restaurant id found in URL. Add ?id=<restaurantId> to the reviews page.");
    return;
  }

  try {
    await loadReviews(restaurantId);
  } catch (err) {
    showError(err.message);
  }
})();