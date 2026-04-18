# TDL - The Demonlist

**The Best, Cleanest, and Most Advanced Geometry Dash Demonlist**

---

## About TDL

TDL (The Demonlist) is a cutting-edge, meticulously crafted Geometry Dash demonlist that sets the standard for excellence in the GD community. This project represents years of dedication, programming expertise, and rigorous testing to deliver the ultimate demonlist experience.

### What is TDL?

TDL is a comprehensive demonlist platform that ranks the hardest Geometry Dash levels, tracks player records, and provides detailed statistics about the game's most accomplished players. Built from the ground up with modern web technologies, TDL offers an unparalleled user experience with lightning-fast performance, stunning visuals, and intuitive navigation.

### Why TDL is the Best

- **Cleanest Codebase**: Every line of code is written with precision, following best practices and industry standards
- **Optimal Performance**: Blazing-fast load times and smooth interactions
- **Modern Architecture**: Built with the latest web technologies and frameworks
- **Rigorous Testing**: Every feature is thoroughly tested to ensure reliability
- **Beautiful Design**: Stunning visuals with attention to every detail
- **User-Friendly**: Intuitive interface that anyone can navigate with ease
- **Comprehensive Features**: Everything you need in a demonlist, and more

---

## Creator

**TDL is entirely made, programmed, designed, and tested by Classix**

Classix, a passionate developer and Geometry Dash enthusiast, has poured countless hours into creating this masterpiece. From the initial concept to the final implementation, every aspect of TDL has been carefully crafted with attention to detail and a commitment to excellence.

### The Vision

The vision behind TDL was simple: create the ultimate demonlist experience that combines functionality, beauty, and performance. Classix envisioned a platform that not only serves its purpose but does so with style and elegance, setting a new standard for what a demonlist can be.

---

## How TDL Works

### Technical Architecture

TDL is built using a modern JavaScript stack with Vue.js for the frontend, providing a reactive and dynamic user experience. The application is structured to be modular, maintainable, and scalable.

#### Frontend Technology Stack

- **Vue.js**: A progressive JavaScript framework for building user interfaces
- **Custom Components**: Reusable Vue components for consistent UI elements
- **CSS Grid & Flexbox**: Modern layout techniques for responsive design
- **Custom CSS Framework**: Tailored styling for a unique visual identity
- **Responsive Design**: Seamless experience across all devices

#### Data Management

- **JSON Data Structure**: Efficient storage of demon information, records, and player data
- **Dynamic Loading**: Content is loaded on-demand for optimal performance
- **Caching**: Smart caching strategies to minimize load times
- **Error Handling**: Robust error handling to ensure stability

### Core Features

#### 1. Main Demonlist

The main demonlist ranks the hardest Geometry Dash levels based on community consensus and verification status. Each level includes:

- **Detailed Information**: Name, creator, verifier, publisher, video links, and more
- **Record Tracking**: Complete list of verified records with player information
- **World Record Indicators**: Clear identification of current world record holders
- **Status Containers**: Visual indicators for level status (BUFFED, NERFED, SUPERBUFFED, ULTRANERFED)
- **Navigation**: Easy navigation between levels with intuitive controls

#### 2. Extended List

The extended list features additional demons that are being considered for the main list, providing a glimpse into the future of the demonlist.

#### 3. Future Demons

A dedicated section for upcoming demons that are currently in progress or being verified. This section includes:

- **Progress Tracking**: Real-time updates on verification progress
- **Status Indicators**: Clear visual indicators for demon status
- **Detailed Records**: Comprehensive record information with video links
- **Author Information**: Creator, verifier, and publisher details with gradient containers

#### 4. Leaderboard

A comprehensive leaderboard that ranks players based on their accomplishments:

- **Player Rankings**: Detailed ranking system based on completed demons
- **Statistics**: In-depth statistics including completion rates, hardest beaten levels, and more
- **Progress Tracking**: Future demons progress with status indicators
- **Country Filtering**: Filter rankings by country for regional competition
- **Search Functionality**: Quick search for any player

