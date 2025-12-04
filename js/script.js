let raceAnimation = null;
let racePlayers = [];

const duckColors = ["#f87171","#facc15","#34d399","#60a5fa","#a78bfa","#fb923c","#f472b6","#4ade80"];

function showTab(tab) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  document.getElementById(tab + 'Tab').classList.add('active');
}

function rollDice(sides) {
  const roll = Math.floor(Math.random() * sides) + 1;
  document.getElementById("diceResult").innerText = `You rolled: ${roll}`;
}

function rollCustomDice() {
  const sides = parseInt(document.getElementById("customSides").value);
  if (isNaN(sides) || sides < 2) {
    document.getElementById("diceResult").innerText = "Enter a valid number of sides (min 2).";
    return;
  }
  rollDice(sides);
}

function flipCoin() {
  const coinContainer = document.getElementById("coinContainer");
  const coinResult = document.getElementById("coinResult");
  coinResult.innerText = "";
  coinContainer.classList.add("spin");
  setTimeout(() => {
    coinContainer.classList.remove("spin");
    const flip = Math.random() < 0.5 ? "Heads" : "Tails";
    coinResult.innerText = `Coin landed on: ${flip}`;
  }, 2000);
}

function getRandomColor() {
  return duckColors[Math.floor(Math.random() * duckColors.length)];
}

function updateDuckPreview() {
  const input = document.getElementById("names").value;
  const players = input.split(",").map(p => p.trim()).filter(Boolean);
  const raceTrack = document.getElementById("raceTrack");
  raceTrack.innerHTML = "";

  if (players.length === 0) return;

  const finishLine = document.createElement("div");
  finishLine.className = "finish-line";
  raceTrack.appendChild(finishLine);

  players.forEach(player => {
    const lane = document.createElement("div");
    lane.className = "lane";

    const container = document.createElement("div");
    container.className = "duckContainer";
    container.style.left = "0px";

    const duck = document.createElement("div");
    duck.className = "duck";
    duck.innerText = "🦆";

    const name = document.createElement("div");
    name.className = "duckName";
    name.innerText = player;
    name.style.color = getRandomColor();

    container.appendChild(duck);
    container.appendChild(name);
    lane.appendChild(container);
    raceTrack.appendChild(lane);
  });
}

document.getElementById("names").addEventListener("input", updateDuckPreview);
updateDuckPreview();

function startTimedDuckRace() {
  const input = document.getElementById("names").value;
  const players = input.split(",").map(p => p.trim()).filter(Boolean);
  const duration = parseFloat(document.getElementById("raceDuration").value);

  if (players.length < 2 || isNaN(duration) || duration <= 0) {
    document.getElementById("duckResult").innerText = "Add at least 2 names and valid duration!";
    return;
  }

  cancelAnimationFrame(raceAnimation);
  const raceTrack = document.getElementById("raceTrack");
  raceTrack.innerHTML = "";
  document.getElementById("duckResult").innerText = "";

  const trackWidth = raceTrack.clientWidth;
  const finishLineWidth = 5;

  const finishLine = document.createElement("div");
  finishLine.className = "finish-line";
  raceTrack.appendChild(finishLine);

  racePlayers = players.map(player => {
    const lane = document.createElement("div");
    lane.className = "lane";

    const container = document.createElement("div");
    container.className = "duckContainer";
    container.style.left = "0px";

    const duck = document.createElement("div");
    duck.className = "duck";
    duck.innerText = "🦆";

    const name = document.createElement("div");
    name.className = "duckName";
    name.innerText = player;
    name.style.color = getRandomColor();

    container.appendChild(duck);
    container.appendChild(name);
    lane.appendChild(container);
    raceTrack.appendChild(lane);

    return {
      name,
      container,
      currentLeft: 0,
      baseSpeed: (trackWidth - finishLineWidth - 40) / (duration * 60),
      dynamicSpeed: 1 + Math.random() * 0.4
    };
  });

  let raceFinished = false;

  function animate() {
    if (raceFinished) return;
    let winner = null;

    racePlayers.forEach(p => {
      // random speed variation
      p.dynamicSpeed += (Math.random() - 0.5) * 0.02;
      p.dynamicSpeed = Math.max(0.5, Math.min(1.5, p.dynamicSpeed));

      p.currentLeft += p.baseSpeed * p.dynamicSpeed;
      const maxLeft = trackWidth - finishLineWidth - 40;

      if (p.currentLeft >= maxLeft && !winner) {
        p.currentLeft = maxLeft;
        winner = p.name.innerText;
        raceFinished = true;
      }

      p.container.style.left = p.currentLeft + "px";
    });

    if (winner) {
      document.getElementById("duckResult").innerText = "🏆 Winner is: " + winner + "!";
    } else {
      raceAnimation = requestAnimationFrame(animate);
    }
  }

  raceAnimation = requestAnimationFrame(animate);
}

function resetDuckRace() {
  cancelAnimationFrame(raceAnimation);
  racePlayers.forEach(p => {
    p.currentLeft = 0;
    p.container.style.left = "0px";
  });
  document.getElementById("duckResult").innerText = "";
}

// Team Randomizer Script //
function randomizeTeams() {
  const leaders = document.getElementById("leadersInput").value
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  const members = document.getElementById("membersInput").value
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  const teamSize = parseInt(document.getElementById("teamSizeInput").value);

  if (leaders.length < 1 || members.length < 1) {
    document.getElementById("teamResults").innerHTML =
      "Please enter at least 1 leader and 1 member.";
    return;
  }

  // Shuffle members for randomness
  const shuffled = members.sort(() => Math.random() - 0.5);

  // Prepare team containers
  const teams = {};
  const maxMembersPerTeam = {}; // includes leader in team size
  leaders.forEach(l => {
    teams[l] = [];
    maxMembersPerTeam[l] = isNaN(teamSize) ? Infinity : Math.max(0, teamSize - 1);
    // teamSize - 1 because the leader counts as 1
  });

  const undrafted = [];

  // --- Mode 1: User specified team size ---
  if (!isNaN(teamSize) && teamSize > 0) {
    let leaderIndex = 0;

    shuffled.forEach(member => {
      let assigned = false;

      // Try each leader until we find one with space
      for (let i = 0; i < leaders.length; i++) {
        const leader = leaders[(leaderIndex + i) % leaders.length];

        if (teams[leader].length < maxMembersPerTeam[leader]) {
          teams[leader].push(member);
          leaderIndex = (leaderIndex + i + 1) % leaders.length;
          assigned = true;
          break;
        }
      }

      if (!assigned) undrafted.push(member);
    });

  } else {
    // --- Mode 2: No team size → even distribution ---
    let i = 0;
    shuffled.forEach(member => {
      const leader = leaders[i % leaders.length];
      teams[leader].push(member);
      i++;
    });
  }

  // Build output
  let output = "";

  leaders.forEach(leader => {
    output += `<strong>${leader}</strong> (Leader)<br>`;
    output += teams[leader].length
      ? teams[leader].join(", ") + "<br><br>"
      : "(No members)<br><br>";
  });

  // Show undrafted players (if any)
  if (undrafted.length > 0) {
    output += `<strong>Not in a team:</strong><br>${undrafted.join(", ")}`;
  }

  document.getElementById("teamResults").innerHTML = output;
}

// Get all inputs inside the Team Randomizer section
const teamInputs = [
  document.getElementById("leadersInput"),
  document.getElementById("membersInput"),
  document.getElementById("teamSizeInput")
];

// Listen for Enter key
teamInputs.forEach(input => {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submission or line break
      document.getElementById("teamsTab").click(); // trigger button
    }
  });
});
