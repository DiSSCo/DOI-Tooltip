/* Import Dependencies */
import { useState, useEffect, useRef } from "react";

/* Import Styles */
import './DOITooltip.css';


/* Props Typing */
interface Props {
    doi: string
    children: string | React.ReactElement,
};


const DOITooltip = (props: Props) => {
    const { doi, children } = props;

    /* Hooks */
    const DOITooltipRef = useRef<HTMLDivElement>(null);

    /* Base variables */
    const [_record, setRecord] = useState();
    const [active, setActive] = useState(false);

    /* Function for fetching DOI details */
    const TriggerTooltip = async () => {
        try {
            const response = await fetch(`https://hdl.handle.net/api/handles/${doi}`);
            const record = await response.json();
            setActive(true);

            setRecord(record);
        } catch (error) {
            console.warn(error);
        }
    }

    /* Closing the Tooltip when clicked outside of it */
    const UseDOITooltip = () => {
        useEffect(() => {
            const DOITooltipElement = DOITooltipRef.current as HTMLDivElement;

            const handleClickOutside = (event: any) => {
                if (!DOITooltipElement.contains(event.target)) {
                    if (active) {
                        setActive(false);
                    }
                }
            }

            document.addEventListener("mousedown", handleClickOutside);

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [DOITooltipRef, active])
    }

    UseDOITooltip();

    return (
        <>
            <span onClick={() => TriggerTooltip()}> {children} </span>

            <div id="disscoTooltip" className={`tooltip ${active && 'active'}`} ref={DOITooltipRef}>
                {/* Digital Extended Specimen */}
                <div className="tooltipRow">
                    <div className="widthLeft">
                        <p className="digitalExtendedSpecimenTitle"> DES </p>
                    </div>
                    <div className="widthRight">
                        <p id="tooltipScientificName" className="digitalExtendedSpecimenTitle"> Adonis flammea </p>
                        <p id="tooltipStatus" className="preservedStatus textOverflow"> (preserved botany specimen) </p>
                    </div>
                </div>

                {/* ID */}
                <div className="tooltipRow margin">
                    <span className="widthLeft">
                        <p className=""> ID </p>
                    </span>
                    <span className="widIDTitlethRight">
                        <p id="tooltipID" className="IDField"> ID of the specimen </p>
                        <p id="tooltipGUID" className="IDField"> (Catalog Record GUID) </p>
                    </span>
                </div>

                {/* Organisation */}
                <div className="tooltipRow margin">
                    <span className="widthLeft">
                        <img src="../webroot/building-columns-solid.svg" className="organisationIcon" alt="ORG" />
                    </span>
                    <span className="widthRight">
                        <p id="tooltipOrganisation" className="organisationTitle"> Organisation of specimen </p>
                    </span>
                </div>

                {/* DOI Logo */}
                <div className="tooltopRow DOIRow">
                    <img src="../webroot/DOI_logo.png" alt="DOI Logo" className="DOILogo" />
                </div>
            </div>
        </>
    );
}

export default DOITooltip;