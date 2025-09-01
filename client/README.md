# ResumeAI Landing Page

A professional, animated landing page inspired by Zety's CV Maker, built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- 🎨 **Professional Design**: Clean, modern UI with professional color palette
- ✨ **Smooth Animations**: Framer Motion powered animations and transitions
- 📱 **Responsive**: Fully responsive design for all devices
- 🎯 **ATS Optimized**: Templates designed to pass Applicant Tracking Systems
- 🚀 **Performance**: Optimized for fast loading and smooth interactions
- ♿ **Accessible**: Built with accessibility best practices

## Tech Stack

- **React 19** - Latest React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Shadcn/ui** - Professional UI components
- **Vite** - Fast build tool
//testing
## Installation

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Install Additional Dependencies**
   ```bash
   npm install framer-motion react-intersection-observer @radix-ui/react-icons
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Navigation header
│   │   │   └── Footer.tsx          # Footer component
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx     # Hero section with animated CV preview
│   │   │   ├── FeaturesSection.tsx # Features showcase
│   │   │   ├── TemplatesSection.tsx # CV templates gallery
│   │   │   └── TestimonialsSection.tsx # User testimonials
│   │   └── ui/
│   │       └── button.tsx          # Shadcn/ui button component
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # App entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
├── tailwind.config.js              # Tailwind configuration
└── package.json                    # Dependencies
```

## Key Features

### 🎨 Design System
- Professional color palette (blues, whites, grays)
- Inter font family for modern typography
- Consistent spacing and sizing
- Smooth transitions and hover effects

### ✨ Animations
- Scroll-triggered animations using `react-intersection-observer`
- Framer Motion for complex animations
- Animated hero section with rolling CV preview
- Staggered animations for lists and grids

### 📱 Responsive Design
- Mobile-first approach
- Responsive typography
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

### 🎯 Components
- **Header**: Fixed navigation with mobile menu
- **Hero Section**: Animated CV preview with floating elements
- **Features**: Interactive cards with hover effects
- **Templates**: Gallery with preview functionality
- **Testimonials**: User reviews with ratings
- **Footer**: Comprehensive links and social media

## Customization

### Colors
Update the color scheme in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#eff6ff',
    // ... customize your colors
  }
}
```

### Animations
Modify animation variants in individual components or add new ones to `tailwind.config.js`.

### Content
Update the content in each section component to match your brand and messaging.

## Performance Optimizations

- Lazy loading with `react-intersection-observer`
- Optimized animations with Framer Motion
- Efficient CSS with Tailwind's purge
- Minimal bundle size with tree shaking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Credits

Inspired by [Zety's CV Maker](https://zety.com/lp/cv-maker) landing page design and functionality.