#### 5. Record Submission

A streamlined submission system for players to submit their records:

- **User-Friendly Form**: Intuitive interface for submitting records
- **Validation**: Automatic validation to ensure data accuracy
- **Mobile Support**: Support for mobile records
- **Review Process**: Efficient review process by list editors

---

## Project Structure

```
TDL-main/
├── css/                    # Stylesheets
│   ├── main.css           # Main styles
│   └── pages/             # Page-specific styles
│       ├── list.css       # Demonlist page styles
│       ├── future-demons.css
│       ├── leaderboard.css
│       └── ...
├── js/                     # JavaScript files
│   ├── content.js         # Data fetching and content management
│   ├── main.js            # Main application entry point
│   ├── pages/             # Page components
│   │   ├── List.js        # Main demonlist component
│   │   ├── FutureDemons.js
│   │   ├── Leaderboard.js
│   │   └── ...
│   └── components/        # Reusable components
├── data/                   # Data files
│   ├── main_list.json     # Main demonlist data
│   ├── extended_list.json # Extended list data
│   ├── future_*.json      # Future demon data files
│   └── LIST_README.md     # Data documentation
├── assets/                 # Static assets
│   ├── images/           # Images and icons
│   └── backgrounds/      # Background images
└── index.html            # Main HTML file
```

### Key Components

#### Data Layer

The data layer is organized into JSON files for easy maintenance and updates:

- **Main List**: Contains the official demonlist with all level information
- **Extended List**: Levels being considered for the main list
- **Future Demons**: Upcoming demons with detailed progress information
- **Player Data**: Comprehensive player statistics and records

#### Component Architecture

The application is built using a component-based architecture:

- **Page Components**: Each major page is a separate Vue component
- **Reusable Components**: Common UI elements are extracted into reusable components
- **State Management**: Efficient state management for optimal performance
- **Event Handling**: Robust event handling for user interactions

---

## Design Philosophy

### Clean Code Principles

TDL follows strict clean code principles:

- **Modularity**: Code is organized into logical, reusable modules
- **Readability**: Clear naming conventions and comprehensive comments
- **Maintainability**: Easy to update and modify
- **Scalability**: Designed to handle growth and new features
- **Efficiency**: Optimized for performance without sacrificing readability

### Visual Design

The visual design of TDL is crafted with precision:

- **Color Palette**: Carefully chosen colors for optimal contrast and aesthetics
- **Typography**: Modern, readable fonts with excellent hierarchy
- **Spacing**: Consistent spacing for a clean, organized look
- **Animations**: Subtle animations that enhance the user experience
- **Responsiveness**: Seamless adaptation to different screen sizes

---

## Future of TDL

### Planned Features

The future of TDL is bright with exciting planned features:

- **Enhanced Statistics**: More detailed player statistics and analytics
- **Social Features**: Integration with social media platforms
- **Mobile App**: Native mobile applications for iOS and Android
- **API Access**: Public API for third-party integrations
- **Live Updates**: Real-time updates for records and rankings
- **Advanced Filtering**: More powerful filtering and search options
- **Custom Profiles**: Enhanced player profile customization
- **Achievement System**: Achievement badges and rewards
- **Community Features**: Forums, discussions, and community engagement

### Long-term Vision

The long-term vision for TDL is to become the definitive source for Geometry Dash demonlist information, setting the standard for quality and excellence in the community. With continuous improvements and innovations, TDL will remain at the forefront of demonlist technology.

---

## Why Choose TDL?

### Superior Quality

TDL stands out from other demonlists due to:

- **Attention to Detail**: Every aspect is carefully considered and polished
- **Performance**: Optimized for speed and efficiency
- **Reliability**: Thoroughly tested and bug-free
- **Innovation**: Cutting-edge features and modern design
- **Support**: Active development and continuous improvements

### Community Impact

TDL aims to positively impact the Geometry Dash community by:

- **Providing Accurate Information**: Reliable and up-to-date demonlist data
- **Encouraging Competition**: Motivating players to improve and achieve more
- **Building Community**: Creating a space for players to connect and compete
- **Setting Standards**: Raising the bar for what a demonlist can be

