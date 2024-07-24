import { useNavigate } from "react-router-dom"
import styles from "./customer.module.css"
import { useEffect, useRef, useState } from "react";

interface CustomerInfo
{
    name: string;
    stamps: number;
    freeNum: number;
    dateAdded: string;
    lastVisit: string;
}
export default function Customer() 
{
    const stampHolderRef = useRef<HTMLDivElement>(null);
    const modalInputRef = useRef<HTMLInputElement>(null);
    const customerName: string = window.location.href.split('/')[window.location.href.split('/').length - 1].replace("%20", " ");
    
    const [info, setInfo] = useState<CustomerInfo | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalInput, setModalInput] = useState("");

    useEffect(() =>
    {
        if(!showModal)
        {
            setTimeout(() =>
            {
                setModalInput("");
            },350)
        }
        else
        {
            modalInputRef.current.focus();
        }
    },[showModal])

    const getInfo = async () =>
    {
        try
        {
            setInfo(await (window as any).electron.getCustomer(customerName))
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
            

            await (window as any).electron.addStamp(customerName);

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
            await (window as any).electron.redeemCoffee(customerName);
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

    const deleteCustomer = async () =>
    {
        if(modalInput.toLowerCase() == customerName.toLowerCase())
        {
            try 
            {
                await (window as any).electron.removeCustomer(customerName);    
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
    const navigate = useNavigate();
    return(
        <div id={styles.outerWrapper}>
            <button id={styles.backButton} onClick={() => navigate("/")}>
                Back
            </button>

            <div id={styles.customer}>
                <h1>
                    {customerName}
                </h1>
                <main id={styles.mainWrap}>
                    {info ? 
                        (
                            <>
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
                                                                stamps.push(<div className={styles.stamped}></div>)
                                                            }
                                                            else
                                                            {
                                                                stamps.push(<div></div>)
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
                                <button id={styles.deleteButton} onClick={() => setShowModal(true)}>Remove Customer</button>
                            </>
                        ) 
                        : 
                        (
                            <div>Loading...</div>
                        )
                    }
                </main>
                
                <>
                    {showModal && (

                        <div 
                            id={styles.modal} 
                            className={showModal ? styles.active : ""} 

                            onClick={(e) => 
                            {
                                if((e.target as HTMLElement).id === styles.modal)
                                {
                                    setShowModal(false)
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
                                        <input type="text" required={true} value={modalInput} maxLength={50} onChange={e => setModalInput(e.target.value)} placeholder="Customer Name" ref={modalInputRef}/>                
                                        <div id={styles.modalButtonWrap}>
                                            <button type="submit">
                                                Confirm
                                            </button>
                                            <button type="button" onClick={() => setShowModal(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                
                            </main>
                        </div>
                    )}
                </>
            </div>
        </div>
    )
}
