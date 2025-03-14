const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const playPauseBtn = document.getElementById("playPauseBtn");
const audioPlayer = document.getElementById("audioPlayer");



menu.addEventListener('click', function() {
    menu.classList.toggle('is-active')
    menuLinks.classList.toggle('active')
});

// Play/Pause functionality

let player;
let isPlaying = false;
const playlistId = "PL_OYNG3QCftMpchpSVULbI-ccKvUR2oE4"; // Replace with your actual playlist ID
const playButton = document.getElementById("play-button");
const songInfo = document.getElementById("current-song");

function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        height: "0",
        width: "0",
        playerVars: {
            listType: "playlist",
            list: playlistId,
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("YouTube Player Ready");
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        fetchSongTitle();
    }
}

function fetchSongTitle() {
    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${player.getVideoData().video_id}`)
        .then(response => response.json())
        .then(data => {
            songInfo.innerText = data.title || "Playing...";
        })
        .catch(() => {
            songInfo.innerText = "Unknown Title";
        });
}

playButton.addEventListener("click", () => {
    if (!isPlaying) {
        player.playVideo();
        playButton.innerText = "⏸ Pause";
    } else {
        player.pauseVideo();
        playButton.innerText = "▶ Play";
    }
    isPlaying = !isPlaying;
});