import { I18nManager, StyleSheet } from 'react-native'

const dynamicStyles = (theme, appearance) => {
  const colorSet = theme.colors[appearance]

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 50,
      width: '95%',
    },
    icon: {
      width: 24,
      height: 24,
    },
    itemContainer: {
      flex: 1,
      flexDirection: 'row',
      height: '100%',
      marginLeft: 10,
    },
    title: {
      marginLeft: 15,
      //profile setinf and phone
      color: colorSet.primaryBackground,
      fontSize: 14,
      marginTop: 3,
    },
    itemNavigationIcon: {
      height: 20,
      width: 20,
      marginRight: 10,
      tintColor: colorSet.secondaryText,
      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
  })
}

export default dynamicStyles
