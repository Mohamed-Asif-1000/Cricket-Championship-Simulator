let totalTeams=[];
let groups=[];
let currentGroupIndex=0;
let groupWinners=[];
let finalFourWinner=[];
let superFourWinners=[]; // ADDED: Array to store Super 4 winners

const inputStage=document.getElementById("inputStage");
const inputTeams=document.getElementById("inputTeams");
const matchStage=document.getElementById("matchStage");
const scoreboardStage=document.getElementById("scoreboardStage");
const winnerStage=document.getElementById("winnerStage");

const matchStageButton = document.getElementById("matchStageButton");
const scoreboardButton = document.getElementById("scoreboardButton");

// Creating 16 Teams Input Boxes 

for(let i=1;i<=16;i++){
    const input=document.createElement("input");
    input.placeholder="Team"+i;
    input.id="team"+i;
    inputTeams.appendChild(input);
}

// Starting the Tournament with Entering the Teams and clicking the Start Tournament Button

document.getElementById("startMatchButton").addEventListener("click",()=>{
    totalTeams=[];
    for(i=1;i<=16;i++){
        const team=document.getElementById("team"+i).value.trim();
        if(team === ""){
            alert("Please Fill all the 16 Teams Names to Enter The Match");
            return;
        }
        totalTeams.push(team);
    }
    inputStage.style.display="none";
    createGroups();
    playGroupMatch(); // FIXED: Start the first group match
});


//Splitting the 16 teams into the Group of 4 Teams ( 4 Teams for 4 Groups = 16 Teams)

function createGroups(){
    groups=[];
    for(let i=0;i<4;i++){
        groups.push(totalTeams.slice(i*4,i*4 + 4));
    }
}

// Creating Round-Robin Matches for the 4 Teams of Groups

function createMatches(totalTeams){
    const matches=[];
    for(let i=0;i<totalTeams.length;i++){
        for(let j=i+1;j<totalTeams.length;j++){
            matches.push([totalTeams[i],totalTeams[j]]); // FIXED: Push an array pair
        }
    }
    return matches;
}

// Playing the Group Stage Match

function playGroupMatch(){
    matchStage.style.display="block";
    const matchContainer=document.getElementById("matchContainer");
    matchContainer.innerHTML="";

    const group=groups[currentGroupIndex];
    document.getElementById("matchStageTitle").textContent=`Group ${String.fromCharCode(65+currentGroupIndex)} Matches`;

    const matches=createMatches(group); // FIXED: Pass 'group' instead of 'groups'

    matches.forEach((pair,index)=>{
        const row=document.createElement("div");
        row.className="match-row";
        row.innerHTML=`
        <label>${pair[0]}</label>
        <div class="match-inputs">
            <input type="number" id="score${index}_1" placeholder="Runs" min="0" />
            <input type="number" id="wicket${index}_1" placeholder="Wicket" min="0" />
        </div>
        <span>vs</span>
        <div class="match-inputs">
            <input type="number" id="score${index}_2" placeholder="Runs" min="0" />
            <input type="number" id="wicket${index}_2" placeholder="Wicket" min="0" />
        </div>
        <label>${pair[1]}</label>
        `;
        matchContainer.appendChild(row);
    });
    const groupSubmit=() => processGroupResults(group,matches);
    matchStageButton.addEventListener("click",groupSubmit,{
        once: true // FIXED: Added event listener with 'once:true' for the handler
    });
}

function processGroupResults(group,matches){
    const status={};
    group.forEach(team => (status[team] = {matches:0 , wins : 0, runs:0,wickets : 0, points:0 }));

    const tieMatches = [];

    matches.forEach((pair,i) =>{
        const score1 = parseInt(document.getElementById(`score${i}_1`).value);
        const score2 = parseInt(document.getElementById(`score${i}_2`).value);
        const wicket1= parseInt(document.getElementById(`wicket${i}_1`).value) || 0;
        const wicket2= parseInt(document.getElementById(`wicket${i}_2`).value) || 0; // FIXED: Changed to wicket${i}_2

        if(isNaN(score1) || isNaN(score2)){
            return alert("Please Fill all the Scores !");
        }

        status[pair[0]].matches++;
        status[pair[1]].matches++;
        status[pair[0]].runs+=score1; // FIXED: Used +=
        status[pair[1]].runs+=score2; // FIXED: Used +=
        status[pair[0]].wickets+=wicket1; // FIXED: Used +=
        status[pair[1]].wickets+=wicket2; // FIXED: Used +=


        if(score1>score2){
            status[pair[0]].wins++;
            status[pair[0]].points+=2; // FIXED: Used +=
        }
        else if(score2>score1){
            status[pair[1]].wins++;
            status[pair[1]].points+=2; // FIXED: Used +=
        }
        else{
            tieMatches.push(pair)
        }

    });
    if(tieMatches.length>0){
        playTieMatches(status,tieMatches,0,finalizeGroup);
    }
    else{
        finalizeGroup(status);
    }
}

