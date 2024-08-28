console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder = '';

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`/${folder}/`);
    let html = await response.text();
    let div = document.createElement('div');
    div.innerHTML = html;
    let anchors = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < anchors.length; index++) {
        const element = anchors[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector('.songList ul');
    songUL.innerHTML = '';
    songs.forEach(song => {
        songUL.innerHTML += `<li data-song="${song}">
                                <img class="invert" width="34" src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll('%20', ' ')}</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert playButton" src="img/play.svg" alt="">
                                </div>
                            </li>`;
    });

    // Attach event listener to each song
    document.querySelectorAll('.songList ul li').forEach(li => {
        li.addEventListener('click', () => {
            playMusic(li.dataset.song);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.querySelector('.playButton').src = 'img/pause.svg';
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00';
}

async function displayAlbums() {
    let response = await fetch('songs');
    let html = await response.text();
    let div = document.createElement('div');
    div.innerHTML = html;
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector('.cardContainer');
    Array.from(anchors).forEach(async e => {
        if (e.href.includes('/songs') && !e.href.includes('.htaccess')) {
            let folder = e.href.split('/').slice(-2)[0];
            let metadataResponse = await fetch(`/songs/${folder}/info.json`);
            let metadata = await metadataResponse.json();
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                                            <div class="play">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                            <img src="/songs/${folder}/cover.jpg" alt="">
                                            <h2>${metadata.title}</h2>
                                            <p>${metadata.description}</p>
                                        </div>`;
        }
    });

    // Load the playlist whenever card is clicked
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs('songs');
    playMusic(songs[0], true);
    await displayAlbums();

    // Attach event listeners to play, next, and previous buttons
    document.querySelector('#play').addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector('.playButton').src = 'img/pause.svg';
        } else {
            currentSong.pause();
            document.querySelector('.playButton').src = 'img/play.svg';
        }
    });

    document.querySelector('#previous').addEventListener('click', () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.querySelector('#next').addEventListener('click', () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector('.circle').style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    // Add an event listener to seekbar
    document.querySelector('.seekbar').addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add event listener to volume control
    document.querySelector('.range input').addEventListener('input', e => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume > 0) {
            document.querySelector('.volume img').src = 'img/volume.svg';
        } else {
            document.querySelector('.volume img').src = 'img/mute.svg';
        }
    });

    // Add event listener to mute button
    document.querySelector('.volume img').addEventListener('click', () => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            document.querySelector('.range input').value = 0;
            document.querySelector('.volume img').src = 'img/mute.svg';
        } else {
            currentSong.volume = 0.5; // Example default volume when unmuted
            document.querySelector('.range input').value = 50;
            document.querySelector('.volume img').src = 'img/volume.svg';
        }
    });

    // Add event listener for hamburger menu
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    });

    // Add event listener for close button
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-130%';
    });
}

main();

//name is too big, folder name isnt showing but picture is of the dog i put.