---

## Technical Excellence

### Performance Optimization

TDL is optimized for peak performance:

- **Lazy Loading**: Content is loaded only when needed
- **Code Splitting**: JavaScript is split into manageable chunks
- **Image Optimization**: Images are optimized for fast loading
- **Caching**: Smart caching strategies minimize server requests
- **Minification**: CSS and JavaScript are minified for smaller file sizes

### Security

Security is a top priority:

- **Input Validation**: All user inputs are validated
- **XSS Protection**: Protection against cross-site scripting
- **CSRF Protection**: Protection against cross-site request forgery
- **Secure Data Storage**: Sensitive data is properly protected

### Accessibility

TDL is designed to be accessible to everyone:

- **Keyboard Navigation**: Full keyboard support for navigation
- **Screen Reader Support**: Compatible with screen readers
- **High Contrast Mode**: Option for high contrast display
- **Responsive Text**: Text scales appropriately on different devices

---

## How to Use TDL

### Getting Started

To get started with TDL, simply open the `index.html` file in a web browser. The application is fully client-side and requires no server setup.

#### Local Development

For development purposes:

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies required

#### Deployment

For deployment:

1. Upload all files to a web server
2. Ensure the directory structure is maintained
3. The application will work immediately

### Navigation

TDL features intuitive navigation:

- **Main List**: Access the official demonlist rankings
- **Extended List**: View levels being considered for the main list
- **Future Demons**: Check upcoming demons and verification progress
- **Leaderboard**: Browse player rankings and statistics
- **Submit Records**: Submit your own records for review

### Finding Specific Items and Code

#### Data Files

All demon data is stored in the `data/` directory:

- **`main_list.json`**: Contains the main demonlist data
  - Location: `data/main_list.json`
  - Structure: Array of demon objects with name, rank, creator, verifier, publisher, records, etc.
  - Usage: This is the primary data file for the main demonlist

- **`extended_list.json`**: Contains the extended list data
  - Location: `data/extended_list.json`
  - Structure: Similar to main_list.json but for extended list demons
  - Usage: Levels being considered for the main list

- **`future_*.json`**: Individual files for each future demon
  - Location: `data/future_[demon_name].json` (e.g., `data/future_vehemence.json`)
  - Structure: Detailed information about a specific future demon including records
  - Usage: Future demons that are currently in progress or being verified

#### JavaScript Files

The JavaScript code is organized in the `js/` directory:

- **`js/main.js`**: Main application entry point
  - Location: `js/main.js`
  - Purpose: Initializes the Vue application and sets up routing
  - Key functions: App initialization, route configuration

- **`js/content.js`**: Data fetching and content management
  - Location: `js/content.js`
  - Purpose: Fetches and manages all data from JSON files
  - Key functions: `fetchMainList()`, `fetchExtendedList()`, `fetchFutureDemons()`, `fetchLeaderboard()`

- **`js/pages/List.js`**: Main demonlist page component
  - Location: `js/pages/List.js`
  - Purpose: Renders the main demonlist with all levels and records
  - Key features: Level display, record tracking, navigation arrows

- **`js/pages/FutureDemons.js`**: Future demons page component
  - Location: `js/pages/FutureDemons.js`
  - Purpose: Displays all future demons with progress tracking
  - Key features: Demon list, status containers, verification badges

- **`js/pages/FutureDemonDetail.js`**: Individual future demon detail component
  - Location: `js/pages/FutureDemonDetail.js`
  - Purpose: Shows detailed information about a specific future demon
  - Key features: Records display, author information, status indicators

- **`js/pages/Leaderboard.js`**: Player leaderboard component
  - Location: `js/pages/Leaderboard.js`
  - Purpose: Displays player rankings and statistics
  - Key features: Player search, country filtering, future demons progress

- **`js/pages/LevelDetail.js`**: Individual level detail component
  - Location: `js/pages/LevelDetail.js`
  - Purpose: Shows detailed information about a specific level from the main list
  - Key features: Record display, navigation arrows, author information