// Tie Mathces

function  playTieMatches(status,tieMatches,index,callback){
    if(index >= tieMatches.length){
        return callback(status);
    }

    const [team1,team2]=tieMatches[index];
    const container=document.getElementById("matchContainer");

    matchStageButton.disabled=true;

    const playoffRow=document.createElement("div");
    playoffRow.className="match-row";
    playoffRow.innerHTML=`
        <h3>Mini-Playoff : ${team1} vs ${team2}</h3>
        <label>${team1}</label>
        <input type="number" id="playoff_score1" placeholder="Runs" />
        <label>${team2}</label>
        <input type="number" id="playoff_score2" placeholder="Runs" />
        <button id="submitPlayOff">Submit Playoff</button>
    `;
    container.appendChild(playoffRow);

    const playOffButton=document.getElementById("submitPlayOff");

    const playOffHandler = () => {
        const playScore1 = parseInt(document.getElementById("playoff_score1").value);
        const playScore2 = parseInt(document.getElementById("playoff_score2").value);

        if(isNaN(playScore1) || isNaN(playScore2) || playScore1===playScore2){
            return alert("Enter Valid Playoff Score!");
        }

        if(playScore1>playScore2){
            status[team1].wins++;
            status[team1].points+=2;
            status[team1].runs+=playScore1;
            status[team2].runs+=playScore2;
        }
        else{
            status[team2].wins++;
            status[team2].points+=2;
            status[team1].runs+=playScore1;
            status[team2].runs+=playScore2;


        }
        playoffRow.remove();
        matchStageButton.disabled=false;
        playOffButton.removeEventListener("click",playOffHandler);
        playTieMatches(status,tieMatches,index+1,callback);
    };
    playOffButton.addEventListener("click",playOffHandler);
}
// Finalize Group Matches
function finalizeGroup(stats) {
  displayScoreboard(stats);

  const winner = Object.entries(stats)
    .sort((a, b) => b[1].points - a[1].points || b[1].runs - a[1].runs)[0][0];
  groupWinners.push(winner);

  matchStage.style.display = "none";
  scoreboardStage.style.display = "block";
  document.getElementById("scoreboardTitle").textContent = `Group ${String.fromCharCode(65 + currentGroupIndex)} Scoreboard`;

  scoreboardButton.addEventListener("click", () => { // FIXED: Use scoreboardButton instead of nextStageBtn
    scoreboardStage.style.display = "none";
    currentGroupIndex++;
    if (currentGroupIndex < 4) playGroupMatch(); // FIXED: Use playGroupMatch instead of playGroupStage
    else startSuperFour();
  }, { once: true });
}

// --- Step 9: Display Scoreboard ---
function displayScoreboard(stats) {
  const div = document.getElementById("scoreboardContainer"); // FIXED: Changed 'scoreboard' to 'scoreboardContainer' based on index.html ID
  div.innerHTML = `
    <table>
      <tr>
        <th>Team</th><th>Matches</th><th>Wins</th><th>Runs</th><th>Wickets</th><th>Points</th>
      </tr>
      ${Object.entries(stats)
        .map(([team, s]) => `<tr><td>${team}</td><td>${s.matches}</td><td>${s.wins}</td><td>${s.runs}</td><td>${s.wickets}</td><td>${s.points}</td></tr>`)
        .join("")}
    </table>
  `;
}

// --- Step 10: Super 4 Stage ---
function startSuperFour() {
  currentGroupIndex = 0;
  matchStage.style.display = "block";
  scoreboardStage.style.display = "none";
  document.getElementById("matchStageTitle").textContent = "Super 4 Stage"; // FIXED: Changed 'stageTitle' to 'matchStageTitle'

  const matches = createMatches(groupWinners);
  const container = document.getElementById("matchContainer");
  container.innerHTML = "";

  matches.forEach((pair, index) => {
    const row = document.createElement("div");
    row.className = "match-row";
    row.innerHTML = `
      <label>${pair[0]}</label>
      <div class="match-inputs">
        <input type="number" id="sfscore${index}_1" placeholder="Runs" />
        <input type="number" id="sfwkt${index}_1" placeholder="Wkts" />
      </div>
      <span>vs</span>
      <div class="match-inputs">
        <input type="number" id="sfscore${index}_2" placeholder="Runs" />
        <input type="number" id="sfwkt${index}_2" placeholder="Wkts" />
      </div>
      <label>${pair[1]}</label>
    `;
    container.appendChild(row);
  });

  const super4SubmitHandler = () => processSuperFourResults(groupWinners, matches);
  matchStageButton.addEventListener("click", super4SubmitHandler, { once: true }); // FIXED: Use matchStageButton instead of submitScoresBtn
}

