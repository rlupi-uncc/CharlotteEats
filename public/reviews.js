"use strict";

const addButton = document.querySelector(".new-review-btn");

function formState() {
  const sectionElement = document.querySelector(".new-review-section");
  sectionElement.classList.toggle("hide");
}

addButton.addEventListener('click', formState);

const submitButton = document.querySelector("#submit-btn");

function addReview() {
  let form = document.querySelector("form");

  if (form.reportValidity()) {
    let title = document.getElementById("review-title").value;
    let content = document.getElementById("review-content").value;

    document.getElementById("review-title").value = "";
    document.getElementById("review-content").value = "";

    let date = new Date();

    const review = { title, content, date };
    addEntry(review);
  }
}

submitButton.addEventListener('click', addReview);