#### CSS Files

Styles are organized in the `css/` directory:

- **`css/main.css`**: Main stylesheet
  - Location: `css/main.css`
  - Purpose: Global styles and utility classes
  - Key sections: Variables, reset, typography, layout

- **`css/pages/list.css`**: Demonlist page styles
  - Location: `css/pages/list.css`
  - Purpose: Styles specific to the main demonlist page
  - Key sections: List layout, sidebar, navigation arrows

- **`css/pages/future-demons.css`**: Future demons page styles
  - Location: `css/pages/future-demons.css`
  - Purpose: Styles for future demons and detail pages
  - Key sections: Demon cards, status containers, gradient styles

- **`css/pages/leaderboard.css`**: Leaderboard page styles
  - Location: `css/pages/leaderboard.css`
  - Purpose: Styles for the leaderboard and stats viewer
  - Key sections: Player cards, statistics, future progress

### Adding and Modifying Content

#### Adding a New Demon to the Main List

1. Open `data/main_list.json`
2. Add a new object to the array with the following structure:
```json
{
  "name": "Demon Name",
  "rank": 1,
  "creator": "Creator Name",
  "verifier": "Verifier Name",
  "publisher": "Publisher Name",
  "video": "https://youtube.com/watch?v=...",
  "records": [
    {
      "user": "Player Name",
      "percent": 100,
      "video": "https://youtube.com/watch?v=...",
      "date": "YYYY-MM-DD"
    }
  ]
}
```
3. Ensure proper JSON syntax (commas, quotes, brackets)
4. Save the file and refresh the page

#### Adding a New Future Demon

1. Create a new file in `data/` named `future_[demon_name].json`
2. Add the following structure:
```json
{
  "id": "demon_name",
  "name": "Demon Name",
  "status": "BUFFED",
  "verificationStatus": "open",
  "creators": ["Creator1", "Creator2"],
  "verifier": "Verifier Name",
  "publisher": "Publisher Name",
  "video": "https://youtube.com/watch?v=...",
  "records": [
    {
      "user": "Player Name",
      "percent": 40,
      "video": "https://youtube.com/watch?v=...",
      "date": "YYYY-MM-DD",
      "status": "SUPERBUFFED"
    }
  ]
}
```
3. Save the file
4. The demon will automatically appear in the future demons section

#### Modifying Styles

To modify the appearance of TDL:

1. **Global Styles**: Edit `css/main.css` for changes affecting all pages
2. **Page-Specific Styles**: Edit the corresponding CSS file in `css/pages/`
3. **Status Container Colors**: Edit the gradient definitions in `css/pages/future-demons.css` or `css/pages/leaderboard.css`

#### Modifying Components

To modify component behavior:

1. Locate the component file in `js/pages/` or `js/components/`
2. Edit the template, script, or styles as needed
3. Vue components use a simple structure with template, data, methods, and computed properties

### Troubleshooting

#### Common Issues

**Website not loading:**
- Check browser console for errors (F12 → Console tab)
- Verify JSON syntax in data files (missing commas, quotes, or brackets)
- Ensure all file paths are correct

**Levels not appearing:**
- Verify the data file exists in the correct location
- Check JSON syntax for errors
- Ensure the file is properly formatted

**Styles not applying:**
- Clear browser cache
- Verify CSS file is linked in index.html
- Check for CSS syntax errors

**Records not showing:**
- Verify record data in the corresponding JSON file
- Check that user names match exactly
- Ensure percent values are numbers, not strings

---

## Conclusion

TDL represents the pinnacle of demonlist development, combining technical excellence with beautiful design and unparalleled functionality. Created, programmed, and tested by Classix, TDL sets a new standard for what a demonlist can be.

With its clean codebase, optimal performance, stunning visuals, and comprehensive features, TDL is undeniably the best demonlist available. The future is bright for TDL, with exciting features and improvements on the horizon.

---

**Made with ❤️ by Classix**

*The Best Demonlist, The Cleanest Code, The Ultimate Experience*
