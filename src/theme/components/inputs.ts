import { Theme } from "@mui/material/styles";

const inputs = (): Theme["components"] => {
    return {
        MuiInputBase: {
            variants: [
                {
                    props: { size: "medium" },
                    style: {
                        fontSize: "14px",
                    },
                },
                {
                    props: { size: "small" },
                    style: {
                        height: "30px",
                        fontSize: "13px",
                    },
                },
            ],
        },
        MuiInputLabel: {
            variants: [
                {
                    props: { size: "small" },
                    style: {
                        fontSize: "13px",
                    },
                },
            ],
        },
    };
};

export default inputs;
