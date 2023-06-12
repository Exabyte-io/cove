/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import AccordionExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiAccordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { withStyles } from "@mui/styles";
import React, { SyntheticEvent, useEffect, useState } from "react";

// deletes header animation in accordion
const StyledAccordion = withStyles({
    root: {
        "&$expanded": {
            margin: "0",
        },
    },
    expanded: {},
})(MuiAccordion);

// deletes header animation in accordion
const AccordionSummary = withStyles({
    root: {
        "&$expanded": {
            minHeight: "48px",
            margin: "0",
        },
    },
    content: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        "&$expanded": {
            margin: "0",
        },
    },
    expanded: {},
})(MuiAccordionSummary);

export interface AccordionProps {
    hideExpandIcon: boolean;
    children: React.ReactNode;
    isExpanded: boolean;
    header: React.ReactNode;
    alternativeComponent: React.ReactNode;
}

export default function Accordion({
    hideExpandIcon,
    children,
    isExpanded,
    header,
    alternativeComponent,
    ...restProps
}: AccordionProps) {
    const [isExpanded_, setIsExpanded] = useState(isExpanded);

    useEffect(() => {
        setIsExpanded(isExpanded);
    }, [isExpanded]);

    const handleToggleExpanded = (e: SyntheticEvent<HTMLDivElement>) => {
        if (!e.defaultPrevented) {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
        }
    };

    return (
        <StyledAccordion defaultExpanded={isExpanded} expanded={isExpanded_} {...restProps}>
            <AccordionSummary
                onClick={handleToggleExpanded}
                aria-controls="panel2a-content"
                expandIcon={!hideExpandIcon && <AccordionExpandMoreIcon fontSize="large" />}>
                <Typography variant="overline">{header}</Typography>
                {alternativeComponent}
            </AccordionSummary>
            <Divider />
            <AccordionDetails>{children}</AccordionDetails>
        </StyledAccordion>
    );
}
