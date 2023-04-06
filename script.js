const API_KEY = "api_key=aa82421e39f5fc80120ad3edf5c08382";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500/';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

const genres = [
      {
        "id": 28,
        "name": "Action"
      },
      {
        "id": 12,
        "name": "Adventure"
      },
      {
        "id": 16,
        "name": "Animation"
      },
      {
        "id": 35,
        "name": "Comedy"
      },
      {
        "id": 80,
        "name": "Crime"
      },
      {
        "id": 99,
        "name": "Documentary"
      },
      {
        "id": 18,
        "name": "Drama"
      },
      {
        "id": 10751,
        "name": "Family"
      },
      {
        "id": 14,
        "name": "Fantasy"
      },
      {
        "id": 36,
        "name": "History"
      },
      {
        "id": 27,
        "name": "Horror"
      },
      {
        "id": 10402,
        "name": "Music"
      },
      {
        "id": 9648,
        "name": "Mystery"
      },
      {
        "id": 10749,
        "name": "Romance"
      },
      {
        "id": 878,
        "name": "Science Fiction"
      },
      {
        "id": 10770,
        "name": "TV Movie"
      },
      {
        "id": 53,
        "name": "Thriller"
      },
      {
        "id": 10752,
        "name": "War"
      },
      {
        "id": 37,
        "name": "Western"
      }
  ]

const loaderDiv = document.getElementById('loader')
const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')
const tagsEl = document.getElementById('tags')
const paginas = document.getElementById('paginas')

const prev = document.getElementById('prev')
const next = document.getElementById('next')
const current = document.getElementById('current')

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var lastUrl = '';
var totalPages = 100;

function hideLoader() {
   loaderDiv.classList.add('hide');
   main.classList.remove('hide');
   paginas.classList.remove('hide');
}
  
function showLoader() {
  loaderDiv.classList.remove('hide');
  main.classList.add('hide');
  paginas.classList.add('hide');
}

setGenre()
getMovies(API_URL)

function setGenre(){
    tagsEl.innerHTML = '';
    genres.forEach(genre => {
        let t = document.createElement('option');
        t.classList.add('tag');
        t.id = genre.id;
        t.innerText = genre.name;
        tagsEl.append(t);
    })
    
}

var selectedGenre = [];
var e = document.getElementById("tags");
function onChange() {
  var value = e.value;
  var text = e.options[e.selectedIndex].text;
  console.log(value);
  genres.forEach(genre => {
    if(genre.name == value){
        selectedGenre.push(genre.id);
    }
  })
  getMovies(API_URL + '&with_genres='+encodeURI(selectedGenre.join(',')))

}
e.onchange = onChange;
onChange();

function getMovies(url){
    lastUrl = url;
    window.onload = () => {showLoader()};
    setTimeout(()=>{hideLoader()},1000)
    fetch(url)
    .then(res=> res.json())
    .then(data=> {
      
        showMovies(data.results)
        currentPage = data.page;
        nextPage = currentPage+1;
        prevPage = currentPage-1;
        totalPages = data.total_pages;

        current.innerText = currentPage;
        if(currentPage <= 1){
          prev.classList.add('disabled')
          next.classList.remove('disabled')
        }else if(currentPage >= totalPages){
          prev.classList.remove('disabled')
          next.classList.add('disabled')
        }else{
          prev.classList.remove('disabled')
          next.classList.remove('disabled')
        }
        tagsEl.scrollIntoView({behavior: 'smooth'});
      }) 
       
}

