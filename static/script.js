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

function upload(level){
  let bar = document.getElementById("bar");
  bar.style.width="0";

  let data = new FormData();
  data.append("file", file);
  data.append("mode", level);
  data.append("dpi", document.getElementById("dpi").value);

  let xhr = new XMLHttpRequest();
  xhr.open("POST","/compress");

  xhr.upload.onprogress = e => {
    bar.style.width = (e.loaded/e.total*100)+"%";
  };

  xhr.onload = ()=>{
    let blob = xhr.response;
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download="compressed.pdf";
    a.click();

    let orig = xhr.getResponseHeader("X-Original-Size");
    let comp = xhr.getResponseHeader("X-Compressed-Size");

    document.getElementById("result").innerText =
      `Before: ${(orig/1024/1024).toFixed(2)} MB | After: ${(comp/1024/1024).toFixed(2)} MB`;
  };

  xhr.responseType="blob";
  xhr.send(data);
}
