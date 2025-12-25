import os, uuid, subprocess
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

UPLOAD = "uploads"
OUTPUT = "compressed"
os.makedirs(UPLOAD, exist_ok=True)
os.makedirs(OUTPUT, exist_ok=True)

compression_map = {
    "low": "/printer",
    "medium": "/ebook",
    "high": "/screen"
}

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    mode: str = Form(...),
    dpi: int = Form(150)
):
    input_file = f"{UPLOAD}/{uuid.uuid4()}.pdf"
    output_file = f"{OUTPUT}/{uuid.uuid4()}_compressed.pdf"

    # Save uploaded file
    with open(input_file, "wb") as f:
        f.write(await file.read())

    # ✅ SIZE BEFORE
    original_size = os.path.getsize(input_file)

    gs_cmd = [
        "gswin64c" if os.name == "nt" else "gs",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS={compression_map[mode]}",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={output_file}",
        input_file
    ]

    subprocess.run(gs_cmd)

    # ✅ SIZE AFTER
    compressed_size = os.path.getsize(output_file)

    return FileResponse(
        output_file,
        media_type="application/pdf",
        filename="compressed.pdf",
        headers={
            "Content-Disposition": "attachment; filename=compressed.pdf",
            "X-Original-Size": str(original_size),
            "X-Compressed-Size": str(compressed_size),
        }
    )
