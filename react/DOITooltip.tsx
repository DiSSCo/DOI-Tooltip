/* Import Dependencies */
import { useState, useEffect, useRef } from "react";

/* Import Styles */
import '../tooltip.css';

/* Import Webroot */
import TagLogo from '../webroot/tagLogo.png';
import OrganisationLogo from '../webroot/building-columns-solid.svg';
import DOILogo from '../webroot/DOI_logo.png';


/* Props Typing */
interface Props {
    doi: string
    children: string | React.ReactElement
};


const DOITooltip = (props: Props) => {
    const { doi, children } = props;

    /* Hooks */
    const targetRef = useRef<HTMLButtonElement>(null);
    const DOITooltipRef = useRef<HTMLDivElement>(null);

    /* Base variables */
    const [record, setRecord] = useState<any>({});

    /* Function to check if URL is valid */
    const IsValidUrl = (urlString: string) => {
        try {
            return Boolean(new URL(urlString));
        }
        catch (e) {
            return false;
        }
    }

    /* Closing the Tooltip when clicked outside of it */
    const UseDOITooltip = () => {
        const [active, setActive] = useState(false);

        useEffect(() => {
            const DOITooltipElement = DOITooltipRef.current as HTMLDivElement;

            const handleClickOutside = (event: any) => {
                if (!DOITooltipElement.contains(event.target)) {
                    if (active) {
                        setActive(false);

                        setRecord({})
                    }
                }
            }

            document.addEventListener("mousedown", handleClickOutside);

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);

            };
        }, [DOITooltipRef, active]);

        return {
            active,
            setActive
        };
    }

    const DOITooltip = UseDOITooltip();

    /* Function to map Handle or DOI response to valid record */
    const FormatHandleNetResponse = (responseRecord: { [name: string]: any }) => {
        const record = {
            data: {
                attributes: {
                    referentName: responseRecord.values[16].data.value,
                    specimenHost: responseRecord.values[18].data.value,
                    specimenHostName: responseRecord.values[19].data.value,
                    primarySpecimenObjectId: responseRecord.values[20].data.value,
                    topicDiscipline: responseRecord.values[27].data.value,
                    livingOrPreserved: responseRecord.values[29].data.value
                }
            }
        };

        return record;
    }

    /* Function to map Handle or DOI response to valid record */
    const FormatDOIOrgResponse = (responseRecord: { [name: string]: any }) => {
        const record = {
            data: {
                attributes: {
                    referentName: responseRecord.values[26].data.value,
                    specimenHost: responseRecord.values[14].data.value,
                    specimenHostName: responseRecord.values[15].data.value,
                    primarySpecimenObjectId: responseRecord.values[16].data.value,
                    topicDiscipline: responseRecord.values[23].data.value,
                    livingOrPreserved: responseRecord.values[25].data.value
                }
            }
        };

        return record;
    }

    /* Function for fetching DOI details */
    const TriggerTooltip = async () => {
        try {
            /* If DOI does not contain local prefix, try to resolve with the general handler */
            if (doi.includes('TEST') || doi.includes('SANDBOX')) {
                let environment: string = doi.includes('SANDBOX') ? 'sandbox' : 'dev';

                const response = await fetch(`https://${environment}.dissco.tech/handle-manager/api/v1/pids/${doi.replace(process.env.REACT_APP_DOI_URL as string, '')}`);
                const record = await response.json();

                if (record.data) {
                    setRecord(record);
                }
            } else if (doi.includes('20.5000.1025')) {
                const respone = await fetch(`https://hdl.handle.net/api/handles/${doi.replace(process.env.REACT_APP_DOI_URL as string, '')}`);
                const responseRecord = await respone.json();

                if (responseRecord.values.length) {
                    const record = FormatHandleNetResponse(responseRecord);

                    setRecord(record);
                }
            } else if (doi.includes('10.3535')) {
                const response = await fetch(`https://doi.org/api/handles/${doi.replace(process.env.REACT_APP_DOI_URL as string, '')}`);
                const responseRecord = await response.json();

                if (responseRecord.values.length) {
                    const record = FormatDOIOrgResponse(responseRecord);

                    setRecord(record);
                }
            } else {
                setRecord({});
            }

            DOITooltip.setActive(true);
        } catch (error) {
            console.warn(error);

            DOITooltip.setActive(true);
        }
    }

    /* Set offset styles for DOI Tooltip */
    const offsetStyles = {
        marginTop: (targetRef.current && DOITooltipRef.current && record.data) ? `${targetRef.current?.offsetTop - 210}px`
            : (targetRef.current && DOITooltipRef.current) ? `${targetRef.current?.offsetTop - 45}px` : '0px',
        marginLeft: targetRef.current ? `${targetRef.current?.offsetLeft}px` : '0px'
    }

    return (
        <>
            <button type="button" style={{ color: 'blue', cursor: 'pointer' }} ref={targetRef}
                onMouseEnter={() => TriggerTooltip()}
            >
                {children}
            </button>

            <div id="disscoTooltip" className={`tooltip ${DOITooltip.active && 'active'} ${!record.data && 'error'}`} ref={DOITooltipRef} style={offsetStyles}>
                {record.data ?
                    <>
                        {/* Digital Extended Specimen */}
                        <div className="tooltipRow grow">
                            <div className="widthLeft">
                                <img src={TagLogo}
                                    alt="Tag Logo"
                                    className="tagLogo"
                                />
                            </div>
                            <div className="widthRight">
                                <div>
                                    <a className="tooltipLink" href={`https://dev.dissco.tech/ds/${doi}`} target="_blank">
                                        <p id="tooltipScientificName" className="digitalExtendedSpecimenTitle"> {record.data.attributes.referentName} </p>
                                    </a>

                                    <p className="verbatimName">(Verbatim name)</p>
                                </div>
                                <div className="preservedStatusDiv grow">
                                    <p id="tooltipStatus" className="preservedStatus textOverflow">
                                        {`${record.data.attributes.livingOrPreserved}
                                    ${record.data.attributes.topicDiscipline.toLowerCase()} specimen`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ID */}
                        <div className="tooltipRow">
                            <span className="widthLeft">
                                <p className="IDTitle"> ID </p>
                            </span>
                            <span className="widthRight">
                                {IsValidUrl(record.data.attributes.primarySpecimenObjectId) ?
                                    <a href={record.data.attributes.primarySpecimenObjectId}
                                        className="tooltipLink"
                                    >
                                        {record.data.attributes.primarySpecimenObjectId}
                                    </a>
                                    : <p id="tooltipID" className="IDField">{record.data.attributes.primarySpecimenObjectId}</p>
                                }

                                <p id="tooltipGUID" className="catalogNumber"> (Catalog number) </p>
                            </span>
                        </div>

                        {/* Organisation */}
                        <div className="tooltipRow">
                            <span className="widthLeft">
                                <img src={OrganisationLogo} className="organisationIcon" alt="ORG" />
                            </span>
                            <span className="widthRight">
                                <a className="tooltipLink" href={record.data.attributes.specimenHost} target="_blank">
                                    <p id="tooltipOrganisation" className="organisationTitle"> {record.data.attributes.specimenHostName} </p>
                                </a>
                            </span>
                        </div>

                        {/* DOI Logo */}
                        <div className="tooltopRow DOIRow">
                            <span className="digitalExtendedSpecienNote">DES</span>

                            <img src={DOILogo} alt="DOI Logo" className="DOILogo" />
                        </div>
                    </>
                    : <p className="warningMessage"> Invalid DOI was provided, please try again </p>
                }
            </div>
        </>
    );
}

export default DOITooltip;