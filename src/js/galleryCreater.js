'use strict';

// Import API for fetchPhotos  
import { fetchPhotos } from './fetchPixabay';
// Import Notiflix
import Notiflix from 'notiflix';
// Import SimpleLightbox
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";
// import InfiniteScroll
import InfiniteScroll from 'infinite-scroll';

const galleryDivEl = document.querySelector(".gallery");
const formEl = document.querySelector(".search-form");
const formInputEl = document.querySelector(".search-form__input");
caches;
const loadMoreBtnEl = document.querySelector(".load-more");

let latesInputValue;


formEl.addEventListener("submit", (action) => {
	action.preventDefault();

	//  Checking similar values
	if (latesInputValue === formInputEl.value) {
		return 
	}
	loadMoreBtnEl.style.display = "none";
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
			loadMoreBtn(data);
		})
}

function anotherRequestsToApi(name, page) {
	fetchPhotos(name, page)
		.then(data => {
			addMarkup(data.data.hits);
			scrollSmooth();
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
   			<p class="info-item">
      		<b>${likes}</b>
    			</p>
    			<p class="info-item">
      			<b>${views}</b>
    			</p>
    			<p class="info-item">
      			<b>${comments}</b>
    			</p>
    			<p class="info-item">
      			<b>${downloads}</b>
    			</p>
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

function loadMoreBtn(data) {
	let loadMoreValue = 2;
	let totalPhotoInWindow = 40;
	loadMoreBtnEl.style.display = "block";

	if (totalPhotoInWindow >= data.data.totalHits) {
			loadMoreBtnEl.style.display = "none";
			return Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
		}

	loadMoreBtnEl.addEventListener("click", () => {
		
		anotherRequestsToApi(formInputEl.value, loadMoreValue);
		loadMoreValue += 1;
		totalPhotoInWindow += 40;

		if (totalPhotoInWindow >= data.data.totalHits) {
			loadMoreBtnEl.style.display = "none";
			return Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
		}
	});
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