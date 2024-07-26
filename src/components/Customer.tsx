import { useNavigate, useParams } from "react-router-dom"
import styles from "./customer.module.css"
import { FormEvent, useEffect, useRef, useState } from "react";

interface CustomerInfo
{
    id: number,
    name: string;
    stamps: number;
    freeNum: number;
    dateAdded: string;
    lastVisit: string;
}
export default function Customer() 
{
    const stampHolderRef = useRef<HTMLDivElement>(null);
    const deleteModalInputRef = useRef<HTMLInputElement>(null);
    const customerID = parseInt(window.location.href.split("/")[window.location.href.split("/").length - 1]);
    
    const [info, setInfo] = useState<CustomerInfo | null>(null);
    const [editFreeNum, setEditFreeNum] = useState<number>(0); 
    const [editStamps, setEditStamps] = useState<number>(0);
    const [editName, setEditName] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteModalInput, setDeleteModalInput] = useState("");

    useEffect(() =>
    {
        if(!showDeleteModal)
        {
            setTimeout(() =>
            {
                setDeleteModalInput("");
            },350)
        }
        else
        {
            deleteModalInputRef.current.focus();
        }
    },[showDeleteModal])

    useEffect(() =>
    {
        if(!showEditModal)
        {
            if(info)
            {
                setTimeout(() => 
                {
                    setEditName(info.name);
                    setEditStamps(info.stamps);
                    info.freeNum <= 20 ?
                    setEditFreeNum(info.freeNum)
                    :
                    setEditFreeNum(0);
                }, 350);
            }
        }
    }, [showEditModal])
    const getInfo = async () =>
    {
        try
        {
            setInfo(await (window as any).electron.getCustomer(customerID));
        }
        catch(err)
        {
            (window as any).electron.createAlert(err)
        }
    }

    const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

    let addingStamp = false;

    const addStamp = async (stamps: number) => 
    {
        if(addingStamp) return
        addingStamp = true;
        const stampDivs = Array.from((stampHolderRef.current as HTMLElement).children);
        try 
        {   
            

            await (window as any).electron.addStamp(customerID);

            if(stamps === 6)
            {
                stampDivs[stamps].classList.add(styles.stamped);
                (stampDivs[stamps] as HTMLDivElement).style.scale = "1.25";
                stampDivs[stamps].animate(
                    [
                        {transform:"scale(1)"},
                        {transform:"scale(0.85)"},
                        {transform:"scale(1)"},

                    ],
                    {
                        duration: 350,
                        easing: "cubic-bezier(0,-2,.5,1.88)"
                    }
                );
                await delay(500);
                (stampHolderRef.current as HTMLElement).animate(
                    [ 
                        {transform: "translateX(0px)"},
                        {transform: "translateX(6px)"},
                        {transform: "translateX(-6px)"},
                        {transform: "translateX(0px)"}
                    ],
                    {
                        duration: 250,
                        iterations: 1
                    }
                )
                await delay(500);
                stampDivs.forEach(item =>
                {
                    item.classList.remove(styles.stamped);
                    (item as HTMLDivElement).style.scale = "1";
                })
            }
            else
            {
                for(let i = 0; i < stampDivs.length; i++)
                {
                    if(i < stamps)
                    {
                        stampDivs[i].classList.add(styles.stamped);
                    }
                }
                stampDivs[stamps].animate(
                    [
                        {transform:"scale(1)"},
                        {transform:"scale(0.85)"},
                        {transform:"scale(1)"},

                    ],
                    {
                        duration: 350,
                        easing: "cubic-bezier(0,-2,.5,1.88)"
                    }
                );

                (stampDivs[stamps] as HTMLElement).style.scale = "1.25"
            }
            /* stampDivs.forEach((item,  i) =>
            {
                if(i < stamps + 1)
                {
                    item.classList.add(styles.stamped);   
                }
            }) */


            getInfo();
        } 
        catch (err) 
        {
           (window as any).electron.createAlert(err)
        }
        finally
        {
            addingStamp = false;
        }
    };


    const redeemCoffee = async () => 
    {
        try 
        {
            await (window as any).electron.redeemCoffee(customerID);
            if(info.freeNum === 0)    
            {
                (window as any).electron.createAlert(new Error("Not enough Stamps"))
            }
            getInfo()
        } 
        catch (err) 
        {
            (window as any).electron.createAlert(err);
        }
    }

    const editCustomer = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(formData)
        const editData: CustomerInfo = 
        {
            id: customerID,
            name: formData.get("name") as string,
            stamps: parseInt(formData.get('stamps') as string),
            freeNum: parseInt(formData.get("freeNum") as string),
            lastVisit: info.lastVisit,
            dateAdded: info.dateAdded
        }
        
        await (window as any).electron.editCustomer(info.id, editData.name, editData.stamps, editData.freeNum);
        getInfo()
        setInfo(editData);
        setShowEditModal(false);
    }

    const deleteCustomer = async () =>
    {
        if(deleteModalInput.toLowerCase() == info.name.toLowerCase())
        {
            try 
            {
                await (window as any).electron.removeCustomer(customerID);    
                navigate("/");
            } 
            catch (err) 
            {
                (window as any).electron.createAlert(err);
            } 
        }
        else
        {
            (window as any).electron.createAlert(new Error("Customer's name is incorrect"))
        }
    }
    useEffect(() =>
    {
        getInfo();
    }, [])
    useEffect(() =>
    {
        if(info)
        {
            setEditName(info.name)
            setEditStamps(info.stamps)

            info.freeNum <= 20 ?
            setEditFreeNum(info.freeNum)
            :
            setEditFreeNum(0);
        }
    }, [info])
    const navigate = useNavigate();
    return(
        <div id={styles.outerWrapper}>
            <div id={styles.outerButtonWrap}>
                <button onClick={() => navigate("/")}>
                    Back
                </button>
                <button onClick={() => {setShowEditModal(true)}}>
                    Edit
                </button>
            </div>
            <div id={styles.customer}>
                <main id={styles.mainWrap}>
                    {info ? 
                        (
                            <>
                                <h1>
                                    {info.name}
                                </h1>
                                <div id={styles.infoWrap}>
                                    <div>
                                        <h4>Current Stamps</h4>
                                        <div id={styles.stampHolder} ref={stampHolderRef} onClick={() => addStamp(info.stamps)}>
                                            {
                                                (
                                                    () =>
                                                    {
                                                        const stamps = [];
                                                        for(let i = 0; i < 7; i++)
                                                        {
                                                            if(i < info.stamps)
                                                            {
                                                                stamps.push(<div key={i} className={styles.stamped}></div>)
                                                            }
                                                            else
                                                            {
                                                                stamps.push(<div key={i}></div>)
                                                            }
                                                            
                                                        }
                                                        return stamps;
                                                    }
                                                )()
                                                
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <h4>Free Coffees</h4>
                                        <p>
                                            {info.freeNum}
                                        </p>
                                    </div>
                                </div>

                                <div id={styles.buttonWrap}>
                                    <button onClick={() => {if(!addingStamp) addStamp(info.stamps)}}>Add Stamp</button>
                                    <button onClick={redeemCoffee}>Redeem Coffee</button>
                                </div>
                                <div id={styles.date}>
                                    <div>
                                        Date Added: {info.dateAdded}
                                    </div>
                                    <div>
                                        Date Last Visited: {info.lastVisit}
                                    </div>
                                </div>
                                <button id={styles.deleteButton} onClick={() => setShowDeleteModal(true)}>Remove Customer</button>


                                <div 
                    id={styles.deleteModal} 
                    className={showDeleteModal ? styles.active : ""} 

                    onClick={(e) => 
                    {
                        if((e.target as HTMLElement).id === styles.deleteModal)
                        {
                            setShowDeleteModal(false)
                        }
                    }
                }>

                            <main>
                                    <div>
                                        <h2>
                                            Are you sure you want to remove this customer?
                                        </h2>
                                        <p>
                                            Please enter the customer's name to confirm
                                        </p>
                                    </div>
                                    <form onSubmit={deleteCustomer}>
                                        <input type="text" required={true} value={deleteModalInput} maxLength={50} onChange={e => setDeleteModalInput(e.target.value)} placeholder="Customer Name" ref={deleteModalInputRef}/>                
                                        <div id={styles.modalButtonWrap}>
                                            <button type="submit">
                                                Confirm
                                            </button>
                                            <button type="button" onClick={() => setShowDeleteModal(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                
                            </main>
                </div>
               
                    <div 
                        id={styles.editModal}
                        className={showEditModal ? styles.active : ""}

                        onClick={(e) =>
                        {
                            if((e.target as HTMLElement).id === styles.editModal)
                            {
                                setShowEditModal(false);
                            }
                        }}
                    >
                        <main>
                            <button id={styles.editCancelButton} onClick={() => setShowEditModal(false)}>&#x2715;</button>
                            <form onSubmit={editCustomer}>
                                <div>
                                    <label>Change Name</label>
                                    <input name="name" type="text" maxLength={50} placeholder="Customer Name" value={editName} onChange={e => setEditName(e.target.value)}/>
                                </div>
                                <div>
                                    <label>Change Stamps</label>
                                    <input type="range" max={6} min={0} name="stamps" value={editStamps} onChange={e => setEditStamps(parseInt(e.target.value))}/>
                                    <label>{editStamps}</label>
                                </div>
                                <div>
                                    <label>Change Free Coffees</label>
                                    <input type="range" max={20} min={0} name="freeNum" value={editFreeNum} onChange={e => setEditFreeNum(parseInt(e.target.value))} />
                                    <label>{editFreeNum}</label>
                                </div>
                                <button type="submit">Confirm Edit</button>
                            </form>
                        </main>

                    </div>
                            </>
                        ) 
                        : 
                        (
                            <div>Loading...</div>
                        )
                    }
                </main>
                
                
                </div>
            </div>
    )
}
