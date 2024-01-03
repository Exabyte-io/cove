import { Theme } from "@mui/material/styles";

const buttons = (theme: Theme) => {
    const config = {
        styleOverrides: {
            root: {
                // b/c of https://github.com/material-components/material-components-web/issues/4894
                whiteSpace: "nowrap",
            },
        },
        variants: [
            {
                props: { size: "large" },
                style: {
                    fontSize: "15px",
                },
            },
            {
                props: { size: "medium" },
                style: {
                    fontSize: "14px",
                },
            },
            {
                props: { size: "small" },
                style: {
                    fontSize: "13px",
                },
            },
            {
                props: { variant: "selected" },
                style: {
                    backgroundColor: "rgba(16,86,190,0.1)",
                    color: theme.palette.primary.main,
                    boxShadow: theme.shadows[2],
                    padding: "8px 22px",
                    "&:hover": {
                        backgroundColor: "rgba(16,86,190,0.2)",
                    },
                    "&.Mui-disabled": {
                        color: theme.palette.primary.main,
                        boxShadow: "none",
                    },
                },
            },
        ],
    };

    return {
        MuiButton: config,
        MuiToggleButton: config,
    };
};

export default buttons;
