const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  Notification,
  Menu,
} = require("electron");
const path = require("path");
const fs = require("fs");

const isDevEnv = process.env.NODE_ENV === "development";

if (isDevEnv) {
  try {
    require("electron-reloader")(module);
  } catch {}
}

let mainWindow;
let openedFilePath;
let textareaContent = "";

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(app.getAppPath(), "renderer.js"),
    },
  });

  if (isDevEnv) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile("index.html");

  const menuTemplate = [
    {
      label: "Open",
      click: () => ipcMain.emit("file-open"),
    },
    {
      label: "Save",
      click: () => ipcMain.emit("file-save"),
    },
    {
      label: "Save As",
      click: () => ipcMain.emit("file-save-as"),
    },
    {
      label: "Exit",
      role: "quit",
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(createWindow);

const handleError = () => {
  new Notification({
    title: "Error",
    body: "Sorry, something went wrong :(",
  }).show();
};

const openFile = (filePath) => {
  fs.readFile(filePath, "utf8", (error, content) => {
    if (error) {
      handleError();
    } else {
      app.addRecentDocument(filePath);
      openedFilePath = filePath;
      mainWindow.webContents.send("document-opened", { filePath, content });
      mainWindow.setTitle("Блокнот " + path.parse(filePath).base);
    }
  });
};

app.on("open-file", (_, filePath) => {
  openFile(filePath);
});

ipcMain.on("file-open", () => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "text files", extensions: ["txt"] }],
    })
    .then(({ filePaths }) => {
      const filePath = filePaths[0];

      openFile(filePath);
    });
});

ipcMain.on("file-content-updated", (_, content) => {
  textareaContent = content;
});

ipcMain.on("file-save-as", () => {
  dialog
    .showSaveDialog(mainWindow, {
      filters: [{ name: "text files", extensions: ["txt"] }],
    })
    .then(({ filePath }) => {
      fs.writeFile(filePath, textareaContent, (error) => {
        if (error) {
          handleError();
        } else {
          app.addRecentDocument(filePath);
          openedFilePath = filePath;
          mainWindow.webContents.send("document-created", filePath);
        }
      });
    });
});

ipcMain.on("file-save", () => {
  console.log(`123`, openedFilePath, textareaContent)
  fs.writeFile(openedFilePath, textareaContent, (error) => {
    if (error) {
      console.log(error);
      handleError();
    }
  });
});

ipcMain.on("file-print", () => {
  let win = BrowserWindow.getFocusedWindow();

  var options = {
    silent: false ,
    printBackground: true ,
    color: false ,
    margin: {
    marginType: 'printableArea'
    },
    landscape: false ,
    pagesPerSheet: 1,
    collate: false ,
    copies: 1,
    header: 'Header of the Page' ,
    footer: 'Footer of the Page'
    }
  win.webContents.print(options, (success, failureReason) => {
    if (!success) console.log(failureReason);
    console.log( 'Print Initiated' );
    });
});
