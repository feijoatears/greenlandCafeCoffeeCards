import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electron',
{
    showMessage: (msg: string) =>
    {
        try 
        {
            
            return ipcRenderer.invoke('show-message', msg)
        } 
        catch (error) 
        {
            console.log(error)
        }
    },

    keyClose: () => 
    {
        try 
        {
            ipcRenderer.invoke('key-close')
        } 
        catch (error) 
        {
            console.log(error)    
        }
    }
})