# Tailwind CSS Integration Guide

This project has been configured to use Tailwind CSS for styling, along with Material UI.

## Setup

The following packages have been added to the project:
- `tailwindcss`: The core Tailwind CSS framework
- `postcss`: Required for Tailwind CSS processing
- `autoprefixer`: Used with PostCSS for browser compatibility

## How It Works

1. Tailwind CSS directives have been added to `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. Configuration files have been created:
   - `tailwind.config.js`: Configures Tailwind with custom colors matching the Material UI theme
   - `postcss.config.js`: Sets up the PostCSS plugins

## Using Tailwind CSS

### With Material UI
You can use Tailwind CSS alongside Material UI components:

```tsx
// Using Material UI components with Tailwind classes
<Box className="p-4 bg-gray-100">
  <Typography className="text-primary font-bold">
    Styled with Tailwind
  </Typography>
</Box>
```

### Direct Tailwind Usage
You can also use Tailwind classes directly without Material UI:

```tsx
<div className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
  <h2 className="text-2xl font-bold text-primary">Component Title</h2>
  <p className="text-gray-600">Component description</p>
</div>
```

### Custom Theme
The Tailwind configuration extends the theme with custom colors that match Material UI:

```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        DEFAULT: '#dc004e',
        light: '#ff4081',
        dark: '#c51162',
      },
    }
  },
},
```

## Example Components

Check out these components for examples of Tailwind CSS usage:
- `src/components/common/Loading.tsx`: A simple loading spinner
- `src/pages/NotFound.tsx`: 404 page with Tailwind styling
- `src/components/common/TailwindExample.tsx`: Example component demonstrating Tailwind CSS

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material UI Documentation](https://mui.com/material-ui/)
- [Tailwind CSS with React](https://tailwindcss.com/docs/guides/create-react-app) 