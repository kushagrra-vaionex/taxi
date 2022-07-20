import { StyleSheet } from 'react-native'

export const altBottomContainerHeight = 75
export const bottomContainerHeight = 135

const dynamicStyles = (theme, appearance) => {
  return StyleSheet.create({
    container: {
      paddingVertical: 12,
      borderRadius: 12,
    },
    primaryContainer: {
      backgroundColor: theme.colors[appearance].green,
      alignItems: 'center',
    },
    text: {
      color: theme.colors[appearance].primaryForeground,
      fontWeight: '600',
      fontSize: 16,
    },
    textPrimary: {
      color: theme.colors[appearance].primaryForeground,
    },
    disabled: {
      opacity: 0.3,
    },
  })
}

export default dynamicStyles
