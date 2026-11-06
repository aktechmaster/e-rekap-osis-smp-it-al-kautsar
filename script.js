// GLOBAL STATE MANAGEMENT
const DEFAULT_STATE = {
  schoolName: "SMP IT Al-Kautsar Mukomuko E-REKAP OSIS",
  electionTitle: "Pemilihan Ketua & Wakil Ketua OSIS Periode 2024/2025",
  totalDPT: 1000,
  isLocked: false,
  soundEnabled: true,
  votes: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    invalid: 0
  },
  paslon: {
    1: { name: "1. Ahmad Fikri & Aisyah Putri", vision: "Visi: OSIS Inovatif, Inklusif & Berprestasi", image: "https://placehold.co/400x400/1e293b/3b82f6?text=Paslon+01" },
    2: { name: "2. Bima Pratama & Rizky Ramadhan", vision: "Visi: Kolaborasi Digital & Kepemimpinan Akhlak", image: "https://placehold.co/400x400/1e293b/10b981?text=Paslon+02" },
    3: { name: "3. Citra Lestari & Dewa Saputra", vision: "Visi: Lingkungan Hijau & Pentas Seni Kreatif", image: "https://placehold.co/400x400/1e293b/f59e0b?text=Paslon+03" },
    4: { name: "4. Dion Wijaya & Elena Nur", vision: "Visi: Sportivitas Olahraga & Apresiasi Bakat", image: "https://placehold.co/400x400/1e293b/8b5cf6?text=Paslon+04" }
  }
};

let appState = JSON.parse(localStorage.getItem('e_rekap_osis_state')) || DEFAULT_STATE;

// WEB AUDIO API SYNTHESIZER
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBeep(type = 'add') {
  if (!appState.soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'add') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'sub') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(293.66, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === 'invalid') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch (e) {
    console.log("Audio not supported or waiting for user interaction.", e);
  }
}

// SAVE STATE TO LOCAL STORAGE
function saveState() {
  localStorage.setItem('e_rekap_osis_state', JSON.stringify(appState));
  renderUI();
}

// MAIN VOTE ACTION (+1)
function handleVote(id, event) {
  if (appState.isLocked) return;
  if (id === 'invalid') {
    appState.votes.invalid += 1;
    playBeep('invalid');
  } else {
    appState.votes[id] += 1;
    playBeep('add');
  }
  createFloatAnimation(event, "+1");
  saveState();
}

// UNDO VOTE ACTION (-1)
function handleUndo(id, event) {
  event.stopPropagation();
  if (appState.isLocked) return;
  if (id === 'invalid') {
    if (appState.votes.invalid > 0) {
      appState.votes.invalid -= 1;
      playBeep('sub');
      createFloatAnimation(event, "-1", "text-rose-400");
    }
  } else {
    if (appState.votes[id] > 0) {
      appState.votes[id] -= 1;
      playBeep('sub');
      createFloatAnimation(event, "-1", "text-amber-400");
    }
  }
  saveState();
}

// FLOATING ANIMATION (+1 / -1)
function createFloatAnimation(event, text, colorClass = "text-emerald-400") {
  const floatEl = document.createElement("div");
  floatEl.className = `float-number text-2xl ${colorClass}`;
  floatEl.innerText = text;
  
  let x = event.clientX;
  let y = event.clientY;
  if (!x || !y) {
    const rect = event.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }
  floatEl.style.left = `${x - 15}px`;
  floatEl.style.top = `${y - 20}px`;
  document.body.appendChild(floatEl);
  setTimeout(() => {
    floatEl.remove();
  }, 800);
}

