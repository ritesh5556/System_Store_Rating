import React from 'react';
import { Grid, GridProps } from '@mui/material';

/**
 * GridItem is a wrapper around Material UI's Grid component
 * that automatically sets the component prop to 'div' and sets item to true.
 * This helps fix TypeScript errors related to MUI v7's changes to the Grid component.
 */
type GridItemProps = Omit<GridProps, 'item'> & {
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
};

const GridItem: React.FC<GridItemProps> = (props) => {
  return <Grid component="div" item {...props} />;
};

export default GridItem; 