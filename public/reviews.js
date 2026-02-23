"use strict";

const MAX_LENGTH = 200;

const reviewsSection = document.querySelector(".reviews");

const reviews = [
  {title: 'Review #1',
   date: new Date(2025, 7, 31),
   content: 'Delicious, outstading service, and one of a kind. I would have invited all my friends if I knew this was the best place ever.'},
  {title: 'Review #2',
  date: new Date(2025, 8, 9),
  content: 'Awful, confused to how anyone would pay money to eat at such a terrible so called `restaurant`'},

  {title: 'Review #3',
  date: new Date(2025, 8, 12),
  content: 'Worth trying, just needs better service!'}
]

const reviewContainer = document.querySelector(".reviews");

reviews.forEach(review=>{
  addEntry(review);
});

function addEntry(review) {
  const reviewContainer = document.createElement('article');
  reviewContainer.classList.add('review');

  const reviewHeader = document.createElement('h3');
  reviewHeader.classList.add('review-header');
  reviewHeader.textContent = review.title;
  reviewContainer.append(reviewHeader);

  const reviewDate = document.createElement('p');
  reviewDate.textContent = review.date.toLocaleDateString();
  reviewContainer.append(reviewDate);

  const reviewContent = document.createElement('p');
  reviewContainer.append(reviewContent);

  if(review.content.length > MAX_LENGTH){

    reviewContent.textContent = review.content.substring(0, MAX_LENGTH);

    const spanDots = document.createElement('span');
    spanDots.textContent = "...";
    reviewContent.appendChild(spanDots);

    let spanElement = document.createElement('span');
    spanElement.classList.add("hide");
    reviewContent.appendChild(spanElement);
    spanElement.textContent = review.content.substring(MAX_LENGTH);

    let readButton = document.createElement('button');
    readButton.textContent = "Read More";
    readButton.classList.add("more-less-btn");
    reviewContainer.appendChild(readButton); 
    
  }else{
    reviewContent.textContent = review.content;
  }

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '[x]';
  removeBtn.classList.add('delete-btn');
  reviewHeader.append(removeBtn);

  document.querySelector('.reviews').append(reviewContainer);

}

const addButton = document.querySelector(".new-review-btn");

function formState() {
  const sectionElement = document.querySelector(".new-review-section");
  sectionElement.classList.toggle("hide");
}

addButton.addEventListener('click', formState);


function deleteButton(e){

  if (e.target.classList.contains('delete-btn')){
    const element = e.target.closest(".review");

    const elementTitle = element.querySelector('.review-header').textContent.replace('[x]', ' ').trim();

    let index = reviews.findIndex((review) =>
      review.title === elementTitle);

    reviews.splice(index, 1);

    element.remove();
  }
}

reviewsSection.addEventListener('click', deleteButton);

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
    reviews.push(review);
    addEntry(review);
  }
}

submitButton.addEventListener('click', addReview);

function readButtonState(e){
  if(e.target.textContent === "Read More" || e.target.textContent === "Read Less"){

    const paragraph = e.target.previousElementSibling;

    const paragraphSpan = paragraph.querySelectorAll('span');

    paragraphSpan.forEach(spanElement => {
      spanElement.classList.toggle("hide");
    });

    if(e.target.textContent === "Read More"){
      e.target.textContent = "Read Less";
    }else{
      e.target.textContent = "Read More";
    }
  }
}

reviewsSection.addEventListener('click', readButtonState);