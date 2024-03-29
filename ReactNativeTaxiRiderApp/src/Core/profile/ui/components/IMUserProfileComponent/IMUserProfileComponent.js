import React, { useState } from 'react'
import { Text, View, StatusBar } from 'react-native'
import { useSelector } from 'react-redux'
import { useTheme, useTranslations } from 'dopenative'
import dynamicStyles from './styles'
import IMProfileItemView from '../IMProfileItemView/IMProfileItemView'
import { TNProfilePictureSelector } from '../../../../truly-native'
import { updateProfilePhoto } from '../../../../users'
import { storageAPI } from '../../../../media'
import { useCurrentUser } from '../../../../onboarding'
import LinearGradient from 'react-native-linear-gradient';

const IMUserProfileComponent = props => {
  const { menuItems, onUpdateUser, onLogout } = props

  const currentUser = useCurrentUser()

  const { profilePictureURL, id } = currentUser

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const [profilePicture, setProfilePicture] = useState(profilePictureURL)

  const displayName = () => {
    const { firstName, lastName, fullname } = currentUser
    if (
      (firstName && firstName.length > 0) ||
      (lastName && lastName.length > 0)
    ) {
      return firstName + ' ' + lastName
    }
    return fullname || ''
  }

  const setProfilePictureFile = async photoFile => {
    console.log('++ photoFile', photoFile)
    if (photoFile == null) {
      // Remove profile photo action
      setProfilePicture(null)
      const finalRes = await updateProfilePhoto(id, null)
      if (finalRes.success == true) {
        onUpdateUser &&
          onUpdateUser({ ...currentUser, profilePictureURL: null })
      }
      return
    }
    // If we have a photo, we upload it to the backend, and then update the user
    const response = await storageAPI.processAndUploadMediaFile(photoFile)
    if (response.error) {
      // there was an error, fail silently
    } else {
      const finalRes = await updateProfilePhoto(
        id,
        response.downloadKey ?? response.downloadURL,
      )
      if (finalRes.success == true) {
        onUpdateUser &&
          onUpdateUser({
            ...currentUser,
            profilePictureURL: response.downloadURL,
          })
      }
    }
  }

  const renderMenuItem = (menuItem, index) => {
    const { title, icon, onPress, tintColor } = menuItem
    return (
      <IMProfileItemView
        title={title}
        icon={icon}
        iconStyle={{ tintColor: tintColor }}
        onPress={onPress}
        key={index}
      />
    )
  }

  const myProfileScreenContent = () => {
    return (
      <>
        <LinearGradient colors={[theme.colors[appearance].grey,theme.colors[appearance].black]}  style={styles.container}>
          <StatusBar
          // backgroundColor={useDynamicValue('#ffffff', '#121212')}
          // barStyle={useDynamicValue('dark-content', 'light-content')}
          />
          <View style={styles.imageContainer}>
            <TNProfilePictureSelector
              setProfilePictureFile={setProfilePictureFile}
              profilePictureURL={profilePicture}
            />
          </View>
          <Text style={styles.userName}>{displayName()}</Text>
          {menuItems.map((menuItem, index) => {
            return renderMenuItem(menuItem, index)
          })}
          <Text onPress={onLogout} style={styles.logout}>
            {localized('Logout')}
          </Text>
        </LinearGradient>
      </>
    )
  }

  return <>{myProfileScreenContent()}</>
}

export default IMUserProfileComponent
