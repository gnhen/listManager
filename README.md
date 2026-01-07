# List Manager

A clean, intuitive web-based list management application with drag-and-drop functionality, dark mode support, and persistent local storage.

## Live Demo

Access the app directly through the GitHub Pages URL for this repository.

## Features

### Core Functionality
- **Multiple Lists**: Create and manage unlimited categorized lists
- **List Items**: Add, complete, and delete individual items within each list
- **URL Links**: Attach URLs to any list item for quick reference
- **Expandable Lists**: Click list headers to expand/collapse content
- **Delete Operations**: Remove individual items or entire lists

### Drag & Drop
- **Reorder Items**: Drag items within the same list or move between different lists
- **Reorder Lists**: Drag and drop entire lists to reorganize them
- **Smart Highlighting**: Visual indicators show valid drop zones while dragging
- **Auto-Collapse**: Lists automatically collapse while being dragged for better visibility

### User Interface
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Smart Link Button**: Expandable button that reveals edit controls on hover
- **Visual Status**: Color-coded completion status (red for incomplete, green for complete)
- **Responsive Design**: Clean, modern interface optimized for desktop use

### Data Persistence
- All data is automatically saved to browser's local storage
- Changes persist across browser sessions
- No server or account required

## Usage

### Managing Lists
- Click **"Add List"** in the header to create a new list
- Click the **✖** button on any list header to delete the entire list
- Click the **▶** arrow or list title to expand/collapse items
- Drag collapsed lists to reorder them (lists auto-collapse when dragged)

### Managing Items
- Click **"Add Entry"** button to add a new item to a list
- Click the **circle** next to an item to toggle completion status
- Click the **Link** button to add or open a URL associated with the item
- Hover over the **Link** button to reveal the edit icon for changing the URL
- Click the **trash icon** to delete an item
- Drag items to reorder them within a list or move them to other lists

### Theme Toggle
- Click the **theme button** (bottom-right corner) to switch between light and dark modes
- Theme preference is saved automatically

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, flexbox, transitions
- **Vanilla JavaScript**: DOM manipulation, drag-and-drop API, local storage
- **No Dependencies**: Pure web technologies, no frameworks required

## Data Structure

Lists are stored in localStorage with the following structure:

```javascript
{
  id: number,
  title: string,
  expanded: boolean,
  items: [
    {
      id: number,
      text: string,
      completed: boolean,
      link: string
    }
  ]
}
```

## Browser Compatibility

Works best in modern browsers with support for:
- CSS custom properties
- ES6+ JavaScript
- HTML5 Drag and Drop API
- LocalStorage API

## License

Open source - feel free to use and modify as needed.
