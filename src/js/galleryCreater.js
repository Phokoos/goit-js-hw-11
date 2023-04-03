'use strict';

// Import API for fetchPhotos  
import { fetchPhotos } from './fetchPixabay';
// Import Notiflix
import Notiflix from 'notiflix';
// Import SimpleLightbox
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

const galleryDivEl = document.querySelector(".gallery");
const formEl = document.querySelector(".search-form");
const formInputEl = document.querySelector(".search-form__input");
caches;
// const loadMoreBtnEl = document.querySelector(".load-more");
const loaderEl = document.querySelector(".loader");


// Vars for datas
let latesInputValue;
let loadMoreValue;
let totalPhotoInWindow = 40;
let totalCountOfPhotosFromApi;


// Work with Infinite Scrolling


function requestToApiAfterScrolling() {
	const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

		if (clientHeight + scrollTop >= scrollHeight) {
			console.log("Requests to API");
			loaderEl.classList.add('show');

			anotherRequestsToApi(formInputEl.value, loadMoreValue);

			// Page += 1;
			console.log(`We load ${loadMoreValue} page for you`);
			loadMoreValue += 1;
			totalPhotoInWindow += 40;
			
		   if (totalPhotoInWindow >= totalCountOfPhotosFromApi) {
				window.removeEventListener('scroll', requestToApiAfterScrolling);
				return Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
			}
		}
}


function loadMoreInfiniteScrolling() {
	window.addEventListener('scroll', requestToApiAfterScrolling);
}

formEl.addEventListener("submit", (action) => {
	action.preventDefault();

	//  Checking similar values
	if (latesInputValue === formInputEl.value) {
		return 
	}

	window.removeEventListener('scroll', requestToApiAfterScrolling);

	galleryDivEl.innerHTML = "";
	latesInputValue = formInputEl.value;
	
	requestToApi(formInputEl.value, 1);
})

function requestToApi(name, page) {
	fetchPhotos(name, page)
		.then(data => {
			if (data.data.hits.length === 0) {
				return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
			}
			addMarkup(data.data.hits);
			showTotalHitsMessage(data.data.totalHits);
			// loadMoreInfiniteScrolling(data);
			window.addEventListener('scroll', requestToApiAfterScrolling);
			
			loadMoreValue = 2;
			totalPhotoInWindow = 40;
			totalCountOfPhotosFromApi = data.data.totalHits;
		})
}

function anotherRequestsToApi(name, page) {
	fetchPhotos(name, page)
		.then(data => {
			addMarkup(data.data.hits);
			scrollSmooth();
			loaderEl.classList.remove('show');
		})
}

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

let gallery = new SimpleLightbox('.gallery a',{
	captions: true,
	captionsData: 'alt',
	captionPosition: 'bottom',
	captionDelay: 250,
});

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