/* eslint-disable react/jsx-props-no-spreading */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Templates } from "@rjsf/mui";
import { WidgetProps } from "@rjsf/utils";
import React from "react";

import InfoPopover, {
    InfoPopoverProps,
} from "../../mui/components/popover/info-popover/InfoPopover";

const { BaseInputTemplate } = Templates;

type InfoPopoverOptions = InfoPopoverProps & { content: string };

export default function InputWithInfoPopover(props: WidgetProps) {
    const { uiSchema } = props;
    const infoPopover = (uiSchema ? uiSchema["ui:options"]?.infoPopover : {}) as InfoPopoverOptions;

    if (!BaseInputTemplate) return null;

    return (
        <>
            <BaseInputTemplate {...props} size="small" />
            <Box
                sx={{
                    backgroundColor: "background.paper",
                    position: "absolute",
                    borderRadius: "50%",
                    right: -14,
                    top: -14,
                }}>
                <InfoPopover title={infoPopover?.title} iconSize="small">
                    <Typography
                        variant="body2"
                        pb={2}
                        dangerouslySetInnerHTML={{ __html: infoPopover?.content }}
                    />
                </InfoPopover>
            </Box>
        </>
    );
}