// RENDER UI STATE
function renderUI() {
  document.getElementById('headerSchoolName').childNodes[0].nodeValue = appState.schoolName + " ";
  document.getElementById('headerElectionTitle').innerText = appState.electionTitle;
  document.getElementById('statDPT').innerText = appState.totalDPT.toLocaleString('id-ID');

  const lockBtn = document.getElementById('lockBtn');
  const lockBanner = document.getElementById('lockBanner');
  if (appState.isLocked) {
    lockBtn.className = "touch-btn px-4 py-2 rounded-lg bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/30";
    document.getElementById('lockIcon').className = "fa-solid fa-lock";
    document.getElementById('lockText').innerText = "TERKUNCI";
    lockBanner.classList.remove('hidden');
  } else {
    lockBtn.className = "touch-btn px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-semibold flex items-center gap-2";
    document.getElementById('lockIcon').className = "fa-solid fa-lock-open";
    document.getElementById('lockText').innerText = "Buka Kunci";
    lockBanner.classList.add('hidden');
  }

  const soundBtn = document.getElementById('soundToggleBtn');
  if (appState.soundEnabled) {
    soundBtn.innerHTML = `<i class="fa-solid fa-volume-high text-emerald-400"></i><span class="hidden sm:inline">Suara: ON</span>`;
  } else {
    soundBtn.innerHTML = `<i class="fa-solid fa-volume-xmark text-slate-500"></i><span class="hidden sm:inline">Suara: OFF</span>`;
  }

  const v1 = appState.votes[1];
  const v2 = appState.votes[2];
  const v3 = appState.votes[3];
  const v4 = appState.votes[4];
  const vInvalid = appState.votes.invalid;
  const totalValid = v1 + v2 + v3 + v4;
  const totalAll = totalValid + vInvalid;
  const turnoutPct = appState.totalDPT > 0 ? ((totalAll / appState.totalDPT) * 100).toFixed(1) : 0;

  document.getElementById('statTotalVotes').innerText = totalAll.toLocaleString('id-ID');
  document.getElementById('statTurnoutPct').innerText = `${turnoutPct}% DPT`;
  document.getElementById('statValidVotes').innerText = totalValid.toLocaleString('id-ID');
  document.getElementById('statValidPct').innerText = totalAll > 0 ? `${((totalValid / totalAll) * 100).toFixed(1)}% Total` : "0% Total";
  document.getElementById('statInvalidVotes').innerText = vInvalid.toLocaleString('id-ID');
  document.getElementById('statInvalidPct').innerText = totalAll > 0 ? `${((vInvalid / totalAll) * 100).toFixed(1)}% Total` : "0% Total";

  const candidates = [1, 2, 3, 4];
  let maxVotes = -1;
  let leadingCandidateId = null;

  candidates.forEach(id => {
    const votes = appState.votes[id];
    const pct = totalAll > 0 ? ((votes / totalAll) * 100).toFixed(1) : "0.0";
    
    document.getElementById(`countPaslon${id}`).innerText = votes.toLocaleString('id-ID');
    document.getElementById(`pctPaslon${id}`).innerText = `${pct}%`;
    document.getElementById(`namePaslon${id}`).innerText = appState.paslon[id].name;
    document.getElementById(`visionPaslon${id}`).innerText = appState.paslon[id].vision;
    if (appState.paslon[id].image) {
      document.getElementById(`imgPaslon${id}`).src = appState.paslon[id].image;
    }

    if (votes > maxVotes && votes > 0) {
      maxVotes = votes;
      leadingCandidateId = id;
    }
  });

  document.getElementById('countInvalid').innerText = vInvalid.toLocaleString('id-ID');

  candidates.forEach(id => {
    const badge = document.getElementById(`badgeLead${id}`);
    const card = document.getElementById(`cardPaslon${id}`);
    if (id === leadingCandidateId && maxVotes > 0) {
      badge.classList.remove('hidden');
      card.classList.add('border-amber-400', 'pulse-glow');
    } else {
      badge.classList.add('hidden');
      card.classList.remove('border-amber-400', 'pulse-glow');
    }
  });

  const statusText = document.getElementById('leadingStatusText');
  if (leadingCandidateId && maxVotes > 0) {
    statusText.innerText = `Memimpin: Paslon 0${leadingCandidateId} dengan ${maxVotes} Suara`;
    statusText.className = "text-amber-400 font-bold";
  } else {
    statusText.innerText = "Belum ada suara masuk";
    statusText.className = "text-slate-400 font-normal";
  }

  if (totalAll > 0) {
    document.getElementById('barPaslon1').style.width = `${(v1 / totalAll) * 100}%`;
    document.getElementById('barPaslon2').style.width = `${(v2 / totalAll) * 100}%`;
    document.getElementById('barPaslon3').style.width = `${(v3 / totalAll) * 100}%`;
    document.getElementById('barPaslon4').style.width = `${(v4 / totalAll) * 100}%`;
    document.getElementById('barInvalid').style.width = `${(vInvalid / totalAll) * 100}%`;
  } else {
    document.getElementById('barPaslon1').style.width = '0%';
    document.getElementById('barPaslon2').style.width = '0%';
    document.getElementById('barPaslon3').style.width = '0%';
    document.getElementById('barPaslon4').style.width = '0%';
    document.getElementById('barInvalid').style.width = '0%';
  }
}

// LOCK / UNLOCK TOGGLE
function toggleLock() {
  appState.isLocked = !appState.isLocked;
  playBeep('sub');
  saveState();
}

// SOUND TOGGLE
function toggleSound() {
  appState.soundEnabled = !appState.soundEnabled;
  saveState();
}

