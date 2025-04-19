console.log("Lets write javascript");
let currentSong = new Audio();
let currfolder="Music/Shub";
let songs;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://192.168.1.36:3000/${folder}/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
        songs.push(decodeURI(element.href.split(`/${folder}/`)[1])); // decode here
      }
  }
  return songs;
  console.log("play karo", songs);
}


const playMusic = (track, pause = false) => {
    if (!track || typeof track !== "string") {
      console.error("❌ Invalid track passed to playMusic:", track);
      return;
    }
  
    // Pause any current playback
    currentSong.pause();
    currentSong.currentTime = 0;
  
    // Set new track source
    currentSong.src = `/${currfolder}/` + encodeURIComponent(track);
  
    // Load new track
    currentSong.load();
  
    // Once it's ready, then play
    currentSong.oncanplaythrough = () => {
      if (!pause) {
        currentSong.play().then(() => {
          play.src = "img/pause.svg";
        }).catch((error) => {
          console.error("⚠️ Error while trying to play:", error);
        });
      }
    };
  
    // Update UI
    const displayName = decodeURI(
      track
        .replace(/\.mp3$/i, "")
        .replaceAll("-", " ")
        .replaceAll("%20", " ")
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  
    document.querySelector(".songinfo").innerHTML = displayName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  };
  
  

 // Load the playlist whenever card is clicked
 Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      currfolder = `Music/${item.currentTarget.dataset.folder}`; // ✅ store for later
      console.log("Fetching Songs from:", currfolder);
  
     // songs = await getSongs(currfolder);
     // playMusic(songs[0]);
      await main(); 
      
    });
  });

async function main() {
    const play = document.getElementById("play");
    const next = document.getElementById("next");
    const previous = document.getElementById("previous");
   songs = await getSongs(currfolder);
  playMusic(songs[0], true);
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

    songUL.innerHTML = ""; 
  for (const song of songs) {
    const cleanedSong = song

      .replaceAll("%20", " ")

      .trim();

    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        
                    <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${cleanedSong}</div>
                        <div>Meenu</div>
                    </div>
                    <div class="playnow">
                        <span>Play now</span>
                    <img class="invert" src="img/play-button.svg" alt="">
                    </div>
              
        </li>`;
  }
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
    console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
  });
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    console.log(e);
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  previous.addEventListener("click", () => {
    currentSong.pause();
    let currentFileName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentFileName);
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });
  
  next.addEventListener("click", () => {
    currentSong.pause();
    let currentFileName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentFileName);
    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  

  // Add an event listener for hamburger

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });



}

main();
