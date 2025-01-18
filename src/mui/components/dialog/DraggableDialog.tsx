/* eslint-disable react/jsx-props-no-spreading */
import Paper, { PaperProps } from "@mui/material/Paper";
import React from "react";
import Draggable from "react-draggable";

import Dialog, { DialogModalProps } from "./Dialog";

function draggablePaperComponent(id: string) {
    return function DraggablePaper(props: PaperProps) {
        return (
            <Draggable handle={`#${id}`} cancel='[class*="MuiDialogContent-root"]'>
                <Paper {...props} />
            </Draggable>
        );
    };
}

export interface DraggableDialogProps extends DialogModalProps {
    draggableId: string;
}

export default function DraggableDialog(props: DraggableDialogProps) {
    const { id, draggableId, open, title, onClose, children } = props;

    return (
        <Dialog
            id={id}
            title={title}
            open={open}
            onClose={onClose}
            disableScrollLock
            PaperComponent={draggablePaperComponent(draggableId)}
            draggableId={draggableId}
            renderFooterCustom={() => null}
            maxWidth="sm">
            {children}
        </Dialog>
    );
}
