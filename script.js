// State Data Pemilihan
let config = {
  schoolName: "SMP IT Al-Kautsar Mukomuko",
  eventName: "E-Rekapitulasi Suara Pemilihan Ketua & Wakil Ketua OSIS",
  dpt: 1200,
  paslonNames: [
    "Calon Ketua 1 & Calon Wakil 1",
    "Calon Ketua 2 & Calon Wakil 2",
    "Calon Ketua 3 & Calon Wakil 3",
    "Calon Ketua 4 & Calon Wakil 4"
  ],
  paslonImages: [
    "https://via.placeholder.com/300x200/2563eb/ffffff?text=Foto+Paslon+01",
    "https://via.placeholder.com/300x200/059669/ffffff?text=Foto+Paslon+02",
    "https://via.placeholder.com/300x200/d97706/ffffff?text=Foto+Paslon+03",
    "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Foto+Paslon+04"
  ]
};

let votes = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  invalid: 0
};

let isLocked = false;

// Audio Beep menggunakan Web Audio API (Offline First)
function playBeep(freq = 600, duration = 0.08) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.log("Audio not supported or blocked");
  }
}

// Inisialisasi Aplikasi saat Load
document.addEventListener("DOMContentLoaded", () => {
  loadLocalStorage();
  updateUI();
});

// Tambah Suara (+1)
function addVote(paslonId) {
  if (isLocked) return;
  
  if (paslonId === 0) {
    votes.invalid++;
  } else {
    votes[paslonId]++;
  }
  
  playBeep(800, 0.06);
  saveLocalStorage();
  updateUI();
}

// Kurangi Suara (-1 Undo)
function undoVote(paslonId) {
  if (isLocked) return;

  if (paslonId === 0 && votes.invalid > 0) {
    votes.invalid--;
  } else if (paslonId > 0 && votes[paslonId] > 0) {
    votes[paslonId]--;
  }
  
  playBeep(300, 0.1);
  saveLocalStorage();
  updateUI();
}

// Update Perhitungan & Tampilan
function updateUI() {
  const totalVotes = votes[1] + votes[2] + votes[3] + votes[4] + votes.invalid;
  
  // Header Stats
  document.getElementById("stat-dpt").innerText = config.dpt.toLocaleString();
  document.getElementById("stat-total").innerText = totalVotes.toLocaleString();
  document.getElementById("stat-rusak").innerText = votes.invalid.toLocaleString();
  
  const partisipasi = config.dpt > 0 ? ((totalVotes / config.dpt) * 100).toFixed(1) : 0;
  document.getElementById("stat-partisipasi").innerText = partisipasi + "%";

  // Hitung Nilai Tertinggi untuk Highlight Paslon Unggul
  let maxVotes = 0;
  for (let i = 1; i <= 4; i++) {
    if (votes[i] > maxVotes) maxVotes = votes[i];
  }

  // Update Kartu Paslon 1-4
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`vote-${i}`).innerText = votes[i];
    document.getElementById(`name-${i}`).innerText = config.paslonNames[i - 1];
    document.getElementById(`img-${i}`).src = config.paslonImages[i - 1];
    
    const pct = totalVotes > 0 ? ((votes[i] / totalVotes) * 100).toFixed(1) : "0.0";
    document.getElementById(`percent-${i}`).innerText = pct + "%";
    document.getElementById(`bar-${i}`).style.width = pct + "%";

    // Highlight Paslon Unggul
    const badge = document.getElementById(`badge-${i}`);
    const card = document.getElementById(`card-${i}`);
    if (votes[i] > 0 && votes[i] === maxVotes) {
      badge.classList.remove("hidden");
      card.style.borderColor = "#f59e0b";
    } else {
      badge.classList.add("hidden");
      card.style.borderColor = "var(--border-color)";
    }
  }

  // Suara Rusak
  document.getElementById("vote-invalid").innerText = votes.invalid + " Suara";
  const pctInvalid = totalVotes > 0 ? ((votes.invalid / totalVotes) * 100).toFixed(1) : "0.0";
  document.getElementById("bar-invalid").style.width = pctInvalid + "%";
}

// Lock / Unlock Screen
function toggleLock() {
  isLocked = !isLocked;
  const lockScreen = document.getElementById("lock-screen");
  if (isLocked) {
    lockScreen.classList.remove("hidden");
  } else {
    lockScreen.classList.add("hidden");
  }
}