// --- Step 11: Process Super 4 Results ---
function processSuperFourResults(teams, matches) {
  const stats = {};
  teams.forEach(team => (stats[team] = { matches: 0, wins: 0, runs: 0, wickets: 0, points: 0 }));

  const tieMatches = [];

  matches.forEach((pair, i) => {
    const s1 = parseInt(document.getElementById(`sfscore${i}_1`).value);
    const s2 = parseInt(document.getElementById(`sfscore${i}_2`).value);
    const w1 = parseInt(document.getElementById(`sfwkt${i}_1`).value) || 0;
    const w2 = parseInt(document.getElementById(`sfwkt${i}_2`).value) || 0; // FIXED: Changed to sfwkt${i}_2

    if (isNaN(s1) || isNaN(s2)) return alert("Please fill all Super 4 scores!");

    stats[pair[0]].matches++;
    stats[pair[1]].matches++;
    stats[pair[0]].runs += s1;
    stats[pair[1]].runs += s2;
    stats[pair[0]].wickets += w1;
    stats[pair[1]].wickets += w2;

    if (s1 > s2) {
      stats[pair[0]].wins++;
      stats[pair[0]].points += 2;
    } else if (s2 > s1) {
      stats[pair[1]].wins++;
      stats[pair[1]].points += 2;
    } else {
      tieMatches.push(pair);
    }
  });

  if (tieMatches.length > 0) {
    playTieMatches(stats, tieMatches, 0, () => finalizeSuperFour(stats));
  } else {
    finalizeSuperFour(stats);
  }
}

// --- Step 12: Finalize Super 4 ---
function finalizeSuperFour(stats) {
  displayScoreboard(stats);

  superFourWinners = Object.entries(stats)
    .sort((a, b) => b[1].points - a[1].points || b[1].runs - a[1].runs)
    .slice(0, 2)
    .map(e => e[0]);

  matchStage.style.display = "none";
  scoreboardStage.style.display = "block";
  document.getElementById("scoreboardTitle").textContent = "Super 4 Scoreboard";

  scoreboardButton.addEventListener("click", () => { // FIXED: Use scoreboardButton instead of nextStageBtn
    scoreboardStage.style.display = "none";
    playFinal();
  }, { once: true });
}

// --- Step 13: Final Stage ---
function playFinal() {
  matchStage.style.display = "block";
  document.getElementById("matchStageTitle").textContent = "Final Match"; // FIXED: Changed 'stageTitle' to 'matchStageTitle'
  const container = document.getElementById("matchContainer");
  container.innerHTML = "";

  const [team1, team2] = superFourWinners;
  const row = document.createElement("div");
  row.className = "match-row";
  row.innerHTML = `
    <label>${team1}</label>
    <div class="match-inputs">
      <input type="number" id="fscore1" placeholder="Runs" />
      <input type="number" id="fwkt1" placeholder="Wkts" />
    </div>
    <span>vs</span>
    <div class="match-inputs">
      <input type="number" id="fscore2" placeholder="Runs" />
      <input type="number" id="fwkt2" placeholder="Wkts" />
    </div>
    <label>${team2}</label>
  `;
  container.appendChild(row);

  const finalSubmitHandler = () => declareChampion();
  matchStageButton.addEventListener("click", finalSubmitHandler, { once: true }); // FIXED: Use matchStageButton instead of submitScoresBtn
}

// --- Step 14: Declare Champion ---
function declareChampion() {
  const s1 = parseInt(document.getElementById("fscore1").value);
  const s2 = parseInt(document.getElementById("fscore2").value);

  if (isNaN(s1) || isNaN(s2)) return alert("Enter both final scores!");

  const winner = s1 > s2 ? superFourWinners[0] : s2 > s1 ? superFourWinners[1] : null;
  if (!winner) {
      matchStageButton.removeEventListener('click', declareChampion); // Allow resubmission
      return alert("It's a tie! Enter new scores.");
  }

  document.getElementById("winnerName").textContent = winner;
  matchStage.style.display = "none";
  winnerStage.style.display = "block";
}