export const calendarConfig = {
  // Double month view configuration for react-day-picker
  numberOfMonths: 2,
  showOutsideDays: true,
  // Add support for marked dates (available appointments)
  modifiers: {
    available: [] as Date[],
    unavailable: [] as Date[],
    today: new Date()
  },
  // Visual styling
  styles: {
    months: {
      display: 'flex',
      gap: '1rem'
    }
  },
  // Responsive behavior
  responsive: {
    medium: {
      numberOfMonths: 2
    },
    small: {
      numberOfMonths: 1
    }
  }
}

// Available date markers configuration
export const dateMarkers = {
  available: {
    style: {
      backgroundColor: '#4ECDC4',
      color: 'white',
      border: '2px solid #4ECDC4'
    }
  },
  unavailable: {
    style: {
      backgroundColor: '#f1f5f9',
      color: '#64748b'
    }
  },
  selected: {
    style: {
      backgroundColor: '#3b82f6',
      color: 'white'
    }
  }
}