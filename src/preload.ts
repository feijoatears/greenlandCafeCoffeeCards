import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron",
{

    createAlert: (err:Error) =>
    {
        ipcRenderer.invoke('create-alert', err)
    },

    getAllRows: async () => 
    {
        try
        {
            return await ipcRenderer.invoke("get-all-rows");
        }
        catch(e)
        {
            throw new Error(e);
        }
    },

    searchCustomers: async (name: string) =>
    {
        try
        {
            return await ipcRenderer.invoke("search-customers", name);
        }
        catch(e)
        {
            throw new Error(e);
        }
    },

    getCustomer: async (name: string) =>
    {
        try
        {
            return await ipcRenderer.invoke("get-customer", name);
        }
        catch(e)
        {
            throw new Error(e);
        }
    },

    addStamp: async (name: string) =>
    {
        return await ipcRenderer.invoke("add-stamp", name);    
    },
    addCustomer: async (name:string, stamps:number, freeNum:number) =>
    {
        return await ipcRenderer.invoke("add-customer", name, stamps, freeNum)
    },
    redeemCoffee: async (name: string) =>
    {
        try 
        {
            return await ipcRenderer.invoke("redeem-coffee", name);    
        } 
        catch (e) 
        {
            throw new Error(e);
        }
    },

    removeCustomer: async (name:string) =>
    {
        try 
        {
            return await ipcRenderer.invoke("remove-customer", name);    
        } 
        catch (e) 
        {
            throw new Error(e);    
        }
    }
})