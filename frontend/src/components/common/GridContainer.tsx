import React from 'react';
import { Grid, GridProps } from '@mui/material';

/**
 * GridContainer is a wrapper around Material UI's Grid component
 * that automatically sets the component prop to 'div' and sets container to true.
 * This helps fix TypeScript errors related to MUI v7's changes to the Grid component.
 */
type GridContainerProps = Omit<GridProps, 'container'> & {
  spacing?: number;
};

const GridContainer: React.FC<GridContainerProps> = (props) => {
  return <Grid component="div" container {...props} />;
};

export default GridContainer; 