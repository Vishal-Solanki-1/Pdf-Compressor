let file;

const drop = document.getElementById("drop-area");
const buttons = document.querySelectorAll("button");

drop.onclick = () => document.getElementById("fileInput").click();

drop.ondragover = e => e.preventDefault();
drop.ondrop = e => {
  e.preventDefault();
  file = e.dataTransfer.files[0];
  enable();
};

document.getElementById("fileInput").onchange = e => {
  file = e.target.files[0];
  enable();
};

document.getElementById("dpi").oninput = e =>
  document.getElementById("dpiVal").innerText = e.target.value;

function enable(){
  document.getElementById("fileInfo").innerText =
    `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
  buttons.forEach(b=>b.disabled=false);
}

function upload(level) {
  if (!file) return;

  startProgress();

  let formData = new FormData();
  formData.append("file", file);
  formData.append("mode", level);   // ⚠️ IMPORTANT (mode, not level)
  formData.append("dpi", document.getElementById("dpi").value);

  fetch("/compress", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("progress").style.width = "100%";

    // show result box
    document.getElementById("resultBox").style.display = "block";

    // show sizes
    document.getElementById("sizes").innerText =
      `Original: ${data.original_size} KB 
Compressed: ${data.compressed_size} KB 
Reduced: ${data.reduction}%`;

    // download button
    document.getElementById("downloadBtn").onclick = () => {
      window.location.href = data.download_url;
    };
  });
}

function startProgress() {
  let bar = document.getElementById("progress");
  bar.style.width = "0%";

  let width = 0;
  let interval = setInterval(() => {
    width += 10;
    bar.style.width = width + "%";

    if (width >= 90) clearInterval(interval);
  }, 200);
}
