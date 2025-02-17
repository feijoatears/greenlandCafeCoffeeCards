import styles from "./customercard.module.css";

interface CustomerInfo
{
    id: number;
    name: string;
    stamps: number;
    freeNum: number;
    dateAdded: string;
    lastVisit: string;
}

export default function CustomerCard(props: CustomerInfo) 
{
    return(
        <div id={styles.mainWrap}>
            <div id={styles.name}>{props.name.length > 30 ? props.name.slice(0, 30) + '...' : props.name}</div>
            <div id={styles.info}>
                <div>
                    Stamps: {props.stamps}
                </div>
                <div>
                    Free Coffees: {props.freeNum}
                </div>
                <div>
                    Last Visit: {props.lastVisit}
                </div>
            </div>
        </div>
    );
}
