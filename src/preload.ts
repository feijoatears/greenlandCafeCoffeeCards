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

    getCustomer: async (id: number) =>
    {
        try
        {
            return await ipcRenderer.invoke("get-customer", id);
        }
        catch(e)
        {
            throw new Error(e);
        }
    },

    addStamp: async (id: number) =>
    {
        return await ipcRenderer.invoke("add-stamp", id);
    },
    
    addCustomer: async (name:string, stamps:number, freeNum:number) =>
    {
        return await ipcRenderer.invoke("add-customer", name, stamps, freeNum)
    },

    editCustomer: async (id: number, newName: string, stamps: number, freeNum: number) =>
    {
        return await ipcRenderer.invoke("edit-customer", id, newName, stamps, freeNum);
    },

    removeCustomer: async (id: number) =>
    {
        try 
        {
            return await ipcRenderer.invoke("remove-customer", id);
        } 
        catch (e) 
        {
            throw new Error(e);    
        }
    },
    redeemCoffee: async (id: number) =>
    {
        try 
        {
            return await ipcRenderer.invoke("redeem-coffee", id);    
        } 
        catch (e) 
        {
            throw new Error(e);
        }
    },

})