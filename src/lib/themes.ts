export interface Theme {
  name: string
  emoji: string
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
  }
}

export const THEMES: Record<string, Theme> = {
  stellar: {
    name: 'Stellar Blue',
    emoji: '⭐',
    colors: {
      background: 'oklch(0.96 0.01 240)',
      foreground: 'oklch(0.25 0.02 240)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.25 0.02 240)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.25 0.02 240)',
      primary: 'oklch(0.25 0.02 240)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.45 0.08 240)',
      secondaryForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.94 0.01 240)',
      mutedForeground: 'oklch(0.50 0.02 240)',
      accent: 'oklch(0.70 0.15 45)',
      accentForeground: 'oklch(0.25 0.02 240)',
      destructive: 'oklch(0.55 0.22 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.88 0.01 240)',
      input: 'oklch(0.88 0.01 240)',
      ring: 'oklch(0.25 0.02 240)',
    },
  },
  ocean: {
    name: 'Ocean Deep',
    emoji: '🌊',
    colors: {
      background: 'oklch(0.97 0.01 220)',
      foreground: 'oklch(0.20 0.03 220)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.20 0.03 220)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.20 0.03 220)',
      primary: 'oklch(0.50 0.15 220)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.60 0.12 200)',
      secondaryForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.93 0.02 220)',
      mutedForeground: 'oklch(0.52 0.03 220)',
      accent: 'oklch(0.65 0.18 180)',
      accentForeground: 'oklch(0.98 0 0)',
      destructive: 'oklch(0.55 0.22 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.87 0.02 220)',
      input: 'oklch(0.87 0.02 220)',
      ring: 'oklch(0.50 0.15 220)',
    },
  },
  sunset: {
    name: 'Sunset Glow',
    emoji: '🌅',
    colors: {
      background: 'oklch(0.97 0.01 30)',
      foreground: 'oklch(0.22 0.03 30)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.22 0.03 30)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.22 0.03 30)',
      primary: 'oklch(0.55 0.20 30)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.65 0.15 50)',
      secondaryForeground: 'oklch(0.98 0 0)',
      muted: 'oklch(0.94 0.01 30)',
      mutedForeground: 'oklch(0.50 0.03 30)',
      accent: 'oklch(0.70 0.18 60)',
      accentForeground: 'oklch(0.20 0.03 30)',
      destructive: 'oklch(0.55 0.22 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.88 0.01 30)',
      input: 'oklch(0.88 0.01 30)',
      ring: 'oklch(0.55 0.20 30)',
    },
  },
  forest: {
    name: 'Forest Green',
    emoji: '🌲',
    colors: {
      background: 'oklch(0.97 0.01 150)',
      foreground: 'oklch(0.20 0.03 150)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.20 0.03 150)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.20 0.03 150)',
      primary: 'oklch(0.45 0.12 150)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.55 0.10 140)',
      secondaryForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.94 0.01 150)',
      mutedForeground: 'oklch(0.48 0.03 150)',
      accent: 'oklch(0.68 0.15 120)',
      accentForeground: 'oklch(0.98 0 0)',
      destructive: 'oklch(0.55 0.22 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.88 0.01 150)',
      input: 'oklch(0.88 0.01 150)',
      ring: 'oklch(0.45 0.12 150)',
    },
  },
  lavender: {
    name: 'Lavender Dream',
    emoji: '💜',
    colors: {
      background: 'oklch(0.97 0.01 290)',
      foreground: 'oklch(0.22 0.03 290)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.22 0.03 290)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.22 0.03 290)',
      primary: 'oklch(0.50 0.18 290)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.60 0.15 280)',
      secondaryForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.94 0.01 290)',
      mutedForeground: 'oklch(0.50 0.03 290)',
      accent: 'oklch(0.68 0.20 310)',
      accentForeground: 'oklch(0.98 0 0)',
      destructive: 'oklch(0.55 0.22 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.88 0.01 290)',
      input: 'oklch(0.88 0.01 290)',
      ring: 'oklch(0.50 0.18 290)',
    },
  },
  coral: {
    name: 'Coral Reef',
    emoji: '🪸',
    colors: {
      background: 'oklch(0.97 0.01 15)',
      foreground: 'oklch(0.22 0.03 15)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.22 0.03 15)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.22 0.03 15)',
      primary: 'oklch(0.55 0.18 15)',
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.65 0.14 200)',
      secondaryForeground: 'oklch(1 0 0)',
      muted: 'oklch(0.94 0.01 15)',
      mutedForeground: 'oklch(0.50 0.03 15)',
      accent: 'oklch(0.70 0.16 35)',
      accentForeground: 'oklch(0.98 0 0)',
      destructive: 'oklch(0.55 0.22 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.88 0.01 15)',
      input: 'oklch(0.88 0.01 15)',
      ring: 'oklch(0.55 0.18 15)',
    },
  },
}
