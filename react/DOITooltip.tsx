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

    /**
     * Function to map a DOI response to an usable record
     * @param responseRecord The record received from the DOI API
     */
    const FormatResponse = (responseRecord: { [name: string]: any }) => {
        const record = {
            data: {
                attributes: {
                    referentName: responseRecord.values.find((value: { [name: string]: any }) => value.type === 'referentName')?.data.value ?? '',
                    loc: responseRecord.values.find((value: { [name: string]: any }) => value.type === '10320/loc')?.data.value ?? '',
                    specimenHost: responseRecord.values.find((value: { [name: string]: any }) => value.type === 'specimenHost')?.data.value ?? '',
                    specimenHostName: responseRecord.values.find((value: { [name: string]: any }) => value.type === 'specimenHostName')?.data.value ?? '',
                    primarySpecimenObjectId: responseRecord.values.find((value: { [name: string]: any }) => value.type === 'catalogNumber')?.data.value ?? '--',
                    topicDiscipline: responseRecord.values.find((value: { [name: string]: any }) => value.type === 'topicDiscipline')?.data.value ?? '',
                    livingOrPreserved: responseRecord.values.find((value: { [name: string]: any }) => value.type === 'livingOrPreserved')?.data.value ?? ''
                }
            }
        };

        return record;
    };

    /* Function for fetching DOI details */
    const TriggerTooltip = async () => {
        try {
            /* If DOI does not contain local prefix, try to resolve with the general handler */
            if (doi.includes('TEST') || doi.includes('SANDBOX')) {
                let environment: string = doi.includes('SANDBOX') ? 'sandbox' : 'dev';

                /* Format for CRA */
                const response = await fetch(`https://${environment}.dissco.tech/handle-manager/api/pids/v1/${doi.replace(process.env.REACT_APP_DOI_URL as string, '')}`);
                /* Format for VITE
                const response = await fetch(`https://${environment}.dissco.tech/handle-manager/api/pids/v1/${doi.replace(import.meta.env.VITE_DOI_URL as string, '')}`);
                */
                const record = await response.json();

                if (record.data) {
                    setRecord(record);
                }
            } else if (doi.includes('20.5000.1025')) {
                /* Format for CRA */
                const respone = await fetch(`https://hdl.handle.net/api/handles/${doi.replace(process.env.REACT_APP_DOI_URL as string, '')}`);
                /* Format for VITE
                const respone = await fetch(`https://hdl.handle.net/api/handles/${doi.replace(import.meta.env.VITE_DOI_URL as string, '')}`);
                */

                const responseRecord = await respone.json();

                if (responseRecord.values.length) {
                    const record = FormatResponse(responseRecord);

                    setRecord(record);
                }
            } else if (doi.includes('10.3535')) {
                /* Format for CRA */
                const response = await fetch(`https://doi.org/api/handles/${doi.replace(process.env.REACT_APP_DOI_URL as string, '')}`);
                /* Format for VITE
                const response = await fetch(`https://doi.org/api/handles/${doi.replace(import.meta.env.VITE_DOI_URL  as string, '')}`);
                */
                const responseRecord = await response.json();

                if (responseRecord.values.length) {
                    const record = FormatResponse(responseRecord);

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

    const locationString = record.data?.attributes.loc.replace('<locations>', '').replace('</locations>', '').split('<').find((location: string) => location.includes('id="0"')) ?? '';
    const locationIndexStart = locationString.indexOf('href');
    const locationIndexEnd = locationString.indexOf(' id');
    const locationUrl = locationString.slice(locationIndexStart, locationIndexEnd).replace('href="', '').replace('"', '') ?? '';

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
                                    <a className="tooltipLink" href={locationUrl} target="_blank">
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
                            <a href="https://doi.org/10.1093/biosci/biac060" rel="noreferer" target="_blank">
                                <span className="digitalExtendedSpecienNote">DES</span>
                            </a>

                            <a href="https://www.doi.org/the-identifier/what-is-a-doi/" rel="noreferer" target="_blank">
                                <img src={DOILogo} alt="DOI Logo" className="DOILogo" />
                            </a>
                        </div>
                    </>
                    : <p className="warningMessage"> Invalid DOI was provided, please try again </p>
                }
            </div>
        </>
    );
}

export default DOITooltip;