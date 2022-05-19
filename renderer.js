const { ipcRenderer, BrowserWindow } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const el = {
    paletteButton: document.getElementById("paletteBtn"),
    fileTextarea: document.getElementById("fileTextarea"),
    fontSelect: document.getElementById("font-select"),
    printButton: document.getElementById("printButton"),
  };

  const handleDocumentChange = (filePath, content = "") => {
    el.fileTextarea.removeAttribute("disabled");
    el.fileTextarea.value = content;
    el.fileTextarea.focus();
  };

  el.paletteButton.addEventListener("input", (e) => {
    el.fileTextarea.style.color = e.target.value;
  });

  el.fileTextarea.addEventListener("input", (e) => {
    ipcRenderer.send("file-content-updated", e.target.value);
  });

  el.fontSelect.addEventListener("change", (e) => {
    switch (e.target.value) {
      case "time-new-roman":
        el.fileTextarea.style.fontFamily = "'Times New Roman', Times, serif";
        break;
      case "coureur-new":
        el.fileTextarea.style.fontFamily = "'Courier New', Courier, monospace";
        break;
      case "arial":
        el.fileTextarea.style.fontFamily = "Arial, Helvetica, sans-serif";
        break;
    }
  });

  el.printButton.addEventListener("click", (e) => {
    ipcRenderer.send("file-print");
  });

  ipcRenderer.on("document-opened", (_, { filePath, content }) => {
    handleDocumentChange(filePath, content);
  });

  ipcRenderer.on("document-created", (_, filePath) => {
    handleDocumentChange(filePath);
  });
});
