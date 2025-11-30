import { createCommonColumn } from "./common";
import { renderTypeRow } from "../utils";
import { TYPE_ROW } from "../types";

export interface StatusRowColumnProps {
  data?: string;
  title?: string;
  width?: number;
}

/**
 * Creates a status row column that displays icons for row status (CREATE, EDITING, DELETE)
 * This column shows the current state of each row in the table
 */
export const createStatusRowColumn = ({
  data = "typeRow",
  title = "Status",
  width = 40,
}: StatusRowColumnProps = {}) => {
  return {
    ...createCommonColumn(data, title, width),
    renderer: renderTypeRow,
    readOnly: true,
    editor: false,
  };
};

/**
 * Helper to set row status
 */
export const setRowStatus = (
  instance: any,
  rowIndex: number,
  status: TYPE_ROW,
  typeRowField: string = "typeRow"
) => {
  instance.setDataAtRowProp(rowIndex, typeRowField, status);
};

/**
 * Helper to get row status
 */
export const getRowStatus = (
  instance: any,
  rowIndex: number,
  typeRowField: string = "typeRow"
): TYPE_ROW | null => {
  return instance.getDataAtRowProp(rowIndex, typeRowField) || null;
};
