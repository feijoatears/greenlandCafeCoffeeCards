import React, { FormEvent, useEffect, useRef, useState } from 'react'
import styles from "./home.module.css";
import { Link } from 'react-router-dom';
import CustomerCard from './CustomerCard';

interface Customer
{
    id: number;
    name: string;
    stamps: number;
    freeNum: number;
    lastVisit: string;
    dateAdded: string;
}
interface Query
{
    query: string;
}
const Home: React.FC<Query> = ({query}) =>
{
    const addCustomerRef = useRef(null),
          nameInputRef = useRef<HTMLInputElement>(null);
    
    const [optionStamps, setOptionStamps] = useState("0"),
          [optionFreeNum, setOptionFreeNum] = useState("0");

    const [customers, setCustomers] = useState<Customer[]>([]),
          [addCustomer, showAddCustomer] = useState<boolean>(false),
          [filter, showFilter] = useState<boolean>(false);
    
    const fetchData = async () =>
    {
        try
        {
            setCustomers(await (window as any).electron.getAllRows());
        }
        catch(err)
        {
            (window as any).electron.createAlert(err);
        }
    }
    const getSearchQuery = async () =>
    {
        try
        {
            setCustomers(await (window as any).electron.searchCustomers(query))
        }
        catch(err)
        {
            (window as any).electron.createAlert(err);
        }
    }
    useEffect(() => 
    { 
        if(query)
        {
            getSearchQuery();
        }
        else
        {
            fetchData() 
        }
    }, [query])
    useEffect(() =>
    {
        if(addCustomer)
        {
            nameInputRef.current.focus();
        }
        else
        {
            setTimeout(() =>
                {
                    addCustomerRef.current?.reset();
                    setOptionStamps("0");
                    setOptionFreeNum("0");
                }, 200)

        }
    }, [addCustomer])
    
    const handleFilter = async (filterType: string) =>
    {
        await fetchData();
 
        switch(filterType)
        {
            case "A-Z":
            {
                setCustomers([...customers].sort((a, b) =>
                {
                    
                    if(a.name.toLowerCase() < b.name.toLowerCase())
                    {
                        return -1;
                    }
                    if(b.name.toLowerCase()> a.name.toLowerCase())
                    {
                        return 1;
                    }
                    return 0;
                }))
                break;
            }
            case "Stamps":
            {
                setCustomers([...customers].sort((a, b) =>
                {
                    if(a.stamps > b.stamps)
                    {
                        return -1;
                    }
                    if(b.stamps > a.stamps)
                    {
                        return 1;
                    }
                    return 0;
                }))
                break;
            }
            case "Date":
            {
                setCustomers([...customers].sort((a, b) => 
                {
                    const dateA = parseInt((a.lastVisit as string).split("/").reverse().join("")),
                          dateB = parseInt((b.lastVisit as string).split("/").reverse().join(""))
                          

                    if(dateA > dateB)
                    {
                        return -1;
                    }
                    if(dateB > dateA)
                    {
                        return -1;
                    }
                    return 0;
                }))
                break;
            }
        }
    }

    const handleAddCustomer = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault()
        const formData = new FormData(e.currentTarget);
        const newCustomer = 
        {
            name: formData.get('name') as string,
            stamps: formData.get('stamps') as string,
            freeNum: formData.get('freeNum') as string
        }
        
        try
        {
            await (window as any).electron.addCustomer(newCustomer.name, parseInt(newCustomer.stamps), parseInt(newCustomer.freeNum))
            fetchData();
            showAddCustomer(false);
            
        }
        catch(err)
        { 
            // will fix later
        }
    }
    return (
        <div id={styles.home}>
        
            <div id={styles.topButtonWrap}>
                <button id={styles.addCustomer} onClick={() => {showAddCustomer(true)}}> Add Customer </button>
                <button onClick={() => {showFilter(!filter)}}> Filter </button> 
                <div id={styles.filter}
                    className={filter ? styles.active : ""}>
                    <button onClick={() => {handleFilter("A-Z")}}>Filter A-Z</button>
                    <button onClick={() => {handleFilter("Stamps")}}>Filter by Stamps</button>
                    <button onClick={() => {handleFilter("Date")}}>Filter by Last Visit Date</button>
                </div>
            </div>
            
            
            <div id={styles.customerList}>
                {
                    customers.length < 1 && query ?
                    (
                        <>
                            <div id={styles.noCustomers}>
                                No customers found for the name '{query}'
                            </div>
                        </>
                    )
                    :
                    customers.length < 1 ?
                    (
                        <>
                            <div id={styles.noCustomers}>
                                No customers yet 😔
                            </div>
                        </>
                    )
                    :
                    (
                        customers.map((customer, key) => 
                        (
                            <Link key={key} to={`customer/${customer.id}`}>
                                <CustomerCard 
                                    id={customer.id}
                                    name={customer.name} 
                                    stamps={customer.stamps}
                                    freeNum={customer.freeNum}
                                    dateAdded={customer.dateAdded}
                                    lastVisit={customer.lastVisit}
                                />
                            </Link>
                        ))
                    )

                }
            </div>            

            <div 
                id={styles.addCustomerModal}
                className={addCustomer ? styles.active : ""}

                onClick={(e) =>
                {
                    if((e.target as HTMLElement).id === styles.addCustomerModal)
                    {
                        showAddCustomer(false);
                    }
                }}
            >
                <main>
                    <div id={styles.customerName}>
                        <form onSubmit={handleAddCustomer} ref={addCustomerRef}>
                            <input placeholder='Customer Name' required={true} maxLength={50} name="name" ref={nameInputRef}></input>
                            <div id={styles.optionWrap}>
                                <div>
                                    <label>Add Stamps?</label>
                                    <input type="range" max={6} min={0} name="stamps" defaultValue={0} onChange={e => setOptionStamps(e.target.value)}/>
                                    <label>{optionStamps}</label>
                                </div>
                                <div>
                                    <label>Add Free Coffees?</label>
                                    <input type="range" max={20} min={0} name="freeNum" defaultValue={0} onChange={e => setOptionFreeNum(e.target.value)}/>
                                    <label>{optionFreeNum}</label>
                                </div>

                            </div>
                            <div id={styles.customerNameButtonWrap}>
                                <button type="submit">
                                    Add Customer
                                </button>
                                <button 
                                    onClick={(e) => 
                                    {
                                        e.preventDefault(); 
                                        showAddCustomer(false); 
                                    }}
                                    >
                                        Cancel
                                    </button>
                            </div>                            
                        </form>
                    </div>
                </main>
            </div>
        </div>
  )
}
export default Home;