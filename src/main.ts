__webpack_require__.ab = __dirname + "/native_modules/";
import { app, BrowserWindow, dialog, ipcMain, Menu, globalShortcut } from 'electron';
import sqlite3 from 'sqlite3';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SNAKE_WINDOW_WEBPACK_ENTRY: string;
declare const SNAKE_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const sql = sqlite3.verbose();
const db = new sql.Database("local.db", (err =>
{
    if(err)
    {
        createAlert(err);
    }

}));

let mainWindow: BrowserWindow | null;
let snakeWindow : BrowserWindow | null;


if (require('electron-squirrel-startup')) 
{
  app.quit();
}

const showSnake = (): void =>
{
    if(snakeWindow && !snakeWindow.isDestroyed())
    {
        snakeWindow.show();
        return;
    }
    snakeWindow = new BrowserWindow
    (
        {
            height:800,
            width: 800,
            autoHideMenuBar: true,
            resizable: false,
            webPreferences:
            {
                preload: SNAKE_WINDOW_PRELOAD_WEBPACK_ENTRY,
                webSecurity: true,
                nodeIntegration: false
            }
        }
    )
    
    snakeWindow.loadURL(SNAKE_WINDOW_WEBPACK_ENTRY);
        
    snakeWindow.on("close", () =>
    {
        snakeWindow = null;
    })

}
ipcMain.handle('show-message', async (e, message: string) => 
{
        
    const dialogBox = await dialog.showMessageBox(snakeWindow, 
    {
        type: "info",
        buttons: ['OK'] ,
        title: "Score",
        message: message
    })
    return dialogBox.response;
})
ipcMain.handle('key-close', () =>
{
    snakeWindow.close();
    snakeWindow = null;
})

const createWindow = (): void => 
{
    mainWindow = new BrowserWindow
    (
        {
            height: 800,
            width: 800,
            resizable: false,
            autoHideMenuBar: true,
            title: "Greenland Cafe Coffee Cards",
            icon: "./resources/images/logo.ico",
            webPreferences: 
            {
                contextIsolation: true,
                sandbox: true,
                nodeIntegration: false,
                webSecurity: true,
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            },
        }
    );
    
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

const createAlert = (message : Error): void =>
{ 
    dialog.showMessageBox(mainWindow,
    {
        type:"error",
        buttons: ['OK'],
        title: "Error",
        message: message.message
    });
};

// Handles

ipcMain.handle("get-all-rows", async () =>
{

return new Promise((res, rej) =>
{
    db.all("SELECT * FROM customers", (err, rows) =>
    {
        if(err)
        {
            rej();
        }
        else
        {
            res(rows);
        }
    })
})
})
ipcMain.handle("add-customer", async (e, name:string, stamps: number, freeNum:number) => 
{
    const dateAdded: string = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                                .toISOString()
                                .split("T")[0]
                                .split("-")
                                .reverse()
                                .join("/"); 
    //account for timezone, then return in dd/mm/yyyy format

    return new Promise((res) => 
    {
        db.run(`INSERT INTO customers (name, stamps, freeNum, dateAdded, lastVisit) VALUES (?, ?, ?, ?, ?)`,
            [name, stamps, freeNum, dateAdded, dateAdded], 
            (err) =>
            {
                if(err)
                {
                    createAlert(new Error(`Couldn't add customer to database: ${err}`))
                }
                else
                {
                    res({success: true});
                }
            }
        )
    })
});
ipcMain.handle("search-customers", async (e, name: string) =>
{
    return new Promise((res, rej) =>
    {
        db.all(`SELECT * FROM customers WHERE name LIKE "%${name}%"`, (err, rows) =>
        {
            if(err)
            {
                rej(err);
            }
            else
            {
                res(rows);
            }
        })
    })
})
ipcMain.handle("get-customer", async (e, id: number) =>
{
    return new Promise((res, rej) =>
    {
        db.get(`SELECT * FROM customers WHERE id = ${id}`, (err, row) =>
        {
            if(err)
            {
                rej(err);
            }
            else
            {
                res(row);
            }
        })
    })
})
ipcMain.handle("add-stamp", async (e, id: number) =>
{
    const date: string = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                            .toISOString()
                            .split("T")[0]
                            .split("-")
                            .reverse()
                            .join("/");
    return new Promise((res, rej) => 
    {
        db.run(`UPDATE customers SET 
                stamps = CASE WHEN stamps + 1 > 6 THEN 0 ELSE stamps + 1 END,
                freeNum = CASE WHEN stamps + 1 > 6 THEN freeNum + 1 ELSE freeNum END,
                lastVisit = "${date}"
                WHERE id = ${id}`, (err) =>
        {
            if(err)
            {
                rej(err);
            }
            else
            {
                res({msg: "Successfully added stamp"});
            }
        })
    }
    )
});
ipcMain.handle('create-alert', (e, message) =>
{
    createAlert(message);
})
ipcMain.handle("redeem-coffee", async (e, id: number) =>
{
    const date: string = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                                .toISOString()
                                .split("T")[0]
                                .split("-")
                                .reverse()
                                .join("/");
    return new Promise((res, rej) => 
    {
        db.run(`UPDATE customers SET 
                freeNum = CASE WHEN freeNum - 1 < 0 THEN 0 ELSE freeNum - 1 END,
                lastVisit = "${date}"
                WHERE id = ${id}`, (err) =>
        {
            if(err)
            {
                rej(err);
            }
            else
            {
                res({msg: "Successfully redeemed coffee"});
            }
        })
    })
})
ipcMain.handle("remove-customer", async (e, id: number) =>
{
    return new Promise((res, rej) =>
    {
        db.run(`DELETE FROM customers WHERE id = "${id}"`, err =>
        {
            if(err)
            {
                rej(err);
            }
            else
            {
                res({msg: "Successfully removed customer"})
            }
        })
    })
})
ipcMain.handle("edit-customer", async (e, id: number, name:string, stamps: number, freeNum: number) =>
{
    return new Promise((res, rej) =>
    {
        db.run(`UPDATE customers SET
                name = ?,
                stamps = ?,
                freeNum = ?
                WHERE id = ?`,
                [name, stamps, freeNum, id],
                err =>
                {
                    if(err)
                    {
                        rej(err);
                    }
                    else
                    {
                        res({msg: "Successfully updated customer"})
                    }
                })
    })
})

// End of Handles

app.on('ready', async () => 
{
    try
    {
        db.serialize( () =>
        {
            db.run(`CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                                                          name VARCHAR(50) NOT NULL, 
                                                          stamps INTEGER, 
                                                          freeNum INTEGER, 
                                                          dateAdded DATE, 
                                                          lastVisit DATE)`);
        })
        createWindow();

        /* const menuTemplate = 
        [
            {
                label: "Exit",
                click: () => app.quit(),
            },
        ]
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu); */
    }
    catch(err)
    {
       createAlert(err);
    }

    globalShortcut.register('Ctrl+Alt+S', () => 
    { 
        showSnake(); 
    })
});

app.on('window-all-closed', () => 
{
  if (process.platform !== 'darwin') 
  {
    app.quit();
  }
});

app.on('activate', () => 
{
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