// SETTINGS MODAL HANDLERS
function openSettingsModal() {
  document.getElementById('inputSchoolName').value = appState.schoolName;
  document.getElementById('inputElectionTitle').value = appState.electionTitle;
  document.getElementById('inputDPT').value = appState.totalDPT;
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`inputName${i}`).value = appState.paslon[i].name;
  }
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function previewUploadImage(id, input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      appState.paslon[id].image = e.target.result;
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function saveSettings(e) {
  e.preventDefault();
  appState.schoolName = document.getElementById('inputSchoolName').value || DEFAULT_STATE.schoolName;
  appState.electionTitle = document.getElementById('inputElectionTitle').value || DEFAULT_STATE.electionTitle;
  appState.totalDPT = parseInt(document.getElementById('inputDPT').value) || 1000;
  for (let i = 1; i <= 4; i++) {
    appState.paslon[i].name = document.getElementById(`inputName${i}`).value || `Paslon 0${i}`;
  }
  saveState();
  closeSettingsModal();
}

// RESET MODAL HANDLERS
function openResetModal() {
  document.getElementById('resetModal').classList.remove('hidden');
}

function closeResetModal() {
  document.getElementById('resetModal').classList.add('hidden');
}

function executeReset() {
  appState.votes = { 1: 0, 2: 0, 3: 0, 4: 0, invalid: 0 };
  saveState();
  closeResetModal();
}

// EXPORT TO CSV
function exportCSV() {
  const totalValid = appState.votes[1] + appState.votes[2] + appState.votes[3] + appState.votes[4];
  const totalAll = totalValid + appState.votes.invalid;
  const dateStr = new Date().toLocaleString('id-ID');
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `REKAPITULASI HASIL PEMILIHAN OSIS\n`;
  csvContent += `Sekolah/Organisasi,${appState.schoolName}\n`;
  csvContent += `Judul Pemilihan,${appState.electionTitle}\n`;
  csvContent += `Waktu Ekspor,${dateStr}\n\n`;
  csvContent += `No Paslon,Nama Pasangan Calon,Perolehan Suara,Persentase\n`;
  
  for (let i = 1; i <= 4; i++) {
    const v = appState.votes[i];
    const pct = totalAll > 0 ? ((v / totalAll) * 100).toFixed(2) : 0;
    csvContent += `Paslon 0${i},"${appState.paslon[i].name}",${v},${pct}%\n`;
  }
  
  csvContent += `-,SUARA TIDAK SAH,${appState.votes.invalid},${totalAll > 0 ? ((appState.votes.invalid / totalAll) * 100).toFixed(2) : 0}%\n\n`;
  csvContent += `Total Suara Sah,,${totalValid},\n`;
  csvContent += `Total Suara Masuk,,${totalAll},\n`;
  csvContent += `Total DPT Pemilih,,${appState.totalDPT},\n`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `E-Rekap_OSIS_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// OFFICIAL REPORT / BERITA ACARA MODAL
function openBeritaAcaraModal() {
  document.getElementById('printSchoolName').innerText = appState.schoolName.toUpperCase();
  document.getElementById('printElectionTitle').innerText = appState.electionTitle.toUpperCase();
  document.getElementById('printDateString').innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const tbody = document.getElementById('printTableBody');
  tbody.innerHTML = "";

  const totalValid = appState.votes[1] + appState.votes[2] + appState.votes[3] + appState.votes[4];
  const totalAll = totalValid + appState.votes.invalid;
  let highestVotes = -1;
  let winnerName = "-";

  for (let i = 1; i <= 4; i++) {
    const v = appState.votes[i];
    const pct = totalAll > 0 ? ((v / totalAll) * 100).toFixed(1) : "0";
    if (v > highestVotes && v > 0) {
      highestVotes = v;
      winnerName = appState.paslon[i].name;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border border-black p-2 text-center font-bold">0${i}</td>
      <td class="border border-black p-2">${appState.paslon[i].name}</td>
      <td class="border border-black p-2 text-right font-semibold">${v.toLocaleString('id-ID')}</td>
      <td class="border border-black p-2 text-right">${pct}%</td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById('printTotalValid').innerText = totalValid.toLocaleString('id-ID');
  document.getElementById('printTotalValidPct').innerText = totalAll > 0 ? `${((totalValid / totalAll) * 100).toFixed(1)}%` : "0%";
  document.getElementById('printTotalInvalid').innerText = appState.votes.invalid.toLocaleString('id-ID');
  document.getElementById('printTotalInvalidPct').innerText = totalAll > 0 ? `${((appState.votes.invalid / totalAll) * 100).toFixed(1)}%` : "0%";
  document.getElementById('printTotalAll').innerText = totalAll.toLocaleString('id-ID');

  if (highestVotes > 0) {
    document.getElementById('printWinnerNote').innerHTML = `Berdasarkan hasil rekapitulasi suara di atas, perolehan suara tertinggi diraih oleh: <span class="font-bold underline text-black">${winnerName}</span> dengan total <span class="font-bold">${highestVotes} suara</span>.`;
  } else {
    document.getElementById('printWinnerNote').innerText = "Penghitungan suara masih berlangsung / belum ada suara masuk.";
  }

  document.getElementById('beritaAcaraModal').classList.remove('hidden');
}

function closeBeritaAcaraModal() {
  document.getElementById('beritaAcaraModal').classList.add('hidden');
}

// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT') return;
  if (e.key === '1') handleVote(1, e);
  if (e.key === '2') handleVote(2, e);
  if (e.key === '3') handleVote(3, e);
  if (e.key === '4') handleVote(4, e);
  if (e.key === '0') handleVote('invalid', e);
  if (e.key.toLowerCase() === 'l') toggleLock();
});

// INITIAL RENDER ON LOAD
window.onload = function() {
  renderUI();
};
