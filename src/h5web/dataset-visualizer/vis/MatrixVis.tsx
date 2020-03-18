import React, {
  createContext,
  useContext,
  useState,
  forwardRef,
  Ref,
} from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import numeral from 'numeral';
import { FiAnchor } from 'react-icons/fi';
import { range } from 'lodash-es';
import { HDF5Value } from '../../providers/models';
import styles from './MatrixVis.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AccessorFunc = (row: number, col: number) => any;

interface Props {
  dims: number[];
  data: HDF5Value;
}

type CellProps = Omit<GridChildComponentProps, 'data'>;

interface MatrixProps {
  children: (props: GridChildComponentProps) => JSX.Element;
  width: number;
  height: number;
}

interface IndexCellProps {
  index: number;
  style: React.CSSProperties;
}

function MatrixVis(props: Props): JSX.Element {
  const { dims, data } = props;
  const [sticky, setSticky] = useState(true);
  const gridDimensions = {
    rowHeight: 32,
    rowCount: dims[0] + 1,
    columnWidth: 116,
    columnCount: (dims.length === 2 ? dims[1] : 1) + 1,
  };
  const GridSettings = createContext(gridDimensions);

  function CellRenderer(
    cellRendererProps: GridChildComponentProps
  ): JSX.Element {
    const { data: itemData, rowIndex, columnIndex, style } = cellRendererProps;
    const { NormalCellFunc } = itemData;
    // Disable rendering of index columns (done by the innerElementType)
    if (rowIndex * columnIndex === 0) {
      return <></>;
    }
    return (
      <NormalCellFunc
        rowIndex={rowIndex - 1}
        columnIndex={columnIndex - 1}
        style={style}
      />
    );
  }

  const accessor: AccessorFunc =
    dims.length === 1 ? row => data[row] : (row, col) => data[row][col];

  function ValueCell(cellProps: CellProps): JSX.Element {
    const { rowIndex: row, columnIndex: col, style } = cellProps;
    return (
      <div
        className={styles.cell}
        style={style}
        data-bg={(col + row) % 2 === 1 ? '' : undefined}
      >
        {numeral(accessor(row, col)).format('0.000e+0')}
      </div>
    );
  }

  function IndexCell(indexCellProps: IndexCellProps): JSX.Element {
    const { index, style } = indexCellProps;
    return (
      <div
        className={styles.indexCell}
        style={style}
        data-bg={index % 2 === 1 ? '' : undefined}
      >
        {index >= 0 ? (
          index
        ) : (
          <button
            name="Toggle sticky indices"
            className={styles.btn}
            type="button"
            data-bg={sticky || undefined}
            onClick={() => {
              setSticky(!sticky);
            }}
          >
            <FiAnchor />
          </button>
        )}
      </div>
    );
  }

  function IndexColumn(): JSX.Element {
    const { columnWidth, rowHeight, rowCount } = useContext(GridSettings);
    return (
      <div
        className={styles.indexColumn}
        style={{ width: columnWidth }}
        data-sticky={sticky || undefined}
      >
        {range(rowCount - 1).map(row => {
          return (
            <IndexCell
              index={row}
              key={row}
              style={{
                width: columnWidth,
                height: rowHeight,
              }}
            />
          );
        })}
      </div>
    );
  }

  function IndexRow(): JSX.Element {
    const { columnWidth, rowHeight, columnCount } = useContext(GridSettings);
    return (
      <div
        className={styles.indexRow}
        style={{ height: rowHeight }}
        data-sticky={sticky || undefined}
      >
        {range(columnCount).map(col => {
          return (
            <IndexCell
              // Starts a -1 as the first column is the index column
              index={col - 1}
              key={col}
              style={{
                width: columnWidth,
                height: rowHeight,
              }}
            />
          );
        })}
      </div>
    );
  }

  // IndexedGrid based on https://codesandbox.io/s/0mk3qwpl4l
  function IndexedGrid(matrixProps: MatrixProps): JSX.Element {
    const { children, width, height } = matrixProps;
    const { columnWidth, rowHeight, columnCount, rowCount } = useContext(
      GridSettings
    );

    const InnerGrid = forwardRef(
      ({ children: innerChildren, ...rest }, ref) => {
        return (
          <div ref={ref as Ref<HTMLDivElement>} {...rest}>
            <IndexRow />
            <IndexColumn />
            {innerChildren}
          </div>
        );
      }
    );

    return (
      <Grid
        itemData={{ NormalCellFunc: children }}
        innerElementType={InnerGrid}
        className={styles.grid}
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        columnCount={columnCount}
        rowCount={rowCount}
        width={width}
        height={height}
      >
        {CellRenderer}
      </Grid>
    );
  }

  return (
    <AutoSizer>
      {({ width, height }) => (
        <GridSettings.Provider value={gridDimensions}>
          <IndexedGrid width={width} height={height}>
            {ValueCell}
          </IndexedGrid>
        </GridSettings.Provider>
      )}
    </AutoSizer>
  );
}

export default MatrixVis;
