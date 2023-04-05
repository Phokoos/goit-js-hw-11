'use strict';

// Import API for fetchPhotos  
import { fetchPhotos } from './fetchPixabay';
// Import Notiflix
import Notiflix from 'notiflix';
// Import SimpleLightbox
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

// Vars for DOM elements 
const galleryDivEl = document.querySelector(".gallery");
const formEl = document.querySelector(".search-form");
const formInputEl = document.querySelector(".search-form__input");
caches;
const loaderEl = document.querySelector(".loader");


// Vars for datas
let latesInputValue;
let loadMoreValue;
let totalPhotoInWindow = 40;
let totalCountOfPhotosFromApi;

// Add SimpleLightbox to project
let gallery = new SimpleLightbox('.gallery a',{
	captions: true,
	captionsData: 'alt',
	captionPosition: 'bottom',
	captionDelay: 250,
});

// Work with Infinite Scrolling
function requestToApiAfterScrolling() {
	const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

		if (clientHeight + scrollTop >= scrollHeight) {
			loaderEl.classList.add('show');

			anotherRequestsToApi(formInputEl.value, loadMoreValue);

			// Per_page += 1;
			loadMoreValue += 1;
			totalPhotoInWindow += 40;
			
			// Cheking totalhits from photo at document
		   if (totalPhotoInWindow >= totalCountOfPhotosFromApi) {
				window.removeEventListener('scroll', requestToApiAfterScrolling);
				return Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
			}
		}
}

formEl.addEventListener("submit", (action) => {
	action.preventDefault();

	// Checking for empty values in input
	if ("" === formInputEl.value.trim()) {
		return Notiflix.Notify.failure("You don`t write any text in input form");
	}
	//  Checking similar values in input
	if (latesInputValue === formInputEl.value) {
		return 
	}

	// Renew scroll listener
	window.removeEventListener('scroll', requestToApiAfterScrolling);
	// Clear gallery, when input value is new
	galleryDivEl.innerHTML = "";
	// writing to a variable value for cheking
	latesInputValue = formInputEl.value;
	// Make first request to API
	requestToApi(formInputEl.value, 1);
})


function requestToApi(name, page) {
	fetchPhotos(name, page)
		.then(data => {
			// Checking for empty array from API
			if (data.data.hits.length === 0) {
				return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
			}
			// Add first 40-ty cards
			addMarkup(data.data.hits);
			// Show amount of photos
			showTotalHitsMessage(data.data.totalHits);
			// Add listener for infinite scrolling
			window.addEventListener('scroll', requestToApiAfterScrolling);
			
			// Work with value for checking (perPage, photos in gallery)
			loadMoreValue = 2;
			totalPhotoInWindow = 40;
			totalCountOfPhotosFromApi = data.data.totalHits;
		})
}

// All others requests to API 
function anotherRequestsToApi(name, page) {
	fetchPhotos(name, page)
		.then(data => {
			addMarkup(data.data.hits);
			scrollSmooth();
			// Show loader
			loaderEl.classList.remove('show');
		})
}

// Add markup which use data from API
function addMarkup(photosArray) {
	const photosMarkup = photosArray.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
		`<div class="photo-card">
			<a href="${largeImageURL}">
				<img class="photo-card__img"
   				src="${webformatURL}"
   				alt="${tags}"
   				width="100%"
   				loading="lazy"/></a>
  				<div class="info">
   				<div class="info-item">
						<b>Likes</b>
						<p>${likes}</p>
					</div>
    				<div class="info-item">
						<b>Views</b>
						<p>${views}</p>
    				</div>
    				<div class="info-item">
						<b>Comments</b>
						<p>${comments}</p>
    				</div>
    				<div class="info-item">
						<b>Downloads</b>
						<p>${downloads}</p>
    				</div>
  				</div>
		</div>`
	).join("");
	galleryDivEl.insertAdjacentHTML("beforeend", photosMarkup);

	gallery.refresh();
	gallery.on('show.simplelightbox');
}

function showTotalHitsMessage(totalHits) {
	Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

function scrollSmooth() {
	const { height: cardHeight } = document.querySelector(".gallery")
.firstElementChild.getBoundingClientRect();

	window.scrollBy({
  		top: cardHeight * 2,
  		behavior: "smooth",
	});
}