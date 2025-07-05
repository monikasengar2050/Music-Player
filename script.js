
console.log('Lets write JavaScript');

async function getSongs(folder) {
  const response = await fetch(`${folder}`);

  const text = await response.text();
  const div = document.createElement("div");
  div.innerHTML = text;

  const as = div.getElementsByTagName("a");
  let songs = [];

  for (let i = 0; i < as.length; i++) {
    const href = as[i].href;

    if (href.endsWith(".mp3")) {
      const parts = href.split("/");
      const file = parts[parts.length - 1];
      songs.push(`${folder}/${file}`); // this will give songs/foldername/song.mp3
    }
  }

  return songs;
}


let currentAudio = null;
let isPlaying = false;
let currentIndex = -1;
let songs = [];

async function getSongs(folder) {
  const response = await fetch(`${folder}`);
  const text = await response.text();
  const div = document.createElement("div");
  div.innerHTML = text;

  const as = div.getElementsByTagName("a");
  let result = [];

  for (let i = 0; i < as.length; i++) {
    const href = as[i].href;
    if (href.endsWith(".mp3")) {
      const parts = href.split("/");
      const file = parts[parts.length - 1];
      result.push(`${folder}/${file}`);
    }
  }

  return result;
}

function playSongByIndex(index) {
  if (index < 0 || index >= songs.length) return;

  // Stop previous audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }

  const song = songs[index];
  console.log("Trying to play:", song);

  currentAudio = new Audio(song);
  currentIndex = index;
  isPlaying = true;

  const fileName = song.split("/").pop();
  const cleanName = decodeURIComponent(fileName)
    .replace(/\.mp3$/, "")
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  document.querySelector(".songinfo").textContent = cleanName;

  currentAudio.addEventListener("canplay", () => {
    currentAudio.play().catch(err => console.error("Play error:", err));
    document.getElementById("play").src = "pause.svg";
  });

  currentAudio.addEventListener("timeupdate", () => {
    const current = currentAudio.currentTime;
    const duration = currentAudio.duration;

    if (!isNaN(duration)) {
      const progressPercent = (current / duration) * 100;
      document.querySelector(".circle").style.left = `${progressPercent}%`;
      document.querySelector(".songtime").textContent =
        `${formatTime(current)} / ${formatTime(duration)}`;
    }
  });

  currentAudio.addEventListener("ended", () => {
    if (currentIndex < songs.length - 1) {
      playSongByIndex(currentIndex + 1);
    } else {
      isPlaying = false;
      document.getElementById("play").src = "play.svg";
    }
  });
}

async function loadPlaylist(folder) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }

  isPlaying = false;
  currentIndex = -1;
  document.getElementById("play").src = "play.svg";

  songs = await getSongs("songs/" + folder);
  const songList = document.querySelector(".songList ul");
  songList.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    const fileName = song.split('/').pop();

    let cleanName = decodeURIComponent(fileName)
      .replace(/\.mp3$/, "")
      .replace(/[_\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    li.innerHTML = `
      <img class="invert" src="music.svg" alt="">
      <div class="info">
        <div>${cleanName}</div>
        <div>Monika</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="play.svg" alt="">
      </div>
    `;

    li.addEventListener("click", () => {
      playSongByIndex(index);
    });

    songList.appendChild(li);
  });
}

// Attach event listeners ONCE
document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");
  const seekbar = document.querySelector(".seekbar");
  const muteBtn = document.getElementById("muteBtn");
  const volumeSlider = document.getElementById("volumeSlider");

  playBtn.addEventListener("click", () => {
    if (!currentAudio || currentAudio.readyState < 2) return;

    if (isPlaying) {
      currentAudio.pause();
      isPlaying = false;
      playBtn.src = "play.svg";
    } else {
      currentAudio.play();
      isPlaying = true;
      playBtn.src = "pause.svg";
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      playSongByIndex(currentIndex - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
      playSongByIndex(currentIndex + 1);
    }
  });

  seekbar.addEventListener("click", (e) => {
    if (!currentAudio || isNaN(currentAudio.duration)) return;

    const rect = seekbar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;

    currentAudio.currentTime = percent * currentAudio.duration;
  });

  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      if (currentAudio) {
        const volume = parseFloat(volumeSlider.value);
        currentAudio.volume = volume;
        currentAudio.muted = volume === 0;
        muteBtn.src = currentAudio.muted ? "mute.svg" : "volume.svg";
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (!currentAudio) return;
      currentAudio.muted = !currentAudio.muted;
      muteBtn.src = currentAudio.muted ? "mute.svg" : "volume.svg";
    });
  }

  // Playlist cards
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const folder = card.getAttribute("data-playlist");
      loadPlaylist(folder);
    });
  });

  loadPlaylist("playlist1"); // Load default
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