function showMovies(data){
    main.innerHTML = '';

    data.forEach(movie => {
        const {title, poster_path,vote_average,overview,id} = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
                <img src="${poster_path? IMG_URL+ poster_path : "http://via.placeholder.com/1080x1580"}" alt="${title}">

                <div class="movie-info">
                    <h3>${title}</h3>
                    <span class="${getColor(vote_average)}">${vote_average}</span>
                </div>

                <div class="overview">
                    <h3>Overview</h3>
                    ${overview};
                    <button class="know-more" id="${id}">Know More</button>

                </div>
        `
        main.appendChild(movieEl);

        document.getElementById(id).addEventListener('click',()=>{
          openNav(movie)
        })

    })
        
}
const overlayContent = document.getElementById("overlay-content")
/* Open when someone clicks on the span element */
function openNav(movie) {
  let id = movie.id
  fetch(BASE_URL + '/movie/' +id+ '/videos?' + API_KEY)
  .then(res => res.json())
  .then(videoData => {
    console.log(videoData)
    if(videoData){
      document.getElementById("myNav").style.width = "100%"
      if(videoData.results.length > 0){
        var embed = []
        var dots = []
        videoData.results.forEach((video,idx) =>{
          let {name, key, site} = video

          if(site == 'YouTube'){
            embed.push(`<iframe width="860" height="450" src="https://www.youtube.com/embed/${key}" title="${name}" class= "embed hide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`)
          }
          dots.push(`<span class="dot">${idx+1}</span>`)
        })
        

        var content = `
        <h1 class="no results">${movie.original_title}</h1>
        <br/>
        ${embed.join('')}
        <br/>
        <div class="dots">${dots.join('')}</div>
        `

        overlayContent.innerHTML = content;
        activeSlide = 0;
        showVideos();

      }else{
        overlayContent.innerHTML = `<h1>No Results Found</h1>`
      }
    }
    
  })
  ;
}

var activeSlide = 0;
var totalVideos = 0;
function showVideos(){
  let embedClasses = document.querySelectorAll('.embed')
  let dots = document.querySelectorAll('.dot')

  totalVideos = embedClasses.length;
  embedClasses.forEach((embedTag,idx) =>{
    if(activeSlide == idx){
      embedTag.classList.add('show')
      embedTag.classList.remove('hide')
    }else{
      embedTag.classList.add('hide')
      embedTag.classList.remove('show')
    }
  })

  dots.forEach((dot,idx)=>{
    if(activeSlide == idx){
      dot.classList.add('active')
    }else{
      dot.classList.remove('active')
    }
  })
  
}

const leftArrow = document.getElementById('left-arrow')
const rightArrow = document.getElementById('right-arrow')

leftArrow.addEventListener('click', ()=>{
  if(activeSlide > 0){
    activeSlide--
  }else{
    activeSlide = totalVideos - 1
  }
  showVideos()
})

rightArrow.addEventListener('click', ()=>{
  if(activeSlide < (totalVideos - 1)){
    activeSlide++
  }else{
    activeSlide = 0
  }
  showVideos()
})

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

function getColor(vote){
    if(vote >=8){
        return 'green'
    }else if(vote >= 5 && vote <8){
        return 'orange'
    }else{
        return 'red'
    }
}

form.addEventListener('submit', (e) =>{
    e.preventDefault();

    const searchTerm = search.value;
    if(searchTerm){
        getMovies(searchURL + '&query=' + searchTerm);
    }else{
        getMovies(API_URL);
    }
});

prev.addEventListener('click', () =>{
  
  if(prevPage > 0){
    pageCall(prevPage);
  }
})

next.addEventListener('click', () =>{
  
  if(nextPage <= totalPages){
    pageCall(nextPage);
  }
})

function pageCall(page){
  let urlSplit = lastUrl.split('?')
  let queryParams = urlSplit[1].split('&')
  let key = queryParams[queryParams.length-1].split('=')
  if(key[0] != 'page'){
    let url = lastUrl + '&page=' + page
    getMovies(url)
  }else{
    console.log(key)
    console.log(urlSplit)
    console.log(queryParams)
    key[1] = page.toString()
    let a = key.join('=')
    queryParams[queryParams.length-1] = a
    let b = queryParams.join('&')
    let url = urlSplit[0] + '?' + b
    getMovies(url)

  }
}