/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
///* eslint-disable */
import React, { useState } from 'react'
import { AppearanceProvider } from 'react-native-appearance'
import Amplify from '@aws-amplify/core'
import PubSub from '@aws-amplify/pubsub'
import * as Keychain from 'react-native-keychain'
import { AmplifyProvider } from 'aws-amplify-react-hooks'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import ReduxThunk from 'redux-thunk'
import { ThemeProvider, DarkTheme, LightTheme } from './theme'
import reducers from './reducers'
import AppNavigator from './AppNavigator'
import awsconfig from '../aws-exports'

const store = createStore(reducers, composeWithDevTools(applyMiddleware(ReduxThunk)))

const client = {
  Auth,
  API,
  graphqlOperation
}

AmplifyProvider(client)

const MEMORY_KEY_PREFIX = '@MyStorage:'
let dataMemory = {}

class MyStorage {
  static syncPromise = null

  static setItem(key, value) {
    Keychain.setGenericPassword(MEMORY_KEY_PREFIX + key, value)
    dataMemory[key] = value
    return dataMemory[key]
  }

  static getItem(key) {
    return Object.prototype.hasOwnProperty.call(dataMemory, key) ? dataMemory[key] : undefined
  }

  static removeItem(key) {
    Keychain.resetGenericPassword()
    return delete dataMemory[key]
  }

  static clear() {
    dataMemory = {}
    return dataMemory
  }
}

Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: false
  },
  storage: MyStorage
})

PubSub.configure(awsconfig)

const App: () => React$Node = () => {
  const [value] = useState(false)
  //const scheme = useColorScheme()
  const theme = value ? DarkTheme : LightTheme
  return (
    <>
      <AppearanceProvider>
        <AmplifyProvider client={client}>
          <Provider store={store}>
            <ThemeProvider theme={theme}>
              <AppNavigator />
            </ThemeProvider>
          </Provider>
        </AmplifyProvider>
      </AppearanceProvider>
    </>
  )
}

window.LOG_LEVEL = 'DEBUG'

export default App