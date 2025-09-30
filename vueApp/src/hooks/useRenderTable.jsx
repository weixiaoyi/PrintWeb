import { onMounted, reactive } from "vue";
import styles from "./styles/useRenderTable.module.scss";

export default function useRenderTable(params) {
  const state = reactive({});

  const renderTable = ({ dataSource = [], columns = [], id, style }) => {
    return (
      <div className={styles.tableContainer} style={style} id={id}>
        <table className={styles.table}>
          <thead>
            {columns.map((column, columnIndex) => {
              return <th key={columnIndex}>{column.title}</th>;
            })}
          </thead>
          <tbody>
            {dataSource?.map((row = {}, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  {columns.map((column = {}, columnIndex) => {
                    const spans = column?.customCell
                      ? column?.customCell(row, rowIndex, column)
                      : {};
                    const text = row?.[column?.dataIndex];
                    const renderText = column.customRender
                      ? column.customRender({
                          text,
                          record: row,
                          index: columnIndex,
                          indexRow: rowIndex,
                          column,
                        })
                      : text;
                    if (spans?.colSpan === 0) {
                      return null;
                    }
                    return (
                      <td key={columnIndex} {...spans}>
                        {renderText}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return {
    renderTable,
  };
}