// Modal Settings Functions
function openSettings() {
  document.getElementById("input-school").value = config.schoolName;
  document.getElementById("input-event").value = config.eventName;
  document.getElementById("input-dpt").value = config.dpt;
  
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`input-name-${i}`).value = config.paslonNames[i - 1];
  }

  document.getElementById("settings-modal").classList.remove("hidden");
}

function closeSettings() {
  document.getElementById("settings-modal").classList.add("hidden");
}

function saveSettings() {
  config.schoolName = document.getElementById("input-school").value;
  config.eventName = document.getElementById("input-event").value;
  config.dpt = parseInt(document.getElementById("input-dpt").value) || 0;

  for (let i = 1; i <= 4; i++) {
    config.paslonNames[i - 1] = document.getElementById(`input-name-${i}`).value;
  }

  document.getElementById("school-title").innerText = config.schoolName;
  document.getElementById("event-title").innerText = config.eventName;

  saveLocalStorage();
  updateUI();
  closeSettings();
}

// Handler Upload Foto Paslon Lokal
function uploadImage(event, paslonId) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      config.paslonImages[paslonId - 1] = e.target.result;
      saveLocalStorage();
      updateUI();
    };
    reader.readAsDataURL(file);
  }
}

// Reset Suara
function resetData() {
  if (confirm("Apakah Anda yakin ingin mereset seluruh perhitungan suara kembali ke angka 0?")) {
    votes = { 1: 0, 2: 0, 3: 0, 4: 0, invalid: 0 };
    saveLocalStorage();
    updateUI();
    closeSettings();
  }
}

// Modal Berita Acara
function openBeritaAcara() {
  const totalVotes = votes[1] + votes[2] + votes[3] + votes[4] + votes.invalid;
  
  document.getElementById("ba-school").innerText = config.schoolName;
  document.getElementById("ba-event").innerText = config.eventName;
  document.getElementById("ba-date").innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`ba-name-${i}`).innerText = config.paslonNames[i - 1];
    document.getElementById(`ba-vote-${i}`).innerText = votes[i];
    const pct = totalVotes > 0 ? ((votes[i] / totalVotes) * 100).toFixed(1) : 0;
    document.getElementById(`ba-percent-${i}`).innerText = pct + "%";
  }

  document.getElementById("ba-vote-invalid").innerText = votes.invalid;
  document.getElementById("ba-percent-invalid").innerText = totalVotes > 0 ? ((votes.invalid / totalVotes) * 100).toFixed(1) + "%" : "0%";
  
  document.getElementById("ba-vote-total").innerText = totalVotes;
  document.getElementById("ba-dpt").innerText = config.dpt;
  document.getElementById("ba-partisipasi").innerText = config.dpt > 0 ? ((totalVotes / config.dpt) * 100).toFixed(1) + "%" : "0%";

  document.getElementById("ba-modal").classList.remove("hidden");
}

function closeBeritaAcara() {
  document.getElementById("ba-modal").classList.add("hidden");
}

// Ekspor ke CSV
function exportCSV() {
  const totalVotes = votes[1] + votes[2] + votes[3] + votes[4] + votes.invalid;
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "No,Nama Paslon,Jumlah Suara,Persentase\n";

  for (let i = 1; i <= 4; i++) {
    const pct = totalVotes > 0 ? ((votes[i] / totalVotes) * 100).toFixed(1) : 0;
    csvContent += `${i},"${config.paslonNames[i - 1]}",${votes[i]},${pct}%\n`;
  }
  
  csvContent += `5,"SUARA TIDAK SAH",${votes.invalid},${totalVotes > 0 ? ((votes.invalid / totalVotes) * 100).toFixed(1) : 0}%\n`;
  csvContent += `,"TOTAL SUARA",${totalVotes},100%\n`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Hasil_E-Rekap_OSIS_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Persistensi Data Lokal
function saveLocalStorage() {
  localStorage.setItem("osis_votes", JSON.stringify(votes));
  localStorage.setItem("osis_config", JSON.stringify(config));
}

function loadLocalStorage() {
  const savedVotes = localStorage.getItem("osis_votes");
  const savedConfig = localStorage.getItem("osis_config");
  
  if (savedVotes) votes = JSON.parse(savedVotes);
  if (savedConfig) config = JSON.parse(savedConfig);
  
  document.getElementById("school-title").innerText = config.schoolName;
  document.getElementById("event-title").innerText = config.eventName;
}
