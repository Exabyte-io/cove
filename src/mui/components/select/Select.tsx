import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React from "react";

import IconByName from "../icon/IconByName";

export interface SelectProps {
    id: string;
    label?: string;
    multiple?: boolean;
    items: { id: string; name: string; value: string | number }[];
    value: "" | string[] | undefined;
    sx?: object;
    fontSize?: number;
    onChange: (event: SelectChangeEvent<string[]>) => void;
    isChips?: boolean;
    onDelete?: (event: string) => void;
    getChipLabel?: (value: string) => string;
}
export default function SelectComponent({
    id,
    items,
    label,
    value,
    onChange,
    onDelete,
    isChips = false,
    multiple = false,
    sx = {},
    fontSize = 16,
    getChipLabel = (value) => value,
}: SelectProps) {
    const renderValue = isChips
        ? (selected: string[]) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((chipValue) => (
                      <Chip
                          key={chipValue}
                          label={getChipLabel(chipValue)}
                          sx={{ fontSize: fontSize - 2 }}
                          clickable
                          onDelete={() => {
                              if (onDelete) onDelete(chipValue);
                          }}
                          deleteIcon={
                              <IconByName
                                  name="actions.cancel"
                                  onMouseDown={(event) => event.stopPropagation()}
                              />
                          }
                      />
                  ))}
              </Box>
          )
        : undefined;

    return (
        <FormControl sx={{ marginY: 1, width: "100%" }}>
            {label ? (
                <InputLabel id={`${id}-label`} sx={{ fontSize }}>
                    {label}
                </InputLabel>
            ) : null}
            <Select
                id={id}
                labelId={`${id}-label`}
                label={label}
                value={value}
                multiple={multiple}
                sx={{
                    width: "100%",
                    minHeight: 56,
                    fontSize,
                    ...sx,
                }}
                renderValue={renderValue}
                onChange={onChange}>
                {items.map((item) => (
                    <MenuItem id={item.id} key={item.value} value={item.value} sx={{ fontSize }}>
                        {item.